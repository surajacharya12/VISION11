import argparse
from enum import Enum
from typing import Iterator, List

import os
import cv2
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import supervision as sv
from tqdm import tqdm
# pyrefly: ignore [missing-import]
from ultralytics import YOLO

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sports.annotators.soccer import draw_pitch, draw_points_on_pitch
from sports.common.ball import BallTracker, BallAnnotator
from sports.common.team import TeamClassifier
from sports.common.view import ViewTransformer
from sports.configs.soccer import SoccerPitchConfiguration


PARENT_DIR = os.path.dirname(os.path.abspath(__file__))
PLAYER_DETECTION_MODEL_PATH=os.path.join(PARENT_DIR, '../data/football-player-detection.pt')
PITCH_DETECTION_MODEL_PATH=os.path.join(PARENT_DIR, '../data/football-pitch-detection.pt')
BALL_DETECTION_MODEL_PATH=os.path.join(PARENT_DIR, '../data/football-ball-detection.pt')


BALL_CLASS_ID = 0
GOALKEEPER_CLASS_ID = 1
PLAYER_CLASS_ID = 2
REFEREE_CLASS_ID = 3

STRIDE = 60
CONFIG = SoccerPitchConfiguration()

COLORS = ['#FF1493', '#00BFFF', '#FF6347', '#FFD700']
VERTEX_LABEL_ANNOTATOR = sv.VertexLabelAnnotator(
    color=[sv.Color.from_hex(color) for color in CONFIG.colors],
    text_color=sv.Color.from_hex('#FFFFFF'),
    border_radius=5,
    text_thickness=1,
    text_scale=0.5,
    text_padding=5,
)
EDGE_ANNOTATOR = sv.EdgeAnnotator(
    color=sv.Color.from_hex('#FF1493'),
    thickness=2,
    edges=CONFIG.edges,
)
TRIANGLE_ANNOTATOR = sv.TriangleAnnotator(
    color=sv.Color.from_hex('#FF1493'),
    base=20,
    height=15,
)
BOX_ANNOTATOR = sv.BoxAnnotator(
    color=sv.ColorPalette.from_hex(COLORS),
    thickness=2
)
ELLIPSE_ANNOTATOR = sv.EllipseAnnotator(
    color=sv.ColorPalette.from_hex(COLORS),
    thickness=2
)
BOX_LABEL_ANNOTATOR = sv.LabelAnnotator(
    color=sv.ColorPalette.from_hex(COLORS),
    text_color=sv.Color.from_hex('#FFFFFF'),
    text_padding=5,
    text_thickness=1,
)
ELLIPSE_LABEL_ANNOTATOR = sv.LabelAnnotator(
    color=sv.ColorPalette.from_hex(COLORS),
    text_color=sv.Color.from_hex('#FFFFFF'),
    text_padding=5,
    text_thickness=1,
    text_position=sv.Position.BOTTOM_CENTER,
)


class Mode(Enum):
    """
    Enum class representing different modes of operation for Soccer AI video analysis.
    """
    PITCH_DETECTION = 'PITCH_DETECTION'
    PLAYER_DETECTION = 'PLAYER_DETECTION'
    BALL_DETECTION = 'BALL_DETECTION'
    PLAYER_TRACKING = 'PLAYER_TRACKING'
    TEAM_CLASSIFICATION = 'TEAM_CLASSIFICATION'
    RADAR = 'RADAR'
    HEATMAP = 'HEATMAP'
    POSSESSION = 'POSSESSION'
    PASSES = 'PASSES'
    POSSESSION_AND_PASSES = 'POSSESSION_AND_PASSES'



def get_crops(frame: np.ndarray, detections: sv.Detections) -> List[np.ndarray]:
    """
    Extract crops from the frame based on detected bounding boxes.

    Args:
        frame (np.ndarray): The frame from which to extract crops.
        detections (sv.Detections): Detected objects with bounding boxes.

    Returns:
        List[np.ndarray]: List of cropped images.
    """
    crops = []
    for xyxy in detections.xyxy:
        crop = sv.crop_image(frame, xyxy)
        # Keep one crop for every detection so classifier outputs remain aligned
        # with the detection and tracker arrays.
        if not crop.size:
            crop = np.zeros((1, 1, 3), dtype=frame.dtype)
        crops.append(crop)
    return crops


