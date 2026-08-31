from app.agents.agent_registry import get_agent


def calculate_trust_score(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "trust_score": 0,
            "reason": "Agent not found"
        }

    # Demo trust calculation
    identity_score = 25
    capability_score = 20
    status_score = 20
    history_score = 15
    reputation_score = 10

    score = (
        identity_score
        + capability_score
        + status_score
        + history_score
        + reputation_score
    )

    return {
        "agent_id": agent_id,
        "trust_score": score,
        "breakdown": {
            "identity": identity_score,
            "capability": capability_score,
            "status": status_score,
            "history": history_score,
            "reputation": reputation_score
        }
    }