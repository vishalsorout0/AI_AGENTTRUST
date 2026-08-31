from app.services.transaction_orchestrator import process_transaction


def process_purchase(
    agent_id: str,
    amount: float,
    category: str,
    transaction_count: int = 0
):
    return process_transaction(
        agent_id=agent_id,
        amount=amount,
        category=category,
        transaction_count=transaction_count
    )