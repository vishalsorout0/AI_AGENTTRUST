from app.payments.razorpay_client import razorpay_client


def create_order(
    amount: float,
    currency: str = "INR"
):
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