def resolve_goalkeepers_team_id(
    players: sv.Detections,
    players_team_id: np.array,
    goalkeepers: sv.Detections
) -> np.ndarray:
    """
    Resolve the team IDs for detected goalkeepers based on the proximity to team
    centroids.

    Args:
        players (sv.Detections): Detections of all players.
        players_team_id (np.array): Array containing team IDs of detected players.
        goalkeepers (sv.Detections): Detections of goalkeepers.

    Returns:
        np.ndarray: Array containing team IDs for the detected goalkeepers.

    This function calculates the centroids of the two teams based on the positions of
    the players. Then, it assigns each goalkeeper to the nearest team's centroid by
    calculating the distance between each goalkeeper and the centroids of the two teams.
    """
    goalkeepers_xy = goalkeepers.get_anchors_coordinates(sv.Position.BOTTOM_CENTER)
    players_xy = players.get_anchors_coordinates(sv.Position.BOTTOM_CENTER)
    team_0 = players_xy[players_team_id == 0]
    team_1 = players_xy[players_team_id == 1]
    if len(team_0) == 0 or len(team_1) == 0:
        # A partial frame is common around cuts. Keep rendering instead of
        # producing NaNs from an empty centroid.
        return np.zeros(len(goalkeepers), dtype=int)

    team_0_centroid = team_0.mean(axis=0)
    team_1_centroid = team_1.mean(axis=0)
    goalkeepers_team_id = []
    for goalkeeper_xy in goalkeepers_xy:
        dist_0 = np.linalg.norm(goalkeeper_xy - team_0_centroid)
        dist_1 = np.linalg.norm(goalkeeper_xy - team_1_centroid)
        goalkeepers_team_id.append(0 if dist_0 < dist_1 else 1)
    return np.array(goalkeepers_team_id)


def render_radar(
    detections: sv.Detections,
    keypoints: sv.KeyPoints,
    color_lookup: np.ndarray
) -> np.ndarray:
    if len(keypoints) == 0 or keypoints.xy is None or len(keypoints.xy) == 0:
        return draw_pitch(config=CONFIG)
    mask = (keypoints.xy[0][:, 0] > 1) & (keypoints.xy[0][:, 1] > 1)
    if mask.sum() < 4:
        return draw_pitch(config=CONFIG)
    transformer = ViewTransformer(
        source=keypoints.xy[0][mask].astype(np.float32),
        target=np.array(CONFIG.vertices)[mask].astype(np.float32)
    )
    xy = detections.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
    transformed_xy = transformer.transform_points(points=xy)

    radar = draw_pitch(config=CONFIG)
    radar = draw_points_on_pitch(
        config=CONFIG, xy=transformed_xy[color_lookup == 0],
        face_color=sv.Color.from_hex(COLORS[0]), radius=20, pitch=radar)
    radar = draw_points_on_pitch(
        config=CONFIG, xy=transformed_xy[color_lookup == 1],
        face_color=sv.Color.from_hex(COLORS[1]), radius=20, pitch=radar)
    radar = draw_points_on_pitch(
        config=CONFIG, xy=transformed_xy[color_lookup == 2],
        face_color=sv.Color.from_hex(COLORS[2]), radius=20, pitch=radar)
    radar = draw_points_on_pitch(
        config=CONFIG, xy=transformed_xy[color_lookup == 3],
        face_color=sv.Color.from_hex(COLORS[3]), radius=20, pitch=radar)
    return radar


