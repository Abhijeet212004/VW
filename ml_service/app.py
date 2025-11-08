"""
Flask API for ML Parking Prediction Service
Provides REST endpoints for parking occupancy predictions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from ml_predictor import ParkingMLPredictor, get_current_context

app = Flask(__name__)
CORS(app)

# Initialize ML model
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..')
MODEL_FILE = os.path.join(MODEL_DIR, 'parking_model_v2.json')
MODEL_DATA_FILE = os.path.join(MODEL_DIR, 'parking_model_data_v2.joblib')

print("🚀 Initializing ML Parking Prediction Service...")
print(f"📂 Model directory: {MODEL_DIR}")
print(f"🤖 Model file: {MODEL_FILE}")
print(f"📊 Model data file: {MODEL_DATA_FILE}")

try:
    predictor = ParkingMLPredictor(MODEL_FILE, MODEL_DATA_FILE)
    print("✅ ML Service initialized successfully!")
except Exception as e:
    print(f"❌ Failed to initialize ML Service: {str(e)}")
    raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Parking Prediction Service',
        'model_loaded': True
    }), 200

@app.route('/predict', methods=['POST'])
def predict_single():
    """
    Predict occupancy for a single parking spot
    
    Request body example:
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
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Add current time context if not provided
        if 'hour' not in data or 'weekday' not in data:
            context = get_current_context()
            data['hour'] = data.get('hour', context['hour'])
            data['weekday'] = data.get('weekday', context['weekday'])
        
        prediction = predictor.predict_occupancy(data)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input': data
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict occupancy for multiple parking spots
    
    Request body example:
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
            },
            ...
        ],
        "hour": 14,  // Optional, defaults to current hour
        "weekday": 1  // Optional, defaults to current weekday
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'spots' not in data:
            return jsonify({'error': 'No spots data provided'}), 400
        
        spots = data['spots']
        
        # Get time context
        context = get_current_context()
        hour = data.get('hour', context['hour'])
        weekday = data.get('weekday', context['weekday'])
        
        # Add time context to each spot
        for spot in spots:
            if 'hour' not in spot:
                spot['hour'] = hour
            if 'weekday' not in spot:
                spot['weekday'] = weekday
        
        predictions = predictor.batch_predict(spots)
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'context': {
                'hour': hour,
                'weekday': weekday,
                'timestamp': context['date'] + ' ' + context['time']
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/context', methods=['GET'])
def get_context():
    """Get current time context for predictions"""
    context = get_current_context()
    return jsonify({
        'success': True,
        'context': context
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('ML_SERVICE_PORT', 5001))
    print(f"\n🌐 Starting ML Service on port {port}...")
    print(f"📍 http://localhost:{port}")
    print(f"🏥 Health check: http://localhost:{port}/health")
    print(f"🔮 Prediction endpoint: http://localhost:{port}/predict")
    print(f"🔮 Batch prediction: http://localhost:{port}/predict/batch\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)
