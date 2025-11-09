import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import json
import pickle
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)

# Major parking destinations in Pune area
PARKING_AREAS = {
    "pict_campus": {"total_slots": 500, "base_occupancy": 0.7, "popularity": 0.9, "area": "Kharadi"},
    "amanora_mall": {"total_slots": 800, "base_occupancy": 0.6, "popularity": 0.8, "area": "Hadapsar"},
    "seasons_mall": {"total_slots": 600, "base_occupancy": 0.5, "popularity": 0.7, "area": "Magarpatta"},
    "kharadi_it_park": {"total_slots": 400, "base_occupancy": 0.8, "popularity": 0.9, "area": "Kharadi"},
    "eon_it_park": {"total_slots": 350, "base_occupancy": 0.75, "popularity": 0.8, "area": "Kharadi"}
}

PUNE_WEATHER_PATTERNS = {
    "monsoon": {"months": [6, 7, 8, 9], "conditions": ["Rainy", "Cloudy"], "temp_range": (24, 32)},
    "winter": {"months": [12, 1, 2], "conditions": ["Clear", "Cloudy"], "temp_range": (15, 28)},
    "summer": {"months": [3, 4, 5], "conditions": ["Clear", "Cloudy"], "temp_range": (25, 42)},
    "post_monsoon": {"months": [10, 11], "conditions": ["Clear", "Cloudy"], "temp_range": (20, 35)}
}

def generate_realistic_parking_data(num_samples=15000):
    """Generate realistic parking data for major Pune destinations"""
    
    data = []
    start_date = datetime(2023, 1, 1)
    
    for i in range(num_samples):
        # Random date and time over past 2 years
        random_date = start_date + timedelta(days=random.randint(0, 730))
        hour = random.randint(6, 22)  # College hours 6 AM to 10 PM
        minute = random.randint(0, 59)
        
        # Time features
        time_of_day = hour + minute / 60
        day_of_week = random_date.strftime("%A")
        is_weekend = 1 if random_date.weekday() >= 5 else 0
        is_holiday = 1 if random.random() < 0.05 else 0  # 5% chance of holiday
        
        # Location features
        parking_area = random.choice(list(PARKING_AREAS.keys()))
        area_info = PARKING_AREAS[parking_area]
        
        # Weather based on month
        month = random_date.month
        season = None
        for season_name, season_info in PUNE_WEATHER_PATTERNS.items():
            if month in season_info["months"]:
                season = season_info
                break
        
        weather_condition = random.choice(season["conditions"])
        temperature_c = random.uniform(season["temp_range"][0], season["temp_range"][1])
        
        # Traffic patterns
        traffic_base = 0.3
        if 8 <= hour <= 10 or 17 <= hour <= 19:  # Peak hours
            traffic_base = 0.8
        elif 11 <= hour <= 16:  # Normal college hours
            traffic_base = 0.6
        elif hour < 7 or hour > 20:  # Off hours
            traffic_base = 0.2
        
        # Add randomness and weather effect
        traffic_density = traffic_base + random.uniform(-0.2, 0.2)
        if weather_condition == "Rainy":
            traffic_density += 0.3  # More traffic in rain
        traffic_density = max(0.1, min(1.0, traffic_density))
        
        # Distance simulation (PICT students/staff coming from different areas of Pune)
        distance_from_user_km = random.uniform(0.5, 25.0)  # 0.5km to 25km
        
        # Vehicle type
        vehicle_type = random.choices(
            ["car", "motorcycle", "scooter", "bicycle"],
            weights=[0.4, 0.3, 0.25, 0.05]
        )[0]
        
        # Event simulation
        event_nearby = 1 if random.random() < 0.1 else 0  # 10% chance of event
        
        # Base occupancy patterns
        base_occupancy = area_info["base_occupancy"]
        
        # Time-based occupancy adjustments
        if 8 <= hour <= 10:  # Morning rush (students arriving)
            occupancy_multiplier = 1.4
        elif 10 <= hour <= 16:  # Peak college hours
            occupancy_multiplier = 1.2
        elif 17 <= hour <= 19:  # Evening rush (students leaving)
            occupancy_multiplier = 0.8  # People leaving, so less occupancy
        elif hour < 8 or hour > 19:  # Off hours
            occupancy_multiplier = 0.3
        else:
            occupancy_multiplier = 1.0
        
        # Weekend adjustments
        if is_weekend:
            occupancy_multiplier *= 0.4  # Much less crowded on weekends
        
        # Holiday adjustments
        if is_holiday:
            occupancy_multiplier *= 0.2  # Very less crowded on holidays
        
        # Weather effects
        if weather_condition == "Rainy":
            occupancy_multiplier *= 1.2  # More people drive instead of walking
        
        # Event effects
        if event_nearby:
            occupancy_multiplier *= 1.5  # Events increase parking demand
        
        # Distance effect on area popularity
        if distance_from_user_km < 2:  # Nearby users prefer convenient spots
            occupancy_multiplier *= area_info["popularity"]
        
        # Calculate final occupancy
        final_occupancy = min(0.98, max(0.05, base_occupancy * occupancy_multiplier + random.uniform(-0.1, 0.1)))
        
        # Slot calculations
        total_slots = area_info["total_slots"]
        occupied_slots = int(final_occupancy * total_slots)
        free_slots = total_slots - occupied_slots
        
        # Future predictions (slots that will be free in 15 min)
        turnover_rate = 0.1 + random.uniform(-0.05, 0.05)  # 10% turnover every 15 min
        slots_free_in_15min = min(total_slots, free_slots + int(occupied_slots * turnover_rate))
        future_bookings_15min = max(0, int(free_slots * 0.3 * random.uniform(0.5, 1.5)))
        
        # Pricing (simple dynamic pricing)
        base_price = 50.0  # Base price in rupees
        dynamic_multiplier = 1.0
        
        if final_occupancy > 0.8:  # High occupancy
            dynamic_multiplier = 1.5
        elif final_occupancy > 0.6:
            dynamic_multiplier = 1.2
        elif final_occupancy < 0.3:  # Low occupancy
            dynamic_multiplier = 0.8
        
        if weather_condition == "Rainy":
            dynamic_multiplier *= 1.2
        
        if event_nearby:
            dynamic_multiplier *= 1.3
        
        final_price = base_price * dynamic_multiplier
        
        # Target variable: availability when user reaches (0-1 scale)
        # This is what we want to predict
        travel_time_minutes = distance_from_user_km * 3 + random.uniform(-5, 5)  # Rough estimate
        
        # Predict availability after travel time
        future_occupancy_change = random.uniform(-0.15, 0.15)  # Natural fluctuation
        if 8 <= hour <= 10:  # Morning rush - occupancy increases
            future_occupancy_change += 0.1
        elif 17 <= hour <= 19:  # Evening - occupancy decreases
            future_occupancy_change -= 0.1
        
        predicted_occupancy = max(0.02, min(0.98, final_occupancy + future_occupancy_change))
        availability_score = 1 - predicted_occupancy  # Convert occupancy to availability
        
        # Create data point
        data_point = {
            "city": "Pune",
            "area": area_info["area"],  # Use the actual area (Kharadi, Hadapsar, etc.)
            "parking_lot_name": parking_area,
            "day_of_week": day_of_week,
            "time_of_day": round(time_of_day, 2),
            "is_weekend": is_weekend,
            "is_holiday": is_holiday,
            "weather_condition": weather_condition,
            "temperature_c": round(temperature_c, 1),
            "traffic_density": round(traffic_density, 3),
            "distance_from_user_km": round(distance_from_user_km, 2),
            "vehicle_type": vehicle_type,
            "base_price": base_price,
            "dynamic_multiplier": round(dynamic_multiplier, 2),
            "final_price": round(final_price, 2),
            "event_nearby": event_nearby,
            "total_slots": total_slots,
            "occupied_slots": occupied_slots,
            "free_slots": free_slots,
            "slots_free_in_15min": slots_free_in_15min,
            "future_bookings_15min": future_bookings_15min,
            "availability_score": round(availability_score, 4)  # Target variable
        }
        
        data.append(data_point)
        
        if i % 1000 == 0:
            print(f"Generated {i} samples...")
    
    return pd.DataFrame(data)

