# Soccer AI ⚽

## 💻 install

We don't have a Python package yet. Install from source in a
[**Python>=3.8**](https://www.python.org/) environment.

```bash
pip install -r requirements.txt
```

## ⚽ datasets

Original data comes from the [DFL - Bundesliga Data Shootout](https://www.kaggle.com/competitions/dfl-bundesliga-data-shootout)
Kaggle competition. This data has been processed to create new datasets, which can be
downloaded from the [Roboflow Universe](https://universe.roboflow.com/).

| use case                        | datasets                                                                                                                                                         |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| soccer player detection         | [![Download Dataset](https://app.roboflow.com/images/download-dataset-badge.svg)](https://universe.roboflow.com/roboflow-jvuqo/football-players-detection-3zvbc) |
| soccer ball detection           | [![Download Dataset](https://app.roboflow.com/images/download-dataset-badge.svg)](https://universe.roboflow.com/roboflow-jvuqo/football-ball-detection-rejhg)    |
| soccer pitch keypoint detection | [![Download Dataset](https://app.roboflow.com/images/download-dataset-badge.svg)](https://universe.roboflow.com/roboflow-jvuqo/football-field-detection-f07vi)   |

## 🤖 models

- [YOLOv8](https://docs.ultralytics.com/models/yolov8/) (Player Detection) - Detects
  players, goalkeepers, referees, and the ball in the video.
- [YOLOv8](https://docs.ultralytics.com/models/yolov8/) (Pitch Detection) - Identifies
  the soccer field boundaries and key points.
- [SigLIP](https://huggingface.co/docs/transformers/en/model_doc/siglip) - Extracts
  features from image crops of players.
- [UMAP](https://umap-learn.readthedocs.io/en/latest/) - Reduces the dimensionality of
  the extracted features for easier clustering.
- [KMeans](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) -
  Clusters the reduced-dimension features to classify players into two teams.

## 🛠️ modes

- `PITCH_DETECTION` - Detects the soccer field boundaries and key points in the video.
  Useful for identifying and visualizing the layout of the soccer pitch.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-pitch-detection.mp4 \
    --device mps --mode PITCH_DETECTION
  ```

  ```bash
  # Docker (example) - mounts repo root and runs inside container
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-pitch-detection.mp4 --device cpu --mode PITCH_DETECTION --docker"
  ```

- `PLAYER_DETECTION` - Detects players, goalkeepers, referees, and the ball in the
  video. Essential for identifying and tracking the presence of players and other
  entities on the field.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-player-detection.mp4 \
    --device mps --mode PLAYER_DETECTION
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-player-detection.mp4 --device cpu --mode PLAYER_DETECTION --docker"
  ```

- `BALL_DETECTION` - Detects the ball in the video frames and tracks its position.
  Useful for following ball movements throughout the match.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-ball-detection.mp4 \
    --device mps --mode BALL_DETECTION
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-ball-detection.mp4 --device cpu --mode BALL_DETECTION --docker"
  ```

- `HEATMAP` - Accumulates detected player positions, maps them to the pitch
  diagram using pitch keypoints, and renders a smoothed activity heatmap over the
  pitch which is overlaid on the output video. Useful to visualize areas of high
  player activity during the match.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../outdata/2e57b9_0-heatmap.mp4 \
    --device mps --mode HEATMAP
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../outdata/2e57b9_0-heatmap.mp4 --mode HEATMAP --device cpu --docker"
  ```

- `PLAYER_TRACKING` - Tracks players across video frames, maintaining consistent
  identification. Useful for following player movements and positions throughout the
  match.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-player-tracking.mp4 \
    --device mps --mode PLAYER_TRACKING
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-player-tracking.mp4 --device cpu --mode PLAYER_TRACKING --docker"
  ```

- `TEAM_CLASSIFICATION` - Classifies detected players into their respective teams based
  on their visual features. Helps differentiate between players of different teams for
  analysis and visualization.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-team-classification.mp4 \
    --device mps --mode TEAM_CLASSIFICATION
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-team-classification.mp4 --device cpu --mode TEAM_CLASSIFICATION --docker"
  ```

- `RADAR` - Combines pitch detection, player detection, tracking, and team
  classification to generate a radar-like visualization of player positions on the
  soccer field. Provides a comprehensive overview of player movements and team formations
  on the field.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-radar.mp4 \
    --device mps --mode RADAR
  ```

  ```bash
  # Docker (example)
  docker run --rm -v "$(pwd)/..:/workspace" -w /workspace/sports_football/soccer \
    --env OMP_NUM_THREADS=1 --env MKL_NUM_THREADS=1 python:3.10-slim \
    bash -lc "pip install -r ../requirements.txt && python3 main.py --source_video_path ../data/2e57b9_0.mp4 --target_video_path ../data/2e57b9_0-radar.mp4 --device cpu --mode RADAR --docker"
  ```

- `POSSESSION` - Tracks match ball possession times and percentages for both teams, displaying them on a custom semi-transparent card overlay.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-possession.mp4 \
    --device mps --mode POSSESSION
  ```

- `PASSES` - Tracks the number of completed passes for both teams, displaying them on a custom semi-transparent card overlay.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-passes.mp4 \
    --device mps --mode PASSES
  ```

- `POSSESSION_AND_PASSES` - Tracks both ball possession percentages and completed pass counts for both teams, displaying them together on a unified custom card.

  ```bash
  # Local
  python3 main.py --source_video_path ../data/2e57b9_0.mp4 \
    --target_video_path ../data/2e57b9_0-possession-and-passes.mp4 \
    --device mps --mode POSSESSION_AND_PASSES
  ```

## 🗺️ roadmap

- [ ] Add smoothing to eliminate flickering in RADAR mode.
- [ ] Add a notebook demonstrating how to save data and perform offline data analysis.

## © license

This demo integrates two main components, each with its own licensing:

- ultralytics: The object detection model used in this demo, YOLOv8, is distributed
  under the [AGPL-3.0 license](https://github.com/ultralytics/ultralytics/blob/main/LICENSE).
- sports: The analytics code that powers the sports analysis in this demo is based on
  the [Supervision](https://github.com/roboflow/supervision) library, which is licensed
  under the [MIT license](https://github.com/roboflow/supervision/blob/develop/LICENSE.md).
  This makes the sports part of the code fully open source and freely usable in your
  projects.
