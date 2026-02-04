import cv2
import numpy as np


def detect_damage(img):

    h, w = img.shape[:2]
    total_area = h * w

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # dark region detection
    mask = cv2.inRange(gray, 0, 85)

    kernel = np.ones((7,7), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    damage_area = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 2500:
            damage_area += area

    severity = min(damage_area / total_area, 1)

    health_score = int((1 - severity) * 100)

    if severity > 0.25:
        label = "pothole"
    elif severity > 0.08:
        label = "crack"
    else:
        label = "normal"

    return {
        "damage_type": label,
        "severity": round(float(severity), 3),
        "health_score": health_score
    }