def train_parking_prediction_model(df):
    """Train XGBoost model with generated data"""
    
    print(f"Training with {len(df)} samples")
    
    # Prepare categorical encoders
    categorical_cols = ['city', 'area', 'parking_lot_name', 'day_of_week', 'weather_condition', 'vehicle_type']
    encoders = {}
    
    for col in categorical_cols:
        encoders[col] = LabelEncoder()
        df[col] = encoders[col].fit_transform(df[col])
    
    # Save encoders
    with open('categorical_encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    
    print("Categorical encoders saved")
    
    # Feature columns (all except target)
    feature_cols = [col for col in df.columns if col != 'availability_score']
    
    # Save feature order
    with open('dynamic_features.json', 'w') as f:
        json.dump(feature_cols, f)
    
    print("Feature order saved")
    
    # Prepare training data
    X = df[feature_cols]
    y = df['availability_score']
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost model
    model = xgb.XGBRegressor(
        n_estimators=1000,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        early_stopping_rounds=50
    )
    
    print("Training XGBoost model...")
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=100
    )
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"Mean Absolute Error: {mae:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Convert to percentage terms for interpretability
    y_test_pct = y_test * 100
    y_pred_pct = y_pred * 100
    mae_pct = mean_absolute_error(y_test_pct, y_pred_pct)
    
    print(f"Mean Absolute Error (in %): {mae_pct:.2f}%")
    
    # Save model
    model.save_model('xgb_parking_dynamic.json')
    print("Model saved successfully!")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    return model, encoders

def main():
    """Generate data and train model"""
    print("Starting PICT Parking Prediction Model Training...")
    print("=" * 50)
    
    # Generate training data
    print("Generating realistic parking data...")
    df = generate_realistic_parking_data(15000)
    
    print(f"Generated dataset shape: {df.shape}")
    print("\nDataset info:")
    print(df.info())
    
    print("\nTarget variable distribution:")
    print(df['availability_score'].describe())
    
    # Save raw data for analysis
    df.to_csv('pict_parking_training_data.csv', index=False)
    print("Training data saved to 'pict_parking_training_data.csv'")
    
    # Train model
    print("\nStarting model training...")
    model, encoders = train_parking_prediction_model(df)
    
    print("\n" + "=" * 50)
    print("Training completed successfully!")
    print("Files created:")
    print("- xgb_parking_dynamic.json (trained model)")
    print("- categorical_encoders.pkl (label encoders)")
    print("- dynamic_features.json (feature order)")
    print("- pict_parking_training_data.csv (training data)")
    
    return model, encoders, df

if __name__ == "__main__":
    model, encoders, data = main()