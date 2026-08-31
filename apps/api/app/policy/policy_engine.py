from app.policy.policy_rules import (
    amount_policy,
    high_risk_category_policy
)


def evaluate_policy(amount: float, category: str):
    amount_result = amount_policy(amount)

    if amount_result["decision"] == "STEP_UP":
        return amount_result

    category_result = high_risk_category_policy(category)

    if category_result["decision"] == "BLOCK":
        return category_result

    return {
        "decision": "APPROVE",
        "reason": "All merchant policies passed."
    }