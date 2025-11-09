# agents/main_orchestral_agent.py
from google.adk.agents import Agent
from .sub_agents.booking.agent import booking_agent
from .sub_agents.chat.agent import chat_agent
from .sub_agents.navigation.agent import navigation_agent
from .sub_agents.nearme.agent import nearme_agent

# --- 2. Define the Orchestral Agent (The Router) ---

# a) Main or Orchestral Agent
root_agent = Agent(
    model='gemini-2.5-flash',
    name='agents',
    description=(
        "You are the main system dispatcher and router. Your **sole purpose** is to analyze the user's request "
        "and delegate the task to the most appropriate specialized **sub-agent** for execution. "
        "Do NOT try to answer the question yourself or use tools directly. Delegate."
    ),
    instruction=(
        "You are the master router for the agent system. Analyze the user's intent: "
        "If they are asking about availability, booking, or cancellation, delegate to the 'booking_agent'. "
        "If they are asking a general, informational, or FAQ question, delegate to the 'chat_agent'. "
        "If they are asking for the navigation delegate to the navigation_agent"
        "If they are asking for the nearby slots delegate to the nearme_agent"
        "Always delegate; never answer."
    ),
    # Crucially, list the specialized agents as sub_agents for delegation
    sub_agents=[booking_agent, chat_agent, navigation_agent, nearme_agent],
    tools=[],
)
