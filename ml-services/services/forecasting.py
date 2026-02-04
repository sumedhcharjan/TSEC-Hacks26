import numpy as np

def predict_future_demand(history_data):
    """
    Simple forecasting logic: Calculates expected next peak based on trend
    """
    # Extract energy values
    energy_values = [d['energy'] for d in history_data]
    
    # Simple linear trend + seasonality factor
    trend = np.polyfit(range(len(energy_values)), energy_values, 1)[0]
    last_val = energy_values[-1]
    
    # Predict next 4 intervals (1 hour)
    predictions = [last_val + (trend * i) for i in range(1, 5)]
    
    expected_peak = max(predictions)
    confidence = "HIGH" if trend < 0.2 else "MEDIUM"
    
    return {
        "expected_next_peak": round(float(expected_peak), 2),
        "trend": "UPWARD" if trend > 0 else "STABLE",
        "confidence": confidence,
        "recommendation": "Advance load shifting recommended" if trend > 0.3 else "No immediate action"
    }
