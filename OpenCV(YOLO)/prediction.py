# prediction.py - Enhanced PICT Parking Prediction System
import json
import pickle
import pandas as pd
import numpy as np
import xgboost as xgb
import googlemaps
import aiohttp
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Constants
BACKEND_API_BASE = "http://localhost:3000/api"

app = FastAPI(title="PICT Parking Prediction System", version="1.0.0")

# Google Maps client
try:
    gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))
except:
    gmaps = None
    print("Warning: Google Maps API key not found")

# PICT College coordinates and parking areas
PICT_LOCATION = {
    "lat": 18.5204,
    "lng": 73.8567,
    "address": "PICT College, Pune, Maharashtra"
}

# Major parking destinations in Pune area
PARKING_AREAS = {
    "pict_campus": {
        "lat": 18.5204, 
        "lng": 73.8567, 
        "total_slots": 500, 
        "name": "PICT Campus Parking",
        "hourly_rate": 20,
        "area": "Kharadi"
    },
    "amanora_mall": {
        "lat": 18.5314, 
        "lng": 73.8982, 
        "total_slots": 800, 
        "name": "Amanora Mall Parking",
        "hourly_rate": 30,
        "area": "Hadapsar"
    },
    "seasons_mall": {
        "lat": 18.5078, 
        "lng": 73.9200, 
        "total_slots": 600, 
        "name": "Seasons Mall Parking",
        "hourly_rate": 25,
        "area": "Magarpatta"
    },
    "kharadi_it_park": {
        "lat": 18.5110, 
        "lng": 73.8567, 
        "total_slots": 400, 
        "name": "Kharadi IT Park Parking",
        "hourly_rate": 35,
        "area": "Kharadi"
    },
    "eon_it_park": {
        "lat": 18.5089, 
        "lng": 73.8612, 
        "total_slots": 350, 
        "name": "EON IT Park Parking",
        "hourly_rate": 40,
        "area": "Kharadi"
    }
}

# -------------------------------
# Paths to saved model and features
# -------------------------------
MODEL_PATH = "xgb_parking_dynamic.json"      # trained regressor
FEATURE_PATH = "dynamic_features.json"
ENCODER_PATH = "categorical_encoders.pkl"

# -------------------------------
# Load trained model safely
# -------------------------------
try:
    xgb_model = xgb.XGBRegressor()               # REGRESSOR, not Classifier
    if os.path.exists(MODEL_PATH):
        xgb_model.load_model(MODEL_PATH)
    else:
        xgb_model = None
        print("Warning: XGBoost model not found, using fallback predictions")
    
    # Load feature order
    if os.path.exists(FEATURE_PATH):
        with open(FEATURE_PATH, "r") as f:
            feature_order = json.load(f)
    else:
        feature_order = [
            "city", "area", "parking_lot_name", "day_of_week", "time_of_day", 
            "is_weekend", "is_holiday", "weather_condition", "temperature_c", 
            "traffic_density", "distance_from_user_km", "vehicle_type", 
            "base_price", "dynamic_multiplier", "final_price", "event_nearby", 
            "total_slots", "occupied_slots", "free_slots", "slots_free_in_15min", 
            "future_bookings_15min"
        ]
    
    # Load categorical encoders
    if os.path.exists(ENCODER_PATH):
        with open(ENCODER_PATH, "rb") as f:
            encoders = pickle.load(f)
    else:
        encoders = None
        print("Warning: Categorical encoders not found")

except Exception as e:
    print(f"Error loading model components: {e}")
    xgb_model, encoders, feature_order = None, None, []

