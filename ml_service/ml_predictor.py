"""
ML Service for Parking Occupancy Prediction
Serves the trained XGBoost model via Flask API
"""
import os
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
from typing import Dict, List
from datetime import datetime

class ParkingMLPredictor:
    def __init__(self, model_path: str, model_data_path: str):
        """Initialize the ML predictor with trained model and preprocessors"""
        self.model = xgb.XGBClassifier()
        self.model.load_model(model_path)
        
        model_data = joblib.load(model_data_path)
        self.encoders = model_data['encoders']
        self.model_columns = model_data['model_columns']
        
        print(f"✅ Model loaded successfully from {model_path}")
        print(f"✅ Model data loaded from {model_data_path}")
    
    def predict_occupancy(self, parking_data: Dict) -> Dict:
        """
        Predict occupancy probability for a parking spot
        
        Args:
            parking_data: Dict containing:
                - slot_type: str (car/bike/large_vehicle/disabled)
                - hour: int (0-23)
                - weekday: int (0-6, Monday=0)
                - weather: str (sunny/rainy/hot)
                - event_type: str (none/public_holiday/stadium_event)
                - poi_office_count: int
                - poi_restaurant_count: int
                - poi_store_count: int
        
        Returns:
            Dict with:
                - prob_free: float (0-1)
                - prob_occupied: float (0-1)
                - prediction: str ('FREE' or 'OCCUPIED')
                - confidence: float (0-1)
        """
        try:
            # Create DataFrame from input
            df_sample = pd.DataFrame([parking_data])
            
            # Feature engineering - cyclical encoding
            if 'hour' in df_sample.columns:
                df_sample['hour_sin'] = np.sin(2 * np.pi * df_sample['hour'] / 24.0)
                df_sample['hour_cos'] = np.cos(2 * np.pi * df_sample['hour'] / 24.0)
            
            if 'weekday' in df_sample.columns:
                df_sample['weekday_sin'] = np.sin(2 * np.pi * df_sample['weekday'] / 7.0)
                df_sample['weekday_cos'] = np.cos(2 * np.pi * df_sample['weekday'] / 7.0)
            
            # Encode categorical features
            for col, le in self.encoders.items():
                if col in df_sample.columns:
                    df_sample[col] = df_sample[col].fillna('missing')
                    # Handle unknown categories
                    try:
                        df_sample[col] = le.transform(df_sample[col])
                    except ValueError as e:
                        print(f"⚠️  Unknown category in {col}: {df_sample[col].values[0]}, using 'missing'")
                        df_sample[col] = le.transform(['missing'])
            
            # Fill numerical columns
            numerical_cols = ['poi_office_count', 'poi_restaurant_count', 'poi_store_count']
            for col in numerical_cols:
                if col in df_sample.columns:
                    df_sample[col] = df_sample[col].fillna(0)
            
            # Reindex to match model columns
            df_pred = df_sample.reindex(columns=self.model_columns, fill_value=0)
            
            # Make prediction
            probabilities = self.model.predict_proba(df_pred)
            prob_free = float(probabilities[0][0])
            prob_occupied = float(probabilities[0][1])
            
            prediction = 'OCCUPIED' if prob_occupied > 0.5 else 'FREE'
            confidence = max(prob_free, prob_occupied)
            
            return {
                'prob_free': prob_free,
                'prob_occupied': prob_occupied,
                'prediction': prediction,
                'confidence': confidence
            }
        
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            raise
    
    def batch_predict(self, parking_spots: List[Dict]) -> List[Dict]:
        """
        Predict occupancy for multiple parking spots
        
        Args:
            parking_spots: List of parking spot data dicts
        
        Returns:
            List of prediction results
        """
        results = []
        for spot in parking_spots:
            try:
                prediction = self.predict_occupancy(spot)
                prediction['spot_id'] = spot.get('spot_id', 'unknown')
                results.append(prediction)
            except Exception as e:
                results.append({
                    'spot_id': spot.get('spot_id', 'unknown'),
                    'error': str(e),
                    'prob_free': 0.5,  # Default neutral probability
                    'prob_occupied': 0.5,
                    'prediction': 'UNKNOWN',
                    'confidence': 0.0
                })
        
        return results

def get_current_context() -> Dict:
    """
    Get current time context for predictions
    """
    now = datetime.now()
    return {
        'hour': now.hour,
        'weekday': now.weekday(),
        'date': now.strftime('%Y-%m-%d'),
        'time': now.strftime('%H:%M:%S')
    }
