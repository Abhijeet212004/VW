from google.adk.agents import Agent
from tools.booking_api_tool import create_new_booking
from .sub_agents.parking.agent import parking_data_agent
from .sub_agents.payment.agent import payment_agent

booking_agent = Agent(
    model='gemini-2.5-flash',
    name='BookingAgent',
    description='Manages the entire multi-step booking transaction, including slot availability, user selection, payment, and final creation.',
    instruction=(
        "You are the Transaction Workflow Manager. Follow these steps for booking:\n"
        "1. **Check Slots:** Get location, time, and duration from the user. Delegate to the 'ParkingDataAgent' to fetch available slots.\n"
        "2. **User Selection:** Present the available slots to the user and **wait for their selection.**\n"
        "3. **Payment:** Calculate the total cost (using HOURLY_RATE * duration). Delegate to the 'PaymentAgent' to process the payment.\n"
        "4. **Final Booking:** Once payment is confirmed, call your internal `create_new_booking` tool with the selected slot, time, and duration.\n"
        "5. **Final Confirmation:** Report the payment and booking status to the user."
    ),
    tools=[create_new_booking], # BookingAgent still holds the final creation tool
    # BookingAgent uses the other agents as sub_agents for the workflow steps
    sub_agents=[parking_data_agent, payment_agent], 
)