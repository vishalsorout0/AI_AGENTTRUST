def create_refund(
    payment_id: str,
    amount: float
):
    return {
        "payment_id": payment_id,
        "refund_amount": amount,
        "status": "REFUND_INITIATED"
    }