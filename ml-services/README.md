# ML Service Setup & Run Script

## Quick Start

### 1. Create Virtual Environment
```bash
cd ml-services
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start ML Service
```bash
uvicorn main:app --reload --port 8000
```

The service will be available at: **http://localhost:8000**

## Test ML Service

### Health Check
```bash
curl http://localhost:8000
```

Expected response:
```json
{"message": "ML Service Running 🚀"}
```

### Test Damage Detection
```bash
curl -X POST "http://localhost:8000/predict-damage" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/image.jpg"
```

Expected response:
```json
{
  "damage_type": "pothole" | "crack" | "normal",
  "severity": 0.123,
  "health_score": 87
}
```

## How It Works

1. **Damage Detection**: Analyzes road images for potholes/cracks
2. **Risk Score**: Calculated as `100 - health_score`
   - health_score 90+ → Low risk (10)
   - health_score 50-90 → Medium risk (50)
   - health_score <50 → High risk (90+)

## Integration with Backend

Once ML service is running:
1. Backend will automatically call it when reports are submitted
2. Risk scores will be calculated and stored
3. Admin dashboard will display AI-generated risk scores

## Troubleshooting

**Port already in use:**
```bash
uvicorn main:app --reload --port 8001
```
Then update `ML_SERVICE_URL=http://localhost:8001` in backend `.env`

**Module not found:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```
