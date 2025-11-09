from google.adk.agents import Agent
from tools.nearme_tool import find_nearest_parking_lots

# f) NearMe Agent
nearme_agent = Agent(
    model='gemini-2.5-flash',
    name='NearMeAgent',
    description='Finds the nearest parking lots to the user, including availability predictions (High/Medium/Low).',
    instruction='You must use the `find_nearest_parking_lots` tool to locate and report nearby options to the user.',
    tools=[find_nearest_parking_lots], # The tool is assigned here
)