from app.agents.agent_registry import get_agent


def check_transaction_limit(agent_id: str, amount: float):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "allowed": False,
            "reason": "Agent not found"
        }

    max_transaction = agent["max_transaction"]

    if amount > max_transaction:
        return {
            "allowed": False,
            "reason": (
                f"Transaction amount ₹{amount} exceeds "
                f"agent limit ₹{max_transaction}"
            ),
            "requested_amount": amount,
            "allowed_amount": max_transaction
        }

    return {
        "allowed": True,
        "requested_amount": amount,
        "allowed_amount": max_transaction
    }