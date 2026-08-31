from datetime import datetime, timezone


def create_audit_event(
    agent_id: str,
    amount: float,
    category: str,
    decision: str,
    reason: str,
    risk_score: int = 0,
    trust_score: int = 0
):
    return {
        "event_type": "TRANSACTION_DECISION",
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "decision": decision,
        "reason": reason,
        "risk_score": risk_score,
        "trust_score": trust_score,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }