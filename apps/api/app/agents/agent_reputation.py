from app.agents.agent_registry import get_agent


def get_reputation(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        return None

    return {
        "agent_id": agent_id,
        "trust_score": agent["trust_score"],
        "status": agent["status"],
    }


def update_trust_score(agent_id: str, score: float):
    agent = get_agent(agent_id)

    if not agent:
        return None

    agent["trust_score"] = max(0, min(100, score))

    return agent["trust_score"]