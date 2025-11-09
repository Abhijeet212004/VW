from typing import Dict, Any, List

# Hardcoded user location for simulation
USER_LOCATION = "24 west high, katraj, pune"

def _get_level_from_percent(percent: int) -> str:
    """Helper function to convert percentage to a descriptive level."""
    if percent >= 80:
        return "High"
    elif percent >= 50:
        return "Medium"
    else:
        return "Low"

def find_nearest_parking_lots(user_location: str = USER_LOCATION, limit: int = 3) -> Dict[str, Any]:
    """
    Simulates finding the parking lots closest to the user's current location, 
    including predicted availability data expressed as High, Medium, or Low.
    
    Args:
        user_location: The user's current starting point (hardcoded for now).
        limit: The maximum number of nearest lots to return.
        
    Returns:
        A dictionary containing the nearest parking lots, their approximate distances, 
        and the predicted level of slots that will be available.
    """
    
    # *** Hardcoded Nearby Lots Simulation (using underlying percentages to determine level) ***
    
    # Dummy data simulating results based on the fixed location
    raw_lots_data = [
        {"name": "Pict parking", "distance": "0.5 km", "available": 45, "percent": 92}, # High
        {"name": "VW IT service parking", "distance": "1.2 km", "available": 12, "percent": 85}, # High
        {"name": "katraj parking", "distance": "2.1 km", "available": 90, "percent": 78}, # Medium
        {"name": "back gate parking", "distance": "3.5 km", "available": 20, "percent": 65} # Medium
    ]
    
    nearby_lots = []
    for lot in raw_lots_data:
        lot_data = {
            "name": lot["name"],
            "distance": lot["distance"],
            "available": lot["available"],
            # NEW KEY: availability_prediction_level
            "availability_prediction_level": _get_level_from_percent(lot["percent"])
        }
        nearby_lots.append(lot_data)
    
    # Apply limit
    results = nearby_lots[:limit]
    
    return {
        "status": "success",
        "query_location": user_location,
        "nearest_lots": results,
        "count": len(results),
        "message": f"Found {len(results)} parking lots near {user_location}."
    }