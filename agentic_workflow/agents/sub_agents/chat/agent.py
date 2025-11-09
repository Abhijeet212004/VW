from google.adk.agents import Agent

chat_agent = Agent(
    model='gemini-2.5-flash',
    name='chat',
    description='Answers general, informational, and FAQ questions by retrieving context from internal documentation (RAG). Delegate all non-transactional questions here.',
    instruction="You are a polite Chat Agent.",
    tools=[], # Tools are removed for now
)