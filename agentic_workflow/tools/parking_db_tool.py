from typing import Dict, Any, List

def get_available_slots(location_name: str, start_time: str, duration_hours: float) -> Dict[str, Any]:
    """
    Retrieves the currently available parking slots for a given location, time, and duration.
    
    Args:
        location_name: The name or ID of the parking lot (e.g., 'West Garage A').
        start_time: The specific time for the booking in YYYY-MM-DD HH:MM format.
        duration_hours: The length of the booking in hours.
        
    Returns:
        A dictionary containing a list of available slots and general information.
    """
    # *** Dummy Available Slot Data ***
    
    # Simulate different availability based on location
    if "pict parking" in location_name:
        slots = ["A101", "A102", "A105"]
        description = "Premium floor slots are available."
    elif "West Garage B" in location_name:
        slots = ["B301", "B305", "B306", "B308"]
        description = "Standard floor slots are available."
    else:
        slots = ["C1", "C2"]
        description = "Limited availability."

    return {
        "status": "available",
        "location": location_name,
        "query_time": start_time,
        "available_slots": slots,
        "slot_count": len(slots),
        "message": f"Found {len(slots)} available slots for {location_name}. {description}"
    }