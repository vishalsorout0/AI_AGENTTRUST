from app.core.security import generate_id
from app.db.database import supabase


agents = {}


def register_agent(agent):
    if "id" not in agent:
        agent["id"] = generate_id("agent")

    if "status" not in agent:
        agent["status"] = "ACTIVE"

    agents[agent["id"]] = agent

    if supabase:
        supabase.table("agents").upsert({
            "id": agent["id"],
            "external_agent_id": agent.get("external_agent_id"),
            "name": agent.get("name"),
            "owner_id": agent.get("owner_id"),
            "status": agent.get("status"),
            "trust_score": agent.get("trust_score", 50),
            "capabilities": agent.get("capabilities", []),
            "max_transaction": agent.get("max_transaction"),
            "daily_limit": agent.get("daily_limit"),
            "allowed_categories": agent.get("allowed_categories", [])
        }).execute()

    return agent


def get_agent(agent_id: str):
    if agent_id in agents:
        return agents[agent_id]

    if supabase:
        response = (
            supabase
            .table("agents")
            .select("*")
            .eq("id", agent_id)
            .execute()
        )

        if response.data:
            agent = response.data[0]
            agents[agent_id] = agent
            return agent

    return None


def list_agents():
    if supabase:
        response = (
            supabase
            .table("agents")
            .select("*")
            .execute()
        )

        data = response.data or []

        for agent in data:
            if agent.get("id"):
                agents[agent["id"]] = agent

        return data

    return list(agents.values())