# -------------------------------
# Google Maps Service Class
# -------------------------------
class GoogleMapsService:
    """Service for Google Maps API integration"""
    
    @staticmethod
    async def get_travel_time(origin: Dict, destination: Dict) -> Dict:
        """Calculate travel time and distance (using fallback for now due to Google Maps API limitations)"""
        try:
            # Calculate simple distance using Haversine formula
            from math import radians, cos, sin, asin, sqrt
            
            lat1, lon1 = radians(origin["lat"]), radians(origin["lng"])
            lat2, lon2 = radians(destination["lat"]), radians(destination["lng"])
            
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            distance_km = 6371 * c  # Radius of earth in kilometers
            
            # Estimate travel time based on distance (assuming 30 km/h average in city)
            duration_minutes = (distance_km / 30) * 60
            
            # Add traffic factor based on time of day
            current_hour = datetime.now().hour
            if 8 <= current_hour <= 10 or 17 <= current_hour <= 19:
                traffic_factor = 1.5  # Peak hours
            elif 11 <= current_hour <= 16:
                traffic_factor = 1.2  # Normal hours
            else:
                traffic_factor = 1.0  # Off hours
            
            duration_in_traffic = duration_minutes * traffic_factor
            
            return {
                "distance_km": float(distance_km),
                "duration_minutes": float(duration_minutes),
                "duration_in_traffic_minutes": float(duration_in_traffic),
                "traffic_factor": float(traffic_factor)
            }
                
        except Exception as e:
            print(f"Error calculating travel time: {e}")
            return {
                "distance_km": 5.0, 
                "duration_minutes": 15.0, 
                "duration_in_traffic_minutes": 20.0, 
                "traffic_factor": 1.3
            }
    
    @staticmethod
    async def get_weather_data(lat: float, lng: float) -> Dict:
        """Get weather data simulation for Pune"""
        try:
            current_time = datetime.now()
            
            # Simulate realistic weather based on time of year and hour for Pune
            # November in Pune - pleasant weather, around 24-28°C
            if current_time.month in [6, 7, 8, 9]:  # Monsoon season
                weather_condition = "Rainy" if current_time.hour > 14 else "Cloudy"
                temperature = 25 + (current_time.hour - 6) * 0.5
            elif current_time.month in [12, 1, 2]:  # Winter
                weather_condition = "Clear"
                temperature = 18 + (current_time.hour - 6) * 1.0
            elif current_time.month in [10, 11]:  # Post-monsoon (Current time - November)
                weather_condition = "Clear"
                temperature = 24 + (current_time.hour - 6) * 0.3  # Pleasant 24-28°C range
            else:  # Summer
                weather_condition = "Clear" if current_time.hour < 16 else "Cloudy"
                temperature = 28 + (current_time.hour - 6) * 1.5
            
            return {
                "temperature_c": min(max(temperature, 18), 40),
                "weather_condition": weather_condition
            }
        except Exception as e:
            print(f"Error fetching weather: {e}")
            return {"temperature_c": 26.0, "weather_condition": "Clear"}
    
    @staticmethod
    def calculate_traffic_density(traffic_factor: float) -> float:
        """Convert traffic factor to traffic density score"""
        if traffic_factor <= 1.1:
            return 0.2  # Low traffic
        elif traffic_factor <= 1.3:
            return 0.5  # Medium traffic
        elif traffic_factor <= 1.6:
            return 0.8  # High traffic
        else:
            return 1.0  # Very high traffic

# -------------------------------
# Request schemas
# -------------------------------
class ParkingPredictionInput(BaseModel):
    user_location: Dict[str, float]  # {"lat": 18.5204, "lng": 73.8567}
    parking_area: str  # "pict_campus", "amanora_mall", etc.
    vehicle_type: str = "car"
    planned_arrival_time: Optional[str] = None  # ISO format or None for "now"
    current_slot_data: Optional[Dict[str, int]] = None  # {"available_spots": 50, "total_spots": 55}

class ParkingRecommendationInput(BaseModel):
    destination_location: Dict[str, float]  # {"lat": 18.5204, "lng": 73.8567}
    planned_arrival_time: str  # ISO format
    vehicle_type: str = "car"
    max_walking_distance: float = 500  # meters

class BookingInput(BaseModel):
    city: str
    area: str
    parking_lot_name: str
    day_of_week: str
    time_of_day: float
    is_weekend: int
    is_holiday: int
    weather_condition: str
    temperature_c: float
    traffic_density: float
    distance_from_user_km: float
    vehicle_type: str
    base_price: float
    dynamic_multiplier: float
    final_price: float
    event_nearby: int
    total_slots: int
    occupied_slots: int
    free_slots: int
    slots_free_in_15min: int
    future_bookings_15min: int