def render_heatmap(
    detections: sv.Detections,
    keypoints: sv.KeyPoints,
    color_lookup: np.ndarray,
    accumulated_xy_team_0: List[np.ndarray],
    accumulated_xy_team_1: List[np.ndarray]
) -> np.ndarray:
    radar = draw_pitch(config=CONFIG)
    if len(keypoints) == 0 or keypoints.xy is None or len(keypoints.xy) == 0:
        return radar
    mask = (keypoints.xy[0][:, 0] > 1) & (keypoints.xy[0][:, 1] > 1)
    if mask.sum() < 4:
        return radar
    transformer = ViewTransformer(
        source=keypoints.xy[0][mask].astype(np.float32),
        target=np.array(CONFIG.vertices)[mask].astype(np.float32)
    )
    xy = detections.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
    transformed_xy = transformer.transform_points(points=xy)

    # Accumulate points
    if len(transformed_xy[color_lookup == 0]) > 0:
        accumulated_xy_team_0.append(transformed_xy[color_lookup == 0])
    if len(transformed_xy[color_lookup == 1]) > 0:
        accumulated_xy_team_1.append(transformed_xy[color_lookup == 1])

    h, w, _ = radar.shape
    
    # Create a single float32 density map
    density_map = np.zeros((h, w), dtype=np.float32)
    
    # Accumulate all points onto the density map (combining both teams for overall activity)
    for pts_array in accumulated_xy_team_0 + accumulated_xy_team_1:
        for pt in pts_array:
            # Scale and pad points identical to draw_points_on_pitch defaults
            x = int(pt[0] * 0.1) + 50
            y = int(pt[1] * 0.1) + 50
            if 0 <= x < w and 0 <= y < h:
                # Draw small base intensity for each point
                cv2.circle(density_map, (x, y), 15, 1.0, -1)
            
    # Apply Gaussian blur for smoothness
    if np.max(density_map) > 0:
        # Large kernel for smooth distribution
        density_map = cv2.GaussianBlur(density_map, (101, 101), 0)
        
        # Normalize to 0-255
        density_map = cv2.normalize(density_map, None, 0, 255, cv2.NORM_MINMAX)
        density_map = np.uint8(density_map)
        
        # Apply Jet colormap (Blue -> Green -> Red)
        heatmap_colored = cv2.applyColorMap(density_map, cv2.COLORMAP_JET)
        
        # Create an alpha mask based on density so low-density (blue) is more transparent
        alpha = density_map.astype(float) / 255.0
        # Boost alpha slightly to make colors pop, but keep low values transparent
        alpha = np.clip(alpha * 1.5, 0, 1)
        alpha = np.repeat(alpha[:, :, np.newaxis], 3, axis=2)
        
        # Blend the heatmap over the original radar pitch
        radar = (heatmap_colored * alpha + radar * (1 - alpha)).astype(np.uint8)
        
    return radar


def hex_to_bgr(hex_str: str) -> tuple:
    hex_str = hex_str.lstrip('#')
    rgb = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    return (rgb[2], rgb[1], rgb[0])


def draw_custom_card(
    frame: np.ndarray,
    possession_0: int,
    possession_1: int,
    passes_0: int,
    passes_1: int,
    team_0_color_hex: str,
    team_1_color_hex: str,
    show_possession: bool = True,
    show_passes: bool = True,
) -> np.ndarray:
    c0 = hex_to_bgr(team_0_color_hex)
    c1 = hex_to_bgr(team_1_color_hex)
    
    if show_possession and show_passes:
        card_h = 220
    else:
        card_h = 140

    h, w, _ = frame.shape
    card_w = 340
    x1, y1 = w - card_w - 40, 40
    x2, y2 = w - 40, y1 + card_h
    
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (20, 20, 20), -1)
    cv2.rectangle(overlay, (x1, y1), (x2, y2), (200, 200, 200), 2)
    
    alpha = 0.8
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, dst=frame)
    
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(frame, "MATCH ANALYTICS", (x1 + 20, y1 + 35), font, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    current_y = y1 + 75
    
    if show_possession:
        total_poss = possession_0 + possession_1
        if total_poss == 0:
            pct_0, pct_1 = 50, 50
        else:
            pct_0 = int(round(possession_0 / total_poss * 100))
            pct_1 = 100 - pct_0

        cv2.putText(frame, "POSSESSION", (x1 + 20, current_y), font, 0.5, (180, 180, 180), 1, cv2.LINE_AA)
        cv2.putText(frame, f"{pct_0}%", (x1 + 20, current_y + 20), font, 0.6, c0, 2, cv2.LINE_AA)
        cv2.putText(frame, f"{pct_1}%", (x2 - 60, current_y + 20), font, 0.6, c1, 2, cv2.LINE_AA)
        
        bar_x = x1 + 20
        bar_y = current_y + 30
        bar_w = card_w - 40
        bar_h = 10
        
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h), (50, 50, 50), -1)
        split_w = int(bar_w * (pct_0 / 100.0))
        if split_w > 0:
            cv2.rectangle(frame, (bar_x, bar_y), (bar_x + split_w, bar_y + bar_h), c0, -1)
        if bar_w - split_w > 0:
            cv2.rectangle(frame, (bar_x + split_w, bar_y), (bar_x + bar_w, bar_y + bar_h), c1, -1)
            
        current_y += 70
        
    if show_passes:
        cv2.putText(frame, "COMPLETED PASSES", (x1 + 20, current_y), font, 0.5, (180, 180, 180), 1, cv2.LINE_AA)
        cv2.putText(frame, f"{passes_0}", (x1 + 20, current_y + 20), font, 0.6, c0, 2, cv2.LINE_AA)
        cv2.putText(frame, f"{passes_1}", (x2 - 40, current_y + 20), font, 0.6, c1, 2, cv2.LINE_AA)
        
        total_passes = passes_0 + passes_1
        if total_passes == 0:
            pass_ratio = 0.5
        else:
            pass_ratio = passes_0 / total_passes
            
        bar_x = x1 + 20
        pbar_y = current_y + 30
        bar_w = card_w - 40
        pbar_h = 10
        
        cv2.rectangle(frame, (bar_x, pbar_y), (bar_x + bar_w, pbar_y + pbar_h), (50, 50, 50), -1)
        psplit_w = int(bar_w * pass_ratio)
        if psplit_w > 0:
            cv2.rectangle(frame, (bar_x, pbar_y), (bar_x + psplit_w, pbar_y + pbar_h), c0, -1)
        if bar_w - psplit_w > 0:
            cv2.rectangle(frame, (bar_x + psplit_w, pbar_y), (bar_x + bar_w, pbar_y + pbar_h), c1, -1)
            
    return frame


