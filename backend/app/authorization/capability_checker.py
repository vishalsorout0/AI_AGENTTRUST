from app.agents.agent_capabilities import has_capability
from app.agents.agent_registry import get_agent


def check_purchase_capability(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "allowed": False,
            "reason": "Agent not found"
        }

    if not has_capability(agent_id, "PURCHASE"):
        return {
            "allowed": False,
            "reason": "Agent does not have PURCHASE capability"
        }

    return {
        "allowed": True,
        "reason": "PURCHASE capability verified"
    }


def check_category(agent_id: str, category: str):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "allowed": False,
            "reason": "Agent not found"
        }

    allowed_categories = agent["allowed_categories"]

    if category not in allowed_categories:
        return {
            "allowed": False,
            "reason": f"Category '{category}' is not authorized",
            "allowed_categories": allowed_categories
        }

    return {
        "allowed": True,
        "reason": "Category authorized"
    }