# -------------------------------
# Enhanced Prediction Service
# -------------------------------
class ParkingPredictionService:
    """Core prediction service with XGBoost model and real-world integration"""
    
    def __init__(self):
        self.model = xgb_model
        self.encoders = encoders
        self.feature_order = feature_order
        self.gmaps_service = GoogleMapsService()
    
    async def predict_availability_for_spot(self, input_data: ParkingPredictionInput) -> Dict:
        """Predict availability for specific parking spot when user arrives"""
        try:
            # Get parking area details
            if input_data.parking_area not in PARKING_AREAS:
                raise HTTPException(status_code=400, detail="Invalid parking area")
            
            parking_spot = PARKING_AREAS[input_data.parking_area]
            
            # Try to get real-time slot data from the main app backend or use provided data
            real_time_data = None
            if input_data.current_slot_data:
                # Use slot data provided by the client app
                real_time_data = {
                    "available_spots": input_data.current_slot_data["available_spots"],
                    "total_slots": input_data.current_slot_data["total_spots"],
                    "occupied_slots": input_data.current_slot_data["total_spots"] - input_data.current_slot_data["available_spots"],
                    "last_updated": datetime.now().isoformat(),
                    "data_source": "client_provided"
                }
            else:
                # Try to fetch real-time data from backend CV system
                real_time_data = await self._get_real_time_slot_data(input_data.parking_area)
            
            # Calculate travel time
            travel_data = await self.gmaps_service.get_travel_time(
                input_data.user_location,
                {"lat": parking_spot["lat"], "lng": parking_spot["lng"]}
            )
            
            # Determine arrival time
            if input_data.planned_arrival_time:
                arrival_time = datetime.fromisoformat(input_data.planned_arrival_time.replace('Z', '+00:00'))
            else:
                arrival_time = datetime.now() + timedelta(minutes=travel_data["duration_in_traffic_minutes"])
            
            # Get weather for arrival time
            weather_data = await self.gmaps_service.get_weather_data(
                parking_spot["lat"], parking_spot["lng"]
            )
            
            # Calculate traffic density
            traffic_density = self.gmaps_service.calculate_traffic_density(travel_data["traffic_factor"])
            
            # Use real-time occupancy if available, otherwise simulate
            if real_time_data:
                current_occupancy = real_time_data.get("occupied_slots", 0) / real_time_data.get("total_slots", 55)
                current_available = real_time_data.get("available_spots", 0)
                total_slots = real_time_data.get("total_spots", 55)
                
                # Calculate prediction based on real data + future trends
                availability_percent = await self._predict_with_real_data(
                    real_time_data, arrival_time, weather_data, traffic_density, travel_data
                )
            else:
                # Fallback to simulation
                current_hour = datetime.now().hour
                current_occupancy = self._simulate_current_occupancy(input_data.parking_area, current_hour)
                
                # Simple rule-based prediction for fallback
                availability_percent = await self._simple_rule_based_prediction(
                    input_data.parking_area, arrival_time, weather_data, traffic_density, current_occupancy
                )
            
            return {
                "success": True,
                "parking_area": parking_spot["name"],
                "availability_percentage": float(round(availability_percent, 1)),
                "estimated_arrival_time": arrival_time.isoformat(),
                "travel_info": {
                    "distance_km": float(round(travel_data["distance_km"], 2)),
                    "travel_time_minutes": float(round(travel_data["duration_in_traffic_minutes"], 1)),
                    "traffic_factor": float(round(travel_data["traffic_factor"], 2))
                },
                "conditions": {
                    "weather": weather_data["weather_condition"],
                    "temperature": float(round(weather_data["temperature_c"], 1)),
                    "traffic_density": float(round(traffic_density, 2))
                },
                "confidence": "High" if real_time_data else "Medium",
                "data_source": "real-time" if real_time_data else "simulated"
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    
    async def _get_real_time_slot_data(self, parking_area: str) -> Optional[Dict]:
        """Fetch real-time slot data from the backend API with CV updates"""
        try:
            # Map ML area IDs to backend API calls
            area_coords = {
                'pict_campus': (18.5204, 73.8567),
                'amanora_mall': (18.5018, 73.9344),
                'seasons_mall': (18.5362, 73.8982),
                'kharadi_it_park': (18.5570, 73.9090),
                'eon_it_park': (18.5600, 73.9120)
            }
            
            if parking_area not in area_coords:
                return None
                
            lat, lng = area_coords[parking_area]
            url = f"{BACKEND_API_BASE}/parking-spot/nearby"
            params = {
                'latitude': lat,
                'longitude': lng, 
                'radius': 5
            }
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('success') and data.get('data'):
                            # Find the relevant parking spot in results
                            for spot in data['data']:
                                spot_name = spot.get('name', '').lower()
                                if (parking_area == 'pict_campus' and 'pict' in spot_name) or \
                                   (parking_area == 'amanora_mall' and 'amanora' in spot_name) or \
                                   (parking_area == 'seasons_mall' and 'seasons' in spot_name) or \
                                   (parking_area == 'kharadi_it_park' and 'kharadi' in spot_name) or \
                                   (parking_area == 'eon_it_park' and 'eon' in spot_name):
                                    
                                    # Calculate live occupancy rate
                                    available = spot.get('availableSpots', 0)
                                    total = spot.get('totalSpots', 1)
                                    occupancy_rate = max(0, min(1, (total - available) / total))
                                    
                                    return {
                                        'available_spots': available,
                                        'total_spots': total,
                                        'occupancy_rate': occupancy_rate,
                                        'realtime_slots': spot.get('realTimeSlots', []),
                                        'last_updated': spot.get('lastUpdated'),
                                        'source': 'cv_realtime',
                                        'spot_name': spot.get('name')
                                    }
        except Exception as e:
            print(f"Error fetching real-time data for {parking_area}: {e}")
        
        return None
    
    async def _predict_with_real_data(self, real_data: Dict, arrival_time: datetime, weather_data: Dict, traffic_density: float, travel_data: Dict) -> float:
        """Make prediction incorporating real-time slot data"""
        # Handle both CV backend format and client-provided format
        if "available_spots" in real_data:
            available_spots = real_data["available_spots"] 
            total_slots = real_data.get("total_spots", real_data.get("total_slots", 55))
        else:
            available_spots = real_data.get("total_slots", 55) - real_data.get("occupied_slots", 0)
            total_slots = real_data.get("total_slots", 55)
            
        current_availability = (available_spots / max(1, total_slots)) * 100
        
        # Calculate time until arrival
        minutes_to_arrival = (arrival_time - datetime.now()).total_seconds() / 60
        
        # Base prediction on current availability
        predicted_availability = current_availability
        
        # Adjust based on time trends (arrival time vs current time)
        arrival_hour = arrival_time.hour
        current_hour = datetime.now().hour
        
        # Peak hours adjustment
        if 8 <= arrival_hour <= 10 or 17 <= arrival_hour <= 19:
            predicted_availability -= 15  # Peak hours = less availability
        elif 11 <= arrival_hour <= 16:
            predicted_availability -= 5   # Normal hours
        else:
            predicted_availability += 10  # Off-peak hours
            
        # Weather adjustment
        if weather_data["weather_condition"] == "Rainy":
            predicted_availability -= 8   # People avoid walking in rain
            
        # Traffic adjustment (high traffic = people more likely to book ahead)
        predicted_availability -= (traffic_density * 10)
        
        # Time factor (longer travel time = more uncertainty)
        if minutes_to_arrival > 30:
            predicted_availability -= 5
        elif minutes_to_arrival > 60:
            predicted_availability -= 10
            
        # Weekend factor
        if arrival_time.weekday() >= 5:  # Saturday=5, Sunday=6
            predicted_availability += 10
            
        # Ensure reasonable bounds
        predicted_availability = max(5, min(95, predicted_availability))
        
        return predicted_availability
    
    async def _simple_rule_based_prediction(self, parking_area: str, arrival_time: datetime, weather_data: Dict, traffic_density: float, current_occupancy: float) -> float:
        """Simple rule-based prediction for fallback"""
        # Base availability from current occupancy
        base_availability = (1 - current_occupancy) * 100
        
        # Time-based adjustments
        hour = arrival_time.hour
        if 8 <= hour <= 10 or 17 <= hour <= 19:  # Peak hours
            base_availability -= 20
        elif 11 <= hour <= 16:  # Normal hours
            base_availability -= 10
        else:  # Off-peak
            base_availability += 5
            
        # Weather adjustment
        if weather_data["weather_condition"] == "Rainy":
            base_availability -= 10
            
        # Traffic adjustment
        base_availability -= (traffic_density * 15)
        
        # Weekend bonus
        if arrival_time.weekday() >= 5:
            base_availability += 15
            
        # Ensure reasonable bounds
        return max(10, min(90, base_availability))
    
    async def recommend_best_parking(self, input_data: ParkingRecommendationInput) -> Dict:
        """Recommend top 3 parking spots for given destination and time"""
        try:
            arrival_time = datetime.fromisoformat(input_data.planned_arrival_time.replace('Z', '+00:00'))
            recommendations = []
            
            # Evaluate all parking areas
            for area_id, area_info in PARKING_AREAS.items():
                # Calculate distance from destination to parking area
                distance_to_parking = await self._calculate_walking_distance(
                    input_data.destination_location,
                    {"lat": area_info["lat"], "lng": area_info["lng"]}
                )
                
                # Skip if too far from destination
                if distance_to_parking > input_data.max_walking_distance:
                    continue
                
                # Create prediction input
                prediction_input = ParkingPredictionInput(
                    user_location=input_data.destination_location,  # Use destination as origin
                    parking_area=area_id,
                    vehicle_type=input_data.vehicle_type,
                    planned_arrival_time=input_data.planned_arrival_time
                )
                
                # Get availability prediction
                prediction_result = await self.predict_availability_for_spot(prediction_input)
                
                recommendations.append({
                    "parking_area": area_info["name"],
                    "parking_id": area_id,
                    "availability_percentage": float(prediction_result["availability_percentage"]),
                    "walking_distance_meters": float(round(distance_to_parking, 0)),
                    "walking_time_minutes": float(round(distance_to_parking / 80, 1)),  # Average walking speed 80m/min
                    "total_slots": int(area_info["total_slots"]),
                    "coordinates": {"lat": float(area_info["lat"]), "lng": float(area_info["lng"])},
                    "travel_info": prediction_result["travel_info"],
                    "conditions": prediction_result["conditions"]
                })
            
            # Sort by availability percentage and walking distance
            recommendations.sort(key=lambda x: (x["availability_percentage"], -x["walking_distance_meters"]), reverse=True)
            
            return {
                "success": True,
                "destination": input_data.destination_location,
                "arrival_time": arrival_time.isoformat(),
                "top_recommendations": recommendations[:3],
                "total_options": len(recommendations)
            }
            
        except Exception as e:
            print(f"Recommendation error: {e}")
            raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")
    
    def _simulate_current_occupancy(self, parking_area: str, hour: int) -> float:
        """Simulate current parking occupancy based on area and time"""
        base_occupancy = {
            "pict_campus": 0.7,        # College parking - high occupancy during classes
            "amanora_mall": 0.6,       # Mall parking - moderate occupancy
            "seasons_mall": 0.5,       # Mall parking - moderate occupancy
            "kharadi_it_park": 0.8,    # IT park - high occupancy during work hours
            "eon_it_park": 0.75        # IT park - high occupancy during work hours
        }.get(parking_area, 0.6)
        
        # Time-based adjustments
        if 8 <= hour <= 10:  # Morning rush
            base_occupancy += 0.2
        elif 17 <= hour <= 19:  # Evening rush
            base_occupancy += 0.15
        elif 12 <= hour <= 14:  # Lunch time
            base_occupancy += 0.1
        
        return min(0.95, max(0.1, base_occupancy))
    
    async def _prepare_prediction_features(self, **kwargs) -> Dict:
        """Prepare features for prediction model"""
        arrival_time = kwargs["arrival_time"]
        weather_data = kwargs["weather_data"]
        travel_data = kwargs["travel_data"]
        
        return {
            "city": "Pune",
            "area": "PICT",
            "parking_lot_name": kwargs["parking_area"],
            "day_of_week": arrival_time.strftime("%A"),
            "time_of_day": arrival_time.hour + arrival_time.minute / 60,
            "is_weekend": 1 if arrival_time.weekday() >= 5 else 0,
            "is_holiday": 0,  # Could be enhanced with holiday API
            "weather_condition": weather_data["weather_condition"],
            "temperature_c": weather_data["temperature_c"],
            "traffic_density": kwargs["traffic_density"],
            "distance_from_user_km": travel_data["distance_km"],
            "vehicle_type": kwargs["vehicle_type"],
            "base_price": 50.0,
            "dynamic_multiplier": 1.0,
            "final_price": 50.0,
            "event_nearby": 0,
            "total_slots": PARKING_AREAS[kwargs["parking_area"]]["total_slots"],
            "occupied_slots": int(kwargs["current_occupancy"] * PARKING_AREAS[kwargs["parking_area"]]["total_slots"]),
            "free_slots": PARKING_AREAS[kwargs["parking_area"]]["total_slots"] - int(kwargs["current_occupancy"] * PARKING_AREAS[kwargs["parking_area"]]["total_slots"]),
            "slots_free_in_15min": max(0, int(PARKING_AREAS[kwargs["parking_area"]]["total_slots"] * (1 - kwargs["current_occupancy"] + 0.1))),
            "future_bookings_15min": max(0, int(kwargs["current_occupancy"] * 10))
        }
    
    async def _model_prediction(self, prediction_data: Dict) -> float:
        """Use trained XGBoost model for prediction"""
        try:
            # Encode categorical features
            encoded_data = prediction_data.copy()
            
            for col in ["city", "area", "parking_lot_name", "day_of_week", "weather_condition", "vehicle_type"]:
                if col in self.encoders and col in encoded_data:
                    try:
                        encoded_data[col] = self.encoders[col].transform([encoded_data[col]])[0]
                    except:
                        encoded_data[col] = 0  # Unknown category
            
            # Build input vector
            input_vector = [encoded_data.get(f, 0) for f in self.feature_order]
            X = np.array(input_vector).reshape(1, -1)
            
            # Predict
            prediction = self.model.predict(X)[0]
            availability_percent = max(0, min(100, prediction * 100))
            
            # Convert numpy types to Python float
            return float(availability_percent)
            
        except Exception as e:
            print(f"Model prediction error: {e}")
            return await self._rule_based_prediction(prediction_data)
    
    async def _rule_based_prediction(self, prediction_data: Dict) -> float:
        """Fallback rule-based prediction when model is not available"""
        base_availability = 70
        
        # Time-based adjustments
        hour = prediction_data["time_of_day"]
        if 8 <= hour <= 10 or 17 <= hour <= 19:  # Peak hours
            base_availability -= 25
        elif 11 <= hour <= 16:  # Normal hours
            base_availability -= 15
        
        # Weekend adjustment
        if prediction_data["is_weekend"]:
            base_availability += 20
        
        # Weather adjustment
        if prediction_data["weather_condition"] == "Rainy":
            base_availability -= 10
        
        # Traffic adjustment
        base_availability -= (prediction_data["traffic_density"] * 15)
        
        # Distance adjustment (closer = less availability due to popularity)
        if prediction_data["distance_from_user_km"] < 1:
            base_availability -= 10
        
        # Current occupancy
        current_occupancy = prediction_data["occupied_slots"] / prediction_data["total_slots"]
        base_availability = base_availability * (1 - current_occupancy)
        
        # Ensure we return Python float
        availability = max(5, min(95, base_availability))
        return float(availability)
    
    async def _calculate_walking_distance(self, origin: Dict, destination: Dict) -> float:
        """Calculate walking distance between two points in meters"""
        # Simple haversine distance calculation
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lon1 = radians(origin["lat"]), radians(origin["lng"])
        lat2, lon2 = radians(destination["lat"]), radians(destination["lng"])
        
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371000  # Radius of earth in meters
        
        return c * r

# Initialize prediction service
prediction_service = ParkingPredictionService()

# -------------------------------
# Enhanced API Routes
# -------------------------------
@app.post("/predict-availability")
async def predict_parking_availability(data: ParkingPredictionInput):
    """Predict availability for specific parking spot when user arrives"""
    return await prediction_service.predict_availability_for_spot(data)

@app.post("/recommend-parking")
async def recommend_parking_spots(data: ParkingRecommendationInput):
    """Get top 3 parking recommendations for destination and time"""
    return await prediction_service.recommend_best_parking(data)

# Legacy endpoint for backward compatibility
@app.post("/predict")
def predict_parking_availability_legacy(data: BookingInput):
    """Legacy prediction endpoint"""
    if not xgb_model or not encoders:
        return {"message": "Model not available", "availability_percent": 50.0}
    
    booking_dict = data.dict()
    
    # Encode categorical features
    for col, le in encoders.items():
        if col in booking_dict:
            try:
                booking_dict[col] = le.transform([booking_dict[col]])[0]
            except:
                booking_dict[col] = 0
    
    # Build input vector
    input_vector = [booking_dict.get(f, 0) for f in feature_order]
    X = np.array(input_vector).reshape(1, -1)
    
    # Predict
    y_pred = xgb_model.predict(X)[0]
    availability_pct = max(0, min(100, y_pred * 100))
    
    return {
        "message": "Prediction successful",
        "availability_percent": float(round(availability_pct, 2))
    }

# -------------------------------
# Health check
# -------------------------------
@app.get("/")
def root():
    return {
        "message": "PICT Parking Prediction System is running 🚗",
        "version": "2.0.0",
        "features": [
            "Real-time availability prediction",
            "Smart parking recommendations",
            "Google Maps integration",
            "Weather-aware predictions",
            "Traffic-based calculations"
        ],
        "endpoints": {
            "/predict-availability": "Predict availability for specific parking spot",
            "/recommend-parking": "Get top 3 parking recommendations",
            "/predict": "Legacy prediction endpoint"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": xgb_model is not None,
        "encoders_loaded": encoders is not None,
        "gmaps_available": gmaps is not None,
        "parking_areas": len(PARKING_AREAS)
    }