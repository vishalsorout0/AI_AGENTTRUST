from fastapi import HTTPException

from app.payments.razorpay_client import razorpay_client
from app.db.database import supabase


def create_order(
    amount: float,
    currency: str = "INR",
    transaction_id: str = None
):
    # STEP-UP transactions must be approved first
    if transaction_id and supabase:
        response = (
            supabase
            .table("approvals")
            .select("*")
            .eq("transaction_id", transaction_id)
            .execute()
        )

        if response.data:
            approval = response.data[0]

            if approval.get("status") != "APPROVED":
                raise HTTPException(
                    status_code=403,
                    detail="Human approval is required before payment."
                )

    if not razorpay_client.is_configured():
        return {
            "success": False,
            "status": "NOT_CONFIGURED",
            "message": "Razorpay credentials are missing"
        }

    order = razorpay_client.create_order(
        amount=amount,
        currency=currency
    )

    return {
        "success": True,
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "status": order["status"]
    }