def run_possession_and_passes(
    source_video_path: str,
    device: str,
    show_possession: bool = True,
    show_passes: bool = True,
) -> Iterator[np.ndarray]:
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    pitch_device = 'cpu' if device == 'mps' else device
    pitch_detection_model = YOLO(PITCH_DETECTION_MODEL_PATH).to(device=pitch_device)
    ball_detection_model = YOLO(BALL_DETECTION_MODEL_PATH).to(device=device)
    frame_generator = sv.get_video_frames_generator(
        source_path=source_video_path, stride=STRIDE)

    crops = []
    for frame in tqdm(frame_generator, desc='collecting crops'):
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        crops += get_crops(frame, detections[detections.class_id == PLAYER_CLASS_ID])

    team_classifier = TeamClassifier(device=device)
    team_classifier.fit(crops)

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    tracker = sv.ByteTrack(minimum_consecutive_frames=3)
    ball_tracker = BallTracker(buffer_size=20)
    ball_annotator = BallAnnotator(radius=6, buffer_size=10)

    def ball_callback(image_slice: np.ndarray) -> sv.Detections:
        result = ball_detection_model(image_slice, imgsz=640, verbose=False)[0]
        return sv.Detections.from_ultralytics(result)

    slicer = sv.InferenceSlicer(
        callback=ball_callback,
        overlap_filter=sv.OverlapFilter.NONE,
        slice_wh=(640, 640),
    )

    possession_duration_0 = 0
    possession_duration_1 = 0
    current_candidate_team = None
    possession_counter = 0
    team_possession = None
    possession_threshold = 20
    ball_distance_threshold = 45

    # Pass tracking
    last_player_with_ball = None
    init_player_with_ball = None
    player_with_ball_counter = 0
    player_with_ball_threshold = 3
    player_with_ball_threshold_dif_team = 4
    passes_count = [0, 0]

    for frame in frame_generator:
        pitch_result = pitch_detection_model(frame, verbose=False)[0]
        keypoints = sv.KeyPoints.from_ultralytics(pitch_result)

        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = tracker.update_with_detections(detections)

        ball_detections = slicer(frame).with_nms(threshold=0.1)
        ball_detections = ball_tracker.update(ball_detections)

        players = detections[detections.class_id == PLAYER_CLASS_ID]
        crops = get_crops(frame, players)
        players_team_id = team_classifier.predict(crops, players.tracker_id)

        goalkeepers = detections[detections.class_id == GOALKEEPER_CLASS_ID]
        goalkeepers_team_id = resolve_goalkeepers_team_id(
            players, players_team_id, goalkeepers)

        referees = detections[detections.class_id == REFEREE_CLASS_ID]

        all_detections = sv.Detections.merge([players, goalkeepers, referees])
        color_lookup = np.array(
            players_team_id.tolist() +
            goalkeepers_team_id.tolist() +
            [REFEREE_CLASS_ID] * len(referees)
        )
        tracker_ids = all_detections.tracker_id
        labels = (
            [str(tracker_id) for tracker_id in tracker_ids]
            if tracker_ids is not None
            else ["" for _ in range(len(all_detections))]
        )

        annotated_frame = frame.copy()
        annotated_frame = ELLIPSE_ANNOTATOR.annotate(
            annotated_frame, all_detections, custom_color_lookup=color_lookup)
        annotated_frame = ELLIPSE_LABEL_ANNOTATOR.annotate(
            annotated_frame, all_detections, labels, custom_color_lookup=color_lookup)

        if len(ball_detections) > 0:
            annotated_frame = ball_annotator.annotate(annotated_frame, ball_detections)

        ball_xy = ball_detections.get_anchors_coordinates(sv.Position.CENTER) if len(ball_detections) > 0 else np.array([])
        if len(ball_xy) > 0 and tracker_ids is not None:
            ball_center = ball_xy[0]
            player_info_list = []
            
            players_xyxy = players.xyxy
            players_tracker_ids = players.tracker_id
            if players_tracker_ids is not None:
                for idx, tid in enumerate(players_tracker_ids):
                    if tid is not None:
                        player_info_list.append((tid, players_team_id[idx], players_xyxy[idx]))
                    
            goalkeepers_xyxy = goalkeepers.xyxy
            goalkeepers_tracker_ids = goalkeepers.tracker_id
            if goalkeepers_tracker_ids is not None:
                for idx, tid in enumerate(goalkeepers_tracker_ids):
                    if tid is not None:
                        player_info_list.append((tid, goalkeepers_team_id[idx], goalkeepers_xyxy[idx]))

            closest_tid = None
            closest_team = None
            closest_player_bbox = None
            min_dist = float('inf')
            
            for tid, team_id, bbox in player_info_list:
                x1, y1, x2, y2 = bbox
                left_foot = np.array([x1, y2])
                right_foot = np.array([x2, y2])
                d_left = np.linalg.norm(ball_center - left_foot)
                d_right = np.linalg.norm(ball_center - right_foot)
                dist = min(d_left, d_right)
                if dist < min_dist:
                    min_dist = dist
                    closest_tid = tid
                    closest_team = team_id
                    closest_player_bbox = bbox

            if min_dist < ball_distance_threshold and closest_tid is not None:
                if closest_team != current_candidate_team:
                    possession_counter = 0
                    current_candidate_team = closest_team
                possession_counter += 1
                if possession_counter >= possession_threshold and current_candidate_team is not None:
                    team_possession = current_candidate_team

                if init_player_with_ball == closest_tid:
                    player_with_ball_counter += 1
                else:
                    player_with_ball_counter = 0
                    init_player_with_ball = closest_tid

                if player_with_ball_counter >= player_with_ball_threshold:
                    if last_player_with_ball is not None:
                        last_tid, last_team = last_player_with_ball
                        if last_tid != closest_tid and last_team == closest_team and closest_team is not None:
                            passes_count[closest_team] += 1
                            last_player_with_ball = (closest_tid, closest_team)
                        else:
                            if player_with_ball_counter >= player_with_ball_threshold_dif_team:
                                last_player_with_ball = (closest_tid, closest_team)
                    else:
                        last_player_with_ball = (closest_tid, closest_team)

                x1, y1, x2, y2 = closest_player_bbox
                t_x3 = int(0.5 * x1 + 0.5 * x2)
                t_y3 = int(y1 - 7)
                t_x1 = int(t_x3 - 10)
                t_y1 = int(t_y3 - 15)
                t_x2 = int(t_x3 + 10)
                t_y2 = int(t_y3 - 15)
                pts = np.array([[t_x1, t_y1], [t_x2, t_y2], [t_x3, t_y3]], np.int32)
                color_hex = COLORS[closest_team] if closest_team is not None else '#FFFFFF'
                color_bgr = hex_to_bgr(color_hex)
                cv2.drawContours(annotated_frame, [pts], 0, color_bgr, -1)
                cv2.polylines(annotated_frame, [pts], True, (0, 0, 0), 1)

        if team_possession == 0:
            possession_duration_0 += 1
        elif team_possession == 1:
            possession_duration_1 += 1

        # Render and overlay the radar pitch
        h, w, _ = frame.shape
        radar = render_radar(all_detections, keypoints, color_lookup)
        radar = sv.resize_image(radar, (w // 2, h // 2))
        radar_h, radar_w, _ = radar.shape
        rect = sv.Rect(
            x=w // 2 - radar_w // 2,
            y=h - radar_h,
            width=radar_w,
            height=radar_h
        )
        annotated_frame = sv.draw_image(annotated_frame, radar, opacity=0.5, rect=rect)

        annotated_frame = draw_custom_card(
            annotated_frame,
            possession_duration_0,
            possession_duration_1,
            passes_count[0],
            passes_count[1],
            COLORS[0],
            COLORS[1],
            show_possession=show_possession,
            show_passes=show_passes,
        )
        yield annotated_frame


def run_pitch_detection(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    """
    Run pitch detection on a video and yield annotated frames.

    Args:
        source_video_path (str): Path to the source video.
        device (str): Device to run the model on (e.g., 'cpu', 'cuda').

    Yields:
        Iterator[np.ndarray]: Iterator over annotated frames.
    """
    pitch_device = 'cpu' if device == 'mps' else device
    pitch_detection_model = YOLO(PITCH_DETECTION_MODEL_PATH).to(device=pitch_device)
    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    for frame in frame_generator:
        result = pitch_detection_model(frame, verbose=False)[0]
        keypoints = sv.KeyPoints.from_ultralytics(result)

        annotated_frame = frame.copy()
        annotated_frame = VERTEX_LABEL_ANNOTATOR.annotate(
            annotated_frame, keypoints, CONFIG.labels)
        yield annotated_frame


def run_player_detection(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    """
    Run player detection on a video and yield annotated frames.

    Args:
        source_video_path (str): Path to the source video.
        device (str): Device to run the model on (e.g., 'cpu', 'cuda').

    Yields:
        Iterator[np.ndarray]: Iterator over annotated frames.
    """
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    for frame in frame_generator:
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)

        annotated_frame = frame.copy()
        annotated_frame = BOX_ANNOTATOR.annotate(annotated_frame, detections)
        annotated_frame = BOX_LABEL_ANNOTATOR.annotate(annotated_frame, detections)
        yield annotated_frame


def run_ball_detection(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    """
    Run ball detection on a video and yield annotated frames.

    Args:
        source_video_path (str): Path to the source video.
        device (str): Device to run the model on (e.g., 'cpu', 'cuda').

    Yields:
        Iterator[np.ndarray]: Iterator over annotated frames.
    """
    ball_detection_model = YOLO(BALL_DETECTION_MODEL_PATH).to(device=device)
    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    ball_tracker = BallTracker(buffer_size=20)
    ball_annotator = BallAnnotator(radius=6, buffer_size=10)

    def callback(image_slice: np.ndarray) -> sv.Detections:
        result = ball_detection_model(image_slice, imgsz=640, verbose=False)[0]
        return sv.Detections.from_ultralytics(result)

    slicer = sv.InferenceSlicer(
        callback=callback,
        overlap_filter=sv.OverlapFilter.NONE,
        slice_wh=(640, 640),
    )

    for frame in frame_generator:
        detections = slicer(frame).with_nms(threshold=0.1)
        detections = ball_tracker.update(detections)
        annotated_frame = frame.copy()
        annotated_frame = ball_annotator.annotate(annotated_frame, detections)
        yield annotated_frame


def run_player_tracking(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    """
    Run player tracking on a video and yield annotated frames with tracked players.

    Args:
        source_video_path (str): Path to the source video.
        device (str): Device to run the model on (e.g., 'cpu', 'cuda').

    Yields:
        Iterator[np.ndarray]: Iterator over annotated frames.
    """
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    tracker = sv.ByteTrack(minimum_consecutive_frames=3)
    for frame in frame_generator:
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = tracker.update_with_detections(detections)

        # ByteTrack may not assign IDs on frames without confirmed tracks.
        # Keep one blank label per detection for the annotator in that case.
        tracker_ids = detections.tracker_id
        labels = (
            [str(tracker_id) for tracker_id in tracker_ids]
            if tracker_ids is not None
            else ["" for _ in range(len(detections))]
        )

        annotated_frame = frame.copy()
        annotated_frame = ELLIPSE_ANNOTATOR.annotate(annotated_frame, detections)
        annotated_frame = ELLIPSE_LABEL_ANNOTATOR.annotate(
            annotated_frame, detections, labels=labels)
        yield annotated_frame


def run_team_classification(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    """
    Run team classification on a video and yield annotated frames with team colors.

    Args:
        source_video_path (str): Path to the source video.
        device (str): Device to run the model on (e.g., 'cpu', 'cuda').

    Yields:
        Iterator[np.ndarray]: Iterator over annotated frames.
    """
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    frame_generator = sv.get_video_frames_generator(
        source_path=source_video_path, stride=STRIDE)

    crops = []
    for frame in tqdm(frame_generator, desc='collecting crops'):
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        crops += get_crops(frame, detections[detections.class_id == PLAYER_CLASS_ID])

    team_classifier = TeamClassifier(device=device)
    team_classifier.fit(crops)

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    tracker = sv.ByteTrack(minimum_consecutive_frames=3)
    for frame in frame_generator:
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = tracker.update_with_detections(detections)

        players = detections[detections.class_id == PLAYER_CLASS_ID]
        crops = get_crops(frame, players)
        players_team_id = team_classifier.predict(crops, players.tracker_id)

        goalkeepers = detections[detections.class_id == GOALKEEPER_CLASS_ID]
        goalkeepers_team_id = resolve_goalkeepers_team_id(
            players, players_team_id, goalkeepers)

        referees = detections[detections.class_id == REFEREE_CLASS_ID]

        detections = sv.Detections.merge([players, goalkeepers, referees])
        color_lookup = np.array(
                players_team_id.tolist() +
                goalkeepers_team_id.tolist() +
                [REFEREE_CLASS_ID] * len(referees)
        )
        tracker_ids = detections.tracker_id
        labels = (
            [str(tracker_id) for tracker_id in tracker_ids]
            if tracker_ids is not None
            else ["" for _ in range(len(detections))]
        )

        annotated_frame = frame.copy()
        annotated_frame = ELLIPSE_ANNOTATOR.annotate(
            annotated_frame, detections, custom_color_lookup=color_lookup)
        annotated_frame = ELLIPSE_LABEL_ANNOTATOR.annotate(
            annotated_frame, detections, labels, custom_color_lookup=color_lookup)
        yield annotated_frame


def run_radar(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    pitch_device = 'cpu' if device == 'mps' else device
    pitch_detection_model = YOLO(PITCH_DETECTION_MODEL_PATH).to(device=pitch_device)
    frame_generator = sv.get_video_frames_generator(
        source_path=source_video_path, stride=STRIDE)

    crops = []
    for frame in tqdm(frame_generator, desc='collecting crops'):
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        crops += get_crops(frame, detections[detections.class_id == PLAYER_CLASS_ID])

    team_classifier = TeamClassifier(device=device)
    team_classifier.fit(crops)

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    tracker = sv.ByteTrack(minimum_consecutive_frames=3)
    for frame in frame_generator:
        result = pitch_detection_model(frame, verbose=False)[0]
        keypoints = sv.KeyPoints.from_ultralytics(result)
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = tracker.update_with_detections(detections)

        players = detections[detections.class_id == PLAYER_CLASS_ID]
        crops = get_crops(frame, players)
        players_team_id = team_classifier.predict(crops, players.tracker_id)

        goalkeepers = detections[detections.class_id == GOALKEEPER_CLASS_ID]
        goalkeepers_team_id = resolve_goalkeepers_team_id(
            players, players_team_id, goalkeepers)

        referees = detections[detections.class_id == REFEREE_CLASS_ID]

        detections = sv.Detections.merge([players, goalkeepers, referees])
        color_lookup = np.array(
            players_team_id.tolist() +
            goalkeepers_team_id.tolist() +
            [REFEREE_CLASS_ID] * len(referees)
        )
        # A frame can contain detections before ByteTrack confirms an ID.
        # Use blank labels until IDs are available.
        tracker_ids = detections.tracker_id
        labels = (
            [str(tracker_id) for tracker_id in tracker_ids]
            if tracker_ids is not None
            else ["" for _ in range(len(detections))]
        )

        annotated_frame = frame.copy()
        annotated_frame = ELLIPSE_ANNOTATOR.annotate(
            annotated_frame, detections, custom_color_lookup=color_lookup)
        annotated_frame = ELLIPSE_LABEL_ANNOTATOR.annotate(
            annotated_frame, detections, labels,
            custom_color_lookup=color_lookup)

        h, w, _ = frame.shape
        radar = render_radar(detections, keypoints, color_lookup)
        radar = sv.resize_image(radar, (w // 2, h // 2))
        radar_h, radar_w, _ = radar.shape
        rect = sv.Rect(
            x=w // 2 - radar_w // 2,
            y=h - radar_h,
            width=radar_w,
            height=radar_h
        )
        annotated_frame = sv.draw_image(annotated_frame, radar, opacity=0.5, rect=rect)
        yield annotated_frame


def run_heatmap(source_video_path: str, device: str) -> Iterator[np.ndarray]:
    player_detection_model = YOLO(PLAYER_DETECTION_MODEL_PATH).to(device=device)
    pitch_device = 'cpu' if device == 'mps' else device
    pitch_detection_model = YOLO(PITCH_DETECTION_MODEL_PATH).to(device=pitch_device)
    frame_generator = sv.get_video_frames_generator(
        source_path=source_video_path, stride=STRIDE)

    crops = []
    for frame in tqdm(frame_generator, desc='collecting crops'):
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        crops += get_crops(frame, detections[detections.class_id == PLAYER_CLASS_ID])

    team_classifier = TeamClassifier(device=device)
    team_classifier.fit(crops)

    frame_generator = sv.get_video_frames_generator(source_path=source_video_path)
    tracker = sv.ByteTrack(minimum_consecutive_frames=3)
    
    accumulated_xy_team_0 = []
    accumulated_xy_team_1 = []
    
    for frame in frame_generator:
        result = pitch_detection_model(frame, verbose=False)[0]
        keypoints = sv.KeyPoints.from_ultralytics(result)
        result = player_detection_model(frame, imgsz=1280, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = tracker.update_with_detections(detections)

        players = detections[detections.class_id == PLAYER_CLASS_ID]
        crops = get_crops(frame, players)
        players_team_id = team_classifier.predict(crops, players.tracker_id)

        goalkeepers = detections[detections.class_id == GOALKEEPER_CLASS_ID]
        goalkeepers_team_id = resolve_goalkeepers_team_id(
            players, players_team_id, goalkeepers)

        referees = detections[detections.class_id == REFEREE_CLASS_ID]

        detections = sv.Detections.merge([players, goalkeepers, referees])
        color_lookup = np.array(
            players_team_id.tolist() +
            goalkeepers_team_id.tolist() +
            [REFEREE_CLASS_ID] * len(referees)
        )
        tracker_ids = detections.tracker_id
        labels = (
            [str(tracker_id) for tracker_id in tracker_ids]
            if tracker_ids is not None
            else ["" for _ in range(len(detections))]
        )

        annotated_frame = frame.copy()
        annotated_frame = ELLIPSE_ANNOTATOR.annotate(
            annotated_frame, detections, custom_color_lookup=color_lookup)
        annotated_frame = ELLIPSE_LABEL_ANNOTATOR.annotate(
            annotated_frame, detections, labels,
            custom_color_lookup=color_lookup)

        h, w, _ = frame.shape
        radar = render_heatmap(detections, keypoints, color_lookup, accumulated_xy_team_0, accumulated_xy_team_1)
        radar = sv.resize_image(radar, (w // 2, h // 2))
        radar_h, radar_w, _ = radar.shape
        rect = sv.Rect(
            x=w // 2 - radar_w // 2,
            y=h - radar_h,
            width=radar_w,
            height=radar_h
        )
        annotated_frame = sv.draw_image(annotated_frame, radar, opacity=0.5, rect=rect)
        yield annotated_frame


def main(source_video_path: str, target_video_path: str, device: str, mode: Mode) -> None:
    if mode == Mode.PITCH_DETECTION:
        frame_generator = run_pitch_detection(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.PLAYER_DETECTION:
        frame_generator = run_player_detection(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.BALL_DETECTION:
        frame_generator = run_ball_detection(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.PLAYER_TRACKING:
        frame_generator = run_player_tracking(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.TEAM_CLASSIFICATION:
        frame_generator = run_team_classification(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.RADAR:
        frame_generator = run_radar(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.HEATMAP:
        frame_generator = run_heatmap(
            source_video_path=source_video_path, device=device)
    elif mode == Mode.POSSESSION:
        frame_generator = run_possession_and_passes(
            source_video_path=source_video_path, device=device, show_possession=True, show_passes=False)
    elif mode == Mode.PASSES:
        frame_generator = run_possession_and_passes(
            source_video_path=source_video_path, device=device, show_possession=False, show_passes=True)
    elif mode == Mode.POSSESSION_AND_PASSES:
        frame_generator = run_possession_and_passes(
            source_video_path=source_video_path, device=device, show_possession=True, show_passes=True)
    else:
        raise NotImplementedError(f"Mode {mode} is not implemented.")

    video_info = sv.VideoInfo.from_video_path(source_video_path)
    with sv.VideoSink(target_video_path, video_info) as sink:
        for frame in frame_generator:
            sink.write_frame(frame)

            try:
                cv2.imshow("frame", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
            except Exception:
                pass
        try:
            cv2.destroyAllWindows()
        except Exception:
            pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--source_video_path', type=str, required=True)
    parser.add_argument('--target_video_path', type=str, required=True)
    parser.add_argument('--device', type=str, default='cpu')
    parser.add_argument('--mode', type=Mode, default=Mode.PLAYER_DETECTION)
    args = parser.parse_args()
    main(
        source_video_path=args.source_video_path,
        target_video_path=args.target_video_path,
        device=args.device,
        mode=args.mode
    )
