import os
import tempfile

import cv2
import joblib
import numpy as np
import streamlit as st
from skimage.feature import hog, local_binary_pattern

IMG_SIZE = (192, 144)
HOG_PIXELS_PER_CELL = (8, 8)
HOG_ORIENTATIONS = 12
HOG_CELLS_PER_BLOCK = (2, 2)
COLOR_BINS = (24, 24)
FRAME_SKIP = 5  # Process every 5th frame

CLASSES = [
    "c0: Safe Driving",
    "c1: Texting (Right)",
    "c2: Talking on Phone (Right)",
    "c3: Texting (Left)",
    "c4: Talking on Phone (Left)",
    "c5: Operating Radio",
    "c6: Drinking",
    "c7: Reaching Behind",
    "c8: Hair and Makeup",
    "c9: Talking to Passenger",
]

@st.cache_resource
def load_pipeline():
    model_path = "driver_distraction_pipeline.joblib"
    if not os.path.exists(model_path):
        st.error(
            f"Model file '{model_path}' not found. Run the training notebook first."
        )
        st.stop()
    return joblib.load(model_path)


def extract_features(frame):
    img = cv2.resize(frame, IMG_SIZE, interpolation=cv2.INTER_AREA)

    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist_h = cv2.calcHist([img_hsv], [0], None, [COLOR_BINS[0]], [0, 180])
    hist_s = cv2.calcHist([img_hsv], [1], None, [COLOR_BINS[1]], [0, 256])
    color_feat = np.concatenate([hist_h.flatten(), hist_s.flatten()])

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hog_feat = hog(
        img_gray,
        orientations=HOG_ORIENTATIONS,
        pixels_per_cell=HOG_PIXELS_PER_CELL,
        cells_per_block=HOG_CELLS_PER_BLOCK,
        block_norm="L2-Hys",
        transform_sqrt=True,
        feature_vector=True,
    )

    lbp = local_binary_pattern(img_gray, P=8, R=1, method="uniform")
    lbp_hist = np.histogram(lbp.ravel(), bins=10, range=(0, 10), density=True)[0]

    all_features = [hog_feat, color_feat, lbp_hist]

    for f in all_features:
        if np.any(np.isnan(f)) or np.any(np.isinf(f)):
            return None

    final_features = np.concatenate(all_features)
    return final_features


def predict_frame(frame, artifacts):
    features = extract_features(frame)
    if features is None:
        return "Error extracting features"

    features = features.reshape(1, -1)

    if artifacts["feature_selector"]:
        features = artifacts["feature_selector"].transform(features)

    if artifacts["scaler"]:
        features = artifacts["scaler"].transform(features)

    if artifacts["pca"]:
        features = artifacts["pca"].transform(features)

    prediction_idx = artifacts["model"].predict(features)[0]
    return CLASSES[prediction_idx]


def main():
    st.title("Driver Distraction Detection")
    st.markdown("Upload a video to detect driver behavior using SVM model.")

    artifacts = load_pipeline()

    video_file = st.file_uploader("Upload Video", type=["mp4", "avi", "mov"])

    if video_file is not None:
        tfile = tempfile.NamedTemporaryFile(delete=False)
        tfile.write(video_file.read())

        cap = cv2.VideoCapture(tfile.name)
        st_frame = st.empty()
        st_text = st.empty()

        frame_count = 0
        last_prediction = "Initializing..."

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            if frame_count % FRAME_SKIP == 0:
                try:
                    last_prediction = predict_frame(frame, artifacts)
                except Exception as e:
                    last_prediction = f"Error: {str(e)}"

            cv2.putText(
                frame,
                f"Status: {last_prediction}",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                3,
            )

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            st_frame.image(frame_rgb, channels="RGB", use_container_width=True)
            st_text.info(f"Current Prediction: **{last_prediction}**")

        cap.release()
        st.success("Video processing complete.")


if __name__ == "__main__":
    main()
