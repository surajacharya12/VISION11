import streamlit as st
import requests

st.title("Video Analysis API Tester")

st.write("Upload a video and test the analysis API.")

api_url = st.text_input("API URL", value="http://localhost:8000")

mode = st.selectbox(
    "Analysis Mode",
    ["PITCH_DETECTION", "PLAYER_DETECTION", "BALL_DETECTION", "PLAYER_TRACKING", "TEAM_CLASSIFICATION", "RADAR", "HEATMAP"]
)

device = st.selectbox(
    "Device",
    ["cpu", "cuda", "mps"]
)

uploaded_file = st.file_uploader("Choose a video file", type=["mp4", "avi", "mov"])

if st.button("Analyze Video"):
    if uploaded_file is not None:
        with st.spinner('Uploading and analyzing video...'):
            try:
                # Prepare the files and data for the POST request
                files = {"video": (uploaded_file.name, uploaded_file.getvalue(), "video/mp4")}
                data = {"mode": mode, "device": device}
                
                response = requests.post(
                    f"{api_url}/api/analyze",
                    data=data,
                    files=files
                )
                
                if response.status_code == 200:
                    st.success("Analysis complete!")
                    st.json(response.json())
                    
                    # Display link to download or view
                    output_data = response.json()
                    filename = output_data.get("filename")
                    
                    if filename:
                        output_path = output_data.get("output_path")
                        if output_path:
                            # Display the video directly from the local filesystem
                            st.video(output_path)
                else:
                    st.error(f"Error {response.status_code}")
                    try:
                        st.json(response.json())
                    except:
                        st.write(response.text)
            except Exception as e:
                st.error(f"Request failed: {e}")
                st.info("Make sure the FastAPI backend is running (e.g. `uvicorn main:app --reload`).")
    else:
        st.warning("Please upload a video file first.")
