from app.payments.order_service import create_order
from app.db.database import supabase


def create_payment(
    agent_id: str,
    amount: float,
    category: str
):
    order = create_order(amount)

    if not order["success"]:
        return order

    payment = {
        "payment_id": None,
        "order_id": order["order_id"],
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "currency": order["currency"],
        "status": "CREATED"
    }

    if supabase:
        supabase.table("payments").upsert({
            "payment_id": payment["order_id"],
            "order_id": payment["order_id"],
            "agent_id": agent_id,
            "amount": amount,
            "category": category,
            "currency": order["currency"],
            "status": "CREATED"
        }).execute()

    return payment