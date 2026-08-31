from fastapi import APIRouter, HTTPException

from app.schemas.agent import AgentCreate
from app.agents.agent_registry import (
    register_agent,
    get_agent,
    list_agents,
)
from app.agents.agent_identity import verify_identity
from app.agents.agent_capabilities import get_capabilities
from app.agents.agent_reputation import get_reputation


router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/register")
def create_agent(data: AgentCreate):
    return register_agent(data.model_dump())


@router.get("")
def get_all_agents():
    return list_agents()


@router.get("/{agent_id}")
def get_agent_details(agent_id: str):
    agent = get_agent(agent_id)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return agent


@router.get("/{agent_id}/identity")
def check_identity(agent_id: str):
    result = verify_identity(agent_id)

    if not result["verified"]:
        raise HTTPException(
            status_code=403,
            detail=result["reason"]
        )

    return result


@router.get("/{agent_id}/capabilities")
def check_capabilities(agent_id: str):
    result = get_capabilities(agent_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return result


@router.get("/{agent_id}/trust")
def get_agent_trust(agent_id: str):
    result = get_reputation(agent_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    return result