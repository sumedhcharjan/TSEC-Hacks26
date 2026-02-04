from ultralytics import YOLO
import numpy as np

# load once globally (fast)
model = YOLO("yolov8n.pt")


def detect_damage(img):

    results = model(img, verbose=False)

    boxes = results[0].boxes

    damage_area = 0

    h, w = img.shape[:2]
    total_area = h * w

    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0]

        area = (x2 - x1) * (y2 - y1)
        damage_area += area

    severity = min(float(damage_area / total_area), 1)

    health_score = int((1 - severity) * 100)

    if severity > 0.35:
        label = "pothole"
    elif severity > 0.12:
        label = "crack"
    else:
        label = "normal"

    return {
        "damage_type": label,
        "severity": round(severity, 3),
        "health_score": health_score,
        "boxes_detected": len(boxes)
    }
