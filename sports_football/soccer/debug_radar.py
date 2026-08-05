import sys
import os
import cv2
import numpy as np
import supervision as sv
from ultralytics import YOLO

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sports.annotators.soccer import draw_pitch, draw_points_on_pitch
from sports.common.team import TeamClassifier
from sports.common.view import ViewTransformer
from sports.configs.soccer import SoccerPitchConfiguration

PARENT_DIR = os.path.dirname(os.path.abspath(__file__))
PLAYER_DETECTION_MODEL_PATH = os.path.join(PARENT_DIR, '../data/football-player-detection.pt')
PITCH_DETECTION_MODEL_PATH = os.path.join(PARENT_DIR, '../data/football-pitch-detection.pt')

PLAYER_CLASS_ID = 2
GOALKEEPER_CLASS_ID = 1
REFEREE_CLASS_ID = 3
CONFIG = SoccerPitchConfiguration()
COLORS = ['#FF1493', '#00BFFF', '#FF6347', '#FFD700']

def resolve_goalkeepers_team_id(players, players_team_id, goalkeepers):
    if len(goalkeepers) == 0:
        return np.array([], dtype=np.int32)
    if len(players) == 0:
        return np.array([0] * len(goalkeepers), dtype=np.int32)
    
    goalkeepers_xy = goalkeepers.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
    players_xy = players.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
    
    team_0 = players_xy[players_team_id == 0]
    team_1 = players_xy[players_team_id == 1]
    
    if len(team_0) == 0:
        return np.array([1] * len(goalkeepers), dtype=np.int32)
    if len(team_1) == 0:
        return np.array([0] * len(goalkeepers), dtype=np.int32)
        
    team_0_centroid = team_0.mean(axis=0)
    team_1_centroid = team_1.mean(axis=0)
    goalkeepers_team_id = []
    for goalkeeper_xy in goalkeepers_xy:
        dist_0 = np.linalg.norm(goalkeeper_xy - team_0_centroid)
        dist_1 = np.linalg.norm(goalkeeper_xy - team_1_centroid)
        goalkeepers_team_id.append(0 if dist_0 < dist_1 else 1)
    return np.array(goalkeepers_team_id)

def get_crops(frame: np.ndarray, detections: sv.Detections):
    crops = []
    for xyxy in detections.xyxy:
        crop = sv.crop_image(frame, xyxy)
        if not crop.size:
            crop = np.zeros((1, 1, 3), dtype=frame.dtype)
        crops.append(crop)
    return crops

def debug():
    device = 'cpu'
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    pitch_detection_model = YOLO(PITCH_DETECTION_MODEL_PATH).to(device=device)
    
    video_path = "../data/2e57b9_0.mp4"
    frame_generator = sv.get_video_frames_generator(source_path=video_path, stride=60)
    
    # Fit the classifier
    crops = []
    print("Collecting crops for fitting...")
    for frame in frame_generator:
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        crops += get_crops(frame, detections[detections.class_id == PLAYER_CLASS_ID])
        
    team_classifier = TeamClassifier(device=device)
    team_classifier.fit(crops)
    print("Classifier fitted successfully.")
    
    # Process the first frame and render radar
    frame_generator = sv.get_video_frames_generator(source_path=video_path)
    frame = next(iter(frame_generator))
    
    # 1. Pitch keypoints
    pitch_result = pitch_detection_model(frame, verbose=False)[0]
    keypoints = sv.KeyPoints.from_ultralytics(pitch_result)
    mask = (keypoints.xy[0][:, 0] > 1) & (keypoints.xy[0][:, 1] > 1)
    
    # 2. Player detections
    player_result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
    detections = sv.Detections.from_ultralytics(player_result)
    
    players = detections[detections.class_id == PLAYER_CLASS_ID]
    crops = get_crops(frame, players)
    players_team_id = team_classifier.predict(crops)
    
    goalkeepers = detections[detections.class_id == GOALKEEPER_CLASS_ID]
    goalkeepers_team_id = resolve_goalkeepers_team_id(players, players_team_id, goalkeepers)
    
    referees = detections[detections.class_id == REFEREE_CLASS_ID]
    
    all_detections = sv.Detections.merge([players, goalkeepers, referees])
    color_lookup = np.array(
        players_team_id.tolist() +
        goalkeepers_team_id.tolist() +
        [REFEREE_CLASS_ID] * len(referees)
    )
    
    print("Color lookup array:")
    print(color_lookup)
    
    if mask.sum() >= 4:
        transformer = ViewTransformer(
            source=keypoints.xy[0][mask].astype(np.float32),
            target=np.array(CONFIG.vertices)[mask].astype(np.float32)
        )
        xy = all_detections.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
        transformed_xy = transformer.transform_points(points=xy)
        
        # Test how draw_points_on_pitch behaves
        radar = draw_pitch(config=CONFIG)
        print(f"Initial radar shape: {radar.shape}")
        
        # Count non-zero points
        print(f"Points for team 0 (size): {len(transformed_xy[color_lookup == 0])}")
        print(f"Points for team 1 (size): {len(transformed_xy[color_lookup == 1])}")
        print(f"Points for referee (size): {len(transformed_xy[color_lookup == 3])}")
        
        # Render them
        radar = draw_points_on_pitch(
            config=CONFIG, xy=transformed_xy[color_lookup == 0],
            face_color=sv.Color.from_hex(COLORS[0]), radius=20, pitch=radar)
        
        # Check if the pixels in the radar image actually changed from green (background)
        # Background color: sv.Color(34, 139, 34) -> BGR: (34, 139, 34)
        changed_pixels = np.sum((radar[:, :, 0] != 34) | (radar[:, :, 1] != 139) | (radar[:, :, 2] != 34))
        print(f"Number of non-background pixels in radar image: {changed_pixels}")
        
        # Let's check some values of transformed_xy[color_lookup == 0]
        print("Transformed xy for Team 0:")
        print(transformed_xy[color_lookup == 0])
        
    else:
        print("Less than 4 keypoints detected!")

if __name__ == '__main__':
    debug()
