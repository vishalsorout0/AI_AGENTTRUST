from app.db.database import supabase


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
        response = (
            supabase
            .table("audit_logs")
            .insert(event)
            .execute()
        )

        if response.data:
            return response.data[0]

    return event


def get_audit_logs():
    if supabase:
        response = (
            supabase
            .table("audit_logs")
            .select("*")
            .execute()
        )

        return response.data or []

    return []


def get_agent_audit_logs(agent_id: str):
    if supabase:
        response = (
            supabase
            .table("audit_logs")
            .select("*")
            .eq("agent_id", agent_id)
            .execute()
        )

        return response.data or []

    return []