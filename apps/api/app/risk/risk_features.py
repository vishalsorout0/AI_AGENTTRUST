def calculate_risk_features(
    amount: float,
    category: str,
    agent_max_transaction: float
):
    amount_deviation = 0

    if agent_max_transaction > 0:
        amount_deviation = (
            amount / agent_max_transaction
        )

    return {
        "amount": amount,
        "category": category,
        "amount_deviation": round(amount_deviation, 2)
    }