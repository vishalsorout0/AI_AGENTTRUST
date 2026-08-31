from datetime import datetime, timezone

from app.agents.agent_registry import get_agent


def verify_identity(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "verified": False,
            "reason": "Agent not found"
        }

    if agent["status"] != "ACTIVE":
        return {
            "verified": False,
            "reason": f"Agent status is {agent['status']}"
        }

    return {
        "verified": True,
        "agent_id": agent_id,
        "status": agent["status"],
        "verified_at": datetime.now(timezone.utc).isoformat()
    }