def explain_decision(decision_data: dict):
    decision = decision_data.get("decision")
    reason = decision_data.get("reason")

    if decision == "APPROVE":
        explanation = "Transaction passed authorization, policy, risk and trust checks."

    elif decision == "STEP_UP":
        explanation = "Transaction requires additional human approval."

    else:
        explanation = "Transaction was blocked because one or more security checks failed."

    return {
        "decision": decision,
        "reason": reason,
        "explanation": explanation
    }