from google.adk.agents import Agent
from tools.payment_processor_tool import process_payment

payment_agent = Agent(
    model='gemini-2.5-flash',
    name='PaymentAgent',
    description='Dedicated agent for handling all financial transactions and payment processing.',
    instruction='You must use the `process_payment` tool to deduct the necessary funds.',
    tools=[process_payment], 
)