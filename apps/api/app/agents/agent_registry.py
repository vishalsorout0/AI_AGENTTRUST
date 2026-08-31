from app.core.security import generate_id


agents = {}


def register_agent(data: dict):
    agent_id = generate_id("agent")

    agent = {
        "id": agent_id,
        "external_agent_id": data.get("external_agent_id"),
        "name": data.get("name"),
        "owner_id": data.get("owner_id"),
        "status": "ACTIVE",
        "trust_score": 50,
        "capabilities": data.get("capabilities", []),
        "max_transaction": data.get("max_transaction", 5000),
        "daily_limit": data.get("daily_limit", 20000),
        "allowed_categories": data.get(
            "allowed_categories",
            ["ELECTRONICS", "BOOKS"]
        ),
    }

    agents[agent_id] = agent

    return agent


def get_agent(agent_id: str):
    return agents.get(agent_id)


def list_agents():
    return list(agents.values())