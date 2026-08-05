import os
import shutil
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from uuid import uuid4

from analysis import analyze_video, Mode

app = FastAPI(title="Video Analysis API")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANALYSIS_VIDEO_DIR = os.path.join(PROJECT_ROOT, "analysisvideo")
TEMP_VIDEO_DIR = os.path.join(PROJECT_ROOT, "temp_uploads")

os.makedirs(ANALYSIS_VIDEO_DIR, exist_ok=True)
os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)


@app.post("/api/analyze")
async def analyze(
    mode: str = Form("PLAYER_DETECTION"),
    device: str = Form("cpu"),
    video: UploadFile = File(...)
):
    """
    Upload a video and perform analysis.
    Supported modes: PITCH_DETECTION, PLAYER_DETECTION, BALL_DETECTION, PLAYER_TRACKING, TEAM_CLASSIFICATION, RADAR, HEATMAP
    """
    if not video.filename:
        raise HTTPException(status_code=400, detail="No video file provided.")

    valid_modes = [m.value for m in Mode]
    if mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Valid modes are: {', '.join(valid_modes)}")

    video_id = str(uuid4())
    ext = os.path.splitext(video.filename)[1]
    if not ext:
        ext = ".mp4"
    
    source_filename = f"{video_id}_source{ext}"
    target_filename = f"{video_id}_{mode}_output{ext}"
    
    source_path = os.path.join(TEMP_VIDEO_DIR, source_filename)
    target_path = os.path.join(ANALYSIS_VIDEO_DIR, target_filename)

    # Save uploaded file
    try:
        with open(source_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")
    
    # Process video
    try:
        analyze_video(
            source_video_path=source_path,
            target_video_path=target_path,
            device=device,
            mode=mode
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(source_path):
            os.remove(source_path)

    return JSONResponse(status_code=200, content={
        "message": "Analysis completed successfully.",
        "output_path": target_path,
        "filename": target_filename
    })

@app.get("/api/download/{filename}")
async def download_video(filename: str):
    file_path = os.path.join(ANALYSIS_VIDEO_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
