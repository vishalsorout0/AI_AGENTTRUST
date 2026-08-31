from app.payments.order_service import create_order


def create_payment(
    agent_id: str,
    amount: float,
    category: str
):
    order = create_order(amount)

    if not order["success"]:
        return order

    return {
        "payment_id": None,
        "order_id": order["order_id"],
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "currency": order["currency"],
        "status": "CREATED"
    }