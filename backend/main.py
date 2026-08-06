import os
import shutil
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse, JSONResponse
from uuid import uuid4

from analysis import analyze_video, Mode

app = FastAPI(title="Video Analysis API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMP_VIDEO_DIR = os.path.join(PROJECT_ROOT, "temp_uploads")
ANALYSIS_VIDEO_DIR = os.path.join(PROJECT_ROOT, "analysisvideo")
DATA_DIR = os.path.join(PROJECT_ROOT, "sports_football", "data")

os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)
os.makedirs(ANALYSIS_VIDEO_DIR, exist_ok=True)


@app.post("/api/analyze")
async def analyze(
    mode: str = Form("PLAYER_DETECTION"),
    device: str = Form("cpu"),
    video: UploadFile | None = File(None),
    preset_name: str | None = Form(None),
):
    """
    Upload a video or specify a preset video and perform analysis.
    Output analyzed video is saved into temp_uploads.
    """
    valid_modes = [m.value for m in Mode]
    if mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Valid modes are: {', '.join(valid_modes)}")

    video_id = str(uuid4())
    is_uploaded = False
    source_path = None

    if video and video.filename:
        ext = os.path.splitext(video.filename)[1] or ".mp4"
        source_filename = f"{video_id}_source{ext}"
        source_path = os.path.join(TEMP_VIDEO_DIR, source_filename)
        is_uploaded = True
        try:
            with open(source_path, "wb") as buffer:
                shutil.copyfileobj(video.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded video: {str(e)}")
    elif preset_name:
        preset_path = os.path.join(DATA_DIR, preset_name)
        if not os.path.exists(preset_path):
            preset_path = os.path.join(TEMP_VIDEO_DIR, preset_name)
        if not os.path.exists(preset_path):
            raise HTTPException(status_code=404, detail=f"Preset video '{preset_name}' not found.")
        source_path = preset_path
    else:
        raise HTTPException(status_code=400, detail="No video file or preset provided.")

    target_filename = f"{video_id}_{mode}_output.mp4"
    target_path = os.path.join(TEMP_VIDEO_DIR, target_filename)

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
        if is_uploaded and source_path and os.path.exists(source_path):
            try:
                os.remove(source_path)
            except Exception:
                pass

    return JSONResponse(status_code=200, content={
        "message": "Analysis completed successfully.",
        "output_path": target_path,
        "filename": target_filename
    })

@app.get("/api/download/{filename}")
async def download_video(filename: str):
    file_path = os.path.join(TEMP_VIDEO_DIR, filename)
    if not os.path.exists(file_path):
        file_path = os.path.join(ANALYSIS_VIDEO_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="video/mp4", filename=filename)

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
