import cv2
import numpy as np
import joblib
from skimage.feature import hog, local_binary_pattern
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

# =====================
# FastAPI init
# =====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# Load model bundle
# =====================
bundle = joblib.load("driver_distraction_pipeline.joblib")

model = bundle["model"]
scaler = bundle["scaler"]
selector = bundle["feature_selector"]
pca = bundle["pca"]
class_names = bundle["class_names"]

print("Model bundle loaded successfully")

# =====================
# CONFIG (SAMA DENGAN TRAINING)
# =====================
IMG_SIZE = (192, 144)
HOG_PIXELS_PER_CELL = (8, 8)
HOG_ORIENTATIONS = 12
HOG_CELLS_PER_BLOCK = (2, 2)
COLOR_BINS = (24, 24)

# =====================
# Feature Extraction
# =====================
def extract_features(img_bytes):
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        return None

    img = cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)

    # HSV color hist
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist_h = cv2.calcHist([img_hsv], [0], None, [COLOR_BINS[0]], [0, 180])
    hist_s = cv2.calcHist([img_hsv], [1], None, [COLOR_BINS[1]], [0, 256])
    color_feat = np.concatenate([hist_h.flatten(), hist_s.flatten()])

    # Gray
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    hog_feat = hog(
        img_gray,
        orientations=HOG_ORIENTATIONS,
        pixels_per_cell=HOG_PIXELS_PER_CELL,
        cells_per_block=HOG_CELLS_PER_BLOCK,
        block_norm="L2-Hys",
        transform_sqrt=True,
        feature_vector=True
    )

    lbp = local_binary_pattern(img_gray, P=8, R=1, method="uniform")
    lbp_hist = np.histogram(lbp.ravel(), bins=10, range=(0, 10), density=True)[0]

    features = np.concatenate([hog_feat, color_feat, lbp_hist])
    return features.astype(np.float32)

# =====================
# Prediction endpoint
# =====================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return {"error": "File must be an image"}

    img_bytes = await file.read()
    X = extract_features(img_bytes)

    if X is None:
        return {"error": "Invalid image"}

    X = X.reshape(1, -1)
    print("RAW features:", X.shape)

    # === PIPELINE SESUAI TRAINING ===
    X = selector.transform(X)
    print("After SelectKBest:", X.shape)

    X = scaler.transform(X)
    print("After Scaler:", X.shape)

    if pca is not None:
        X = pca.transform(X)
        print("After PCA:", X.shape)

    pred = model.predict(X)[0]

    confidence = None
    if hasattr(model, "predict_proba"):
        confidence = float(np.max(model.predict_proba(X)))

    return {
        "class_id": int(pred),
        "label": class_names[pred],
        "confidence": confidence
    }
