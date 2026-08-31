from datetime import datetime, timezone


def validate_delegation(
    agent: dict,
    amount: float,
    category: str
):
    if not agent:
        return {
            "allowed": False,
            "reason": "Agent does not exist"
        }

    if agent["status"] != "ACTIVE":
        return {
            "allowed": False,
            "reason": f"Agent status is {agent['status']}"
        }

    if amount > agent["max_transaction"]:
        return {
            "allowed": False,
            "reason": "Amount exceeds delegated transaction limit"
        }

    if category not in agent["allowed_categories"]:
        return {
            "allowed": False,
            "reason": "Category is outside delegated scope"
        }

    return {
        "allowed": True,
        "reason": "Delegation is valid",
        "validated_at": datetime.now(timezone.utc).isoformat()
    }