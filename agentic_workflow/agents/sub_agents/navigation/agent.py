from google.adk.agents import Agent
from tools.navigation_service_tool import get_directions_to_lot


navigation_agent = Agent(
    model='gemini-2.5-flash',
    name='navigation',
    description='Specialist in providing directions and guidance to specific company locations or booked parking lots.',
    instruction='You must use the `get_directions_to_lot` tool to find and provide the best route to the specified lot. Extract the destination lot name from the user query.',
    tools=[get_directions_to_lot], 
)