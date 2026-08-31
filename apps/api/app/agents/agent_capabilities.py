from app.agents.agent_registry import get_agent


def get_capabilities(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        return None

    return {
        "agent_id": agent_id,
        "capabilities": agent["capabilities"],
        "max_transaction": agent["max_transaction"],
        "daily_limit": agent["daily_limit"],
        "allowed_categories": agent["allowed_categories"],
    }


def has_capability(agent_id: str, capability: str):
    agent = get_agent(agent_id)

    if not agent:
        return False

    return capability in agent["capabilities"]