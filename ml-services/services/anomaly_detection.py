import numpy as np


def detect_anomaly(df):

    values = df.iloc[:, 1].values  # 2nd column = usage

    mean = np.mean(values)
    std = np.std(values)

    threshold = mean + 2 * std

    anomalies = values > threshold

    anomaly_indices = np.where(anomalies)[0].tolist()

    return {
        "mean_usage": float(mean),
        "threshold": float(threshold),
        "anomaly_detected": len(anomaly_indices) > 0,
        "anomaly_indices": anomaly_indices
    }
