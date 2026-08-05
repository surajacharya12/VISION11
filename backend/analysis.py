import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "sports_football"))

import torch
import ultralytics.nn.tasks

# Patch torch.load to avoid PyTorch 2.6 WeightsUnpickler errors for Ultralytics models
_original_load = torch.load
def _patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)
torch.load = _patched_load

import supervision as sv
from soccer.main import (
    Mode,
    run_pitch_detection,
    run_player_detection,
    run_ball_detection,
    run_player_tracking,
    run_team_classification,
    run_radar,
    run_heatmap
)

def analyze_video(source_video_path: str, target_video_path: str, device: str, mode: str) -> None:
    try:
        enum_mode = Mode(mode)
    except ValueError:
        raise ValueError(f"Invalid mode: {mode}")

    if enum_mode == Mode.PITCH_DETECTION:
        frame_generator = run_pitch_detection(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.PLAYER_DETECTION:
        frame_generator = run_player_detection(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.BALL_DETECTION:
        frame_generator = run_ball_detection(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.PLAYER_TRACKING:
        frame_generator = run_player_tracking(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.TEAM_CLASSIFICATION:
        frame_generator = run_team_classification(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.RADAR:
        frame_generator = run_radar(
            source_video_path=source_video_path, device=device)
    elif enum_mode == Mode.HEATMAP:
        frame_generator = run_heatmap(
            source_video_path=source_video_path, device=device)
    else:
        raise NotImplementedError(f"Mode {enum_mode} is not implemented.")

    video_info = sv.VideoInfo.from_video_path(source_video_path)
    with sv.VideoSink(target_video_path, video_info) as sink:
        for frame in frame_generator:
            sink.write_frame(frame)
