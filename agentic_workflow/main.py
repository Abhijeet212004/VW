# main.py
from dotenv import load_dotenv
from VW.agentic_workflow.agents.agent import root_agent

# This line ensures your GOOGLE_API_KEY from the .env file 
# is loaded into the environment variables before the ADK CLI runs.
load_dotenv()


print("Environment setup complete. Ready to run via ADK CLI.")
