# 🤖 ML Parking Prediction Service

Flask-based microservice that serves the XGBoost parking occupancy prediction model.

## 🚀 Quick Start

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## 📡 API Endpoints

### 1. Health Check

```bash
GET /health
```

### 2. Single Prediction

```bash
POST /predict
Content-Type: application/json

{
  "slot_type": "car",
  "hour": 14,
  "weekday": 1,
  "weather": "sunny",
  "event_type": "none",
  "poi_office_count": 30,
  "poi_restaurant_count": 5,
  "poi_store_count": 2
}
```

### 3. Batch Prediction

```bash
POST /predict/batch
Content-Type: application/json

{
  "spots": [
    {
      "spot_id": "HINJ-001",
      "slot_type": "car",
      "weather": "sunny",
      "event_type": "none",
      "poi_office_count": 30,
      "poi_restaurant_count": 5,
      "poi_store_count": 2
    }
  ]
}
```

### 4. Get Current Context

```bash
GET /context
```

## 🔧 Configuration

Set environment variables:

- `ML_SERVICE_PORT`: Port number (default: 5001)

## 📊 Model Files Required

The service expects these files in the parent directory:

- `parking_model_v2.json` - Trained XGBoost model
- `parking_model_data_v2.joblib` - Encoders and feature metadata
