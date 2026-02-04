from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2
from services.damage_detection import detect_damage
from services.anomaly_detection import detect_anomaly
import pandas as pd
import io

app = FastAPI(title="Smart City ML Service")


@app.get("/")
def home():
    return {"message": "ML Service Running 🚀"}



# Pothole / Crack Detection

@app.post("/predict-damage")
async def predict_damage(file: UploadFile = File(...)):
    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    result = detect_damage(img)

    return result



# Anomaly Detection

@app.post("/detect-anomaly")
async def anomaly(file: UploadFile = File(...)):
    contents = await file.read()

    df = pd.read_csv(io.BytesIO(contents))

    result = detect_anomaly(df)

    return result
