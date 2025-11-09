# tools/payment_tool.py
from typing import Dict, Any

amount = 50
booking_id = "4565"

def process_payment(token: str = "default_user_token") -> Dict[str, Any]:
    """
    Simulates processing a financial transaction for the given amount.
    
    Args:
        amount: The total cost to deduct.
        booking_id: The ID associated with the booking (used for reference).
        token: A dummy payment token representing the user's payment method.
        
    Returns:
        A dictionary confirming the payment status.
    """
    # *** Dummy Payment Logic ***
    
    if amount > 500.00:
        return {"status": "failed", "transaction_id": None, "message": "Payment failed: Amount exceeds daily limit."}
        
    # Simulate success
    transaction_id = f"TXN-{hash(booking_id + token) % 100000}"
    
    return {
        "status": "success",
        "transaction_id": transaction_id,
        "amount_paid": f"${amount:.2f}",
        "message": f"Payment successful! Deducted ${amount:.2f}. Transaction ID: {transaction_id}"
    }