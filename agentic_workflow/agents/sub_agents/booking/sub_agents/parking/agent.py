from google.adk.agents import Agent
from tools.parking_db_tool import get_available_slots

parking_data_agent = Agent(
    model='gemini-2.5-flash',
    name='ParkingDataAgent',
    description='Specialist in retrieving real-time availability and cost data for parking lots.',
    instruction='You must use the `get_available_slots` tool to find and report available parking slots.',
    tools=[get_available_slots], 
)