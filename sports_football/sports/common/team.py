from typing import Generator, Iterable, List, TypeVar

# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import supervision as sv
# pyrefly: ignore [missing-import]
import torch
import umap
from sklearn.cluster import KMeans
from tqdm import tqdm
# pyrefly: ignore [missing-import]
from transformers import SiglipImageProcessor, SiglipVisionModel

V = TypeVar("V")

SIGLIP_MODEL_PATH = 'google/siglip-base-patch16-224'


def create_batches(
    sequence: Iterable[V], batch_size: int
) -> Generator[List[V], None, None]:
    """
    Generate batches from a sequence with a specified batch size.

    Args:
        sequence (Iterable[V]): The input sequence to be batched.
        batch_size (int): The size of each batch.

    Yields:
        Generator[List[V], None, None]: A generator yielding batches of the input
            sequence.
    """
    batch_size = max(batch_size, 1)
    current_batch = []
    for element in sequence:
        if len(current_batch) == batch_size:
            yield current_batch
            current_batch = []
        current_batch.append(element)
    if current_batch:
        yield current_batch


class TeamClassifier:
    """
    A classifier that uses a pre-trained SiglipVisionModel for feature extraction,
    UMAP for dimensionality reduction, and KMeans for clustering.
    """
    def __init__(self, device: str = 'cpu', batch_size: int = 32):
        """
       Initialize the TeamClassifier with device and batch size.

       Args:
           device (str): The device to run the model on ('cpu' or 'cuda').
           batch_size (int): The batch size for processing images.
       """
        self.device = device
        self.batch_size = batch_size
        self.features_model = SiglipVisionModel.from_pretrained(
            SIGLIP_MODEL_PATH).to(device)
        self.features_model.eval()
        # Team classification only embeds images. Creating the image processor
        # directly avoids loading SigLIP's unused text tokenizer (and its
        # SentencePiece dependency). These are SigLIP's default preprocessing
        # settings: 224px images normalized with mean/std of 0.5.
        self.processor = SiglipImageProcessor()
        self.reducer = umap.UMAP(n_components=3)
        self.cluster_model = KMeans(n_clusters=2)
        self.cache = {}

    def extract_features(self, crops: List[np.ndarray], show_progress: bool = False) -> np.ndarray:
        """
        Extract features from a list of image crops using the pre-trained
            SiglipVisionModel.

        Args:
            crops (List[np.ndarray]): List of image crops.
            show_progress (bool): Whether to show the progress bar.

        Returns:
            np.ndarray: Extracted features as a numpy array.
        """
        crops = [sv.cv2_to_pillow(crop) for crop in crops if crop.size]
        if not crops:
            return np.empty((0, 0), dtype=np.float32)
        batches = create_batches(crops, self.batch_size)
        data = []
        with torch.no_grad():
            for batch in tqdm(batches, desc='Embedding extraction', disable=not show_progress):
                inputs = self.processor(
                    images=batch, return_tensors="pt").to(self.device)
                outputs = self.features_model(**inputs)
                embeddings = torch.mean(outputs.last_hidden_state, dim=1).cpu().numpy()
                data.append(embeddings)

        return np.concatenate(data, axis=0)

    def fit(self, crops: List[np.ndarray]) -> None:
        """
        Fit the classifier model on a list of image crops.

        Args:
            crops (List[np.ndarray]): List of image crops.
        """
        data = self.extract_features(crops, show_progress=True)
        if len(data) < 2:
            raise ValueError(
                "At least two detected player crops are required to classify teams."
            )
        projections = self.reducer.fit_transform(data)
        self.cluster_model.fit(projections)

    def predict(self, crops: List[np.ndarray], tracker_ids: np.ndarray = None) -> np.ndarray:
        """
        Predict the cluster labels for a list of image crops.

        Args:
            crops (List[np.ndarray]): List of image crops.
            tracker_ids (np.ndarray): Optional tracker IDs for caching predictions.

        Returns:
            np.ndarray: Predicted cluster labels.
        """
        if len(crops) == 0:
            return np.array([])

        if tracker_ids is None or len(tracker_ids) != len(crops):
            data = self.extract_features(crops, show_progress=False)
            projections = self.reducer.transform(data)
            return self.cluster_model.predict(projections)

        # Cache lookup
        results = np.zeros(len(crops), dtype=np.int32)
        uncached_indices = []
        uncached_crops = []

        for idx, tid in enumerate(tracker_ids):
            if tid is not None and tid in self.cache:
                results[idx] = self.cache[tid]
            else:
                uncached_indices.append(idx)
                uncached_crops.append(crops[idx])

        if uncached_crops:
            data = self.extract_features(uncached_crops, show_progress=False)
            projections = self.reducer.transform(data)
            predictions = self.cluster_model.predict(projections)
            for idx, pred in zip(uncached_indices, predictions):
                results[idx] = pred
                tid = tracker_ids[idx]
                if tid is not None:
                    self.cache[tid] = pred

        return results
