from app.audit.audit_event import create_audit_event
from app.db.database import supabase

_audit_logs = []


def save_audit_event(
    agent_id: str,
    amount: float,
    category: str,
    decision: str,
    reason: str,
    risk_score: int = 0,
    trust_score: int = 0
):
    event = {
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "decision": decision,
        "reason": reason,
        "risk_score": risk_score,
        "trust_score": trust_score
    }

    if supabase:
        supabase.table(
            "audit_logs"
        ).insert(event).execute()

    return event


def get_audit_logs():
    return _audit_logs


def get_agent_audit_logs(agent_id: str):
    return [
        event
        for event in _audit_logs
        if event["agent_id"] == agent_id
    ]