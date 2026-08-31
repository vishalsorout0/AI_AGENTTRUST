def amount_policy(amount: float):
    if amount > 10000:
        return {
            "decision": "STEP_UP",
            "reason": "Transaction amount exceeds ₹10,000. Human approval required."
        }

    return {
        "decision": "APPROVE",
        "reason": "Transaction is within automatic approval limit."
    }


def high_risk_category_policy(category: str):
    high_risk_categories = [
        "HIGH_RISK",
        "CRYPTO",
        "GAMBLING"
    ]

    if category.upper() in high_risk_categories:
        return {
            "decision": "BLOCK",
            "reason": f"Category '{category}' is blocked by merchant policy."
        }

    return {
        "decision": "APPROVE",
        "reason": "Category is allowed."
    }