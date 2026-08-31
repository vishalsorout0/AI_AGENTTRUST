from fastapi import APIRouter

from app.audit.audit_service import (
    get_audit_logs,
    get_agent_audit_logs
)

router = APIRouter(
    prefix="/audit",
    tags=["Audit"]
)


@router.get("/")
def get_all_audit_logs():
    return {
        "count": len(get_audit_logs()),
        "events": get_audit_logs()
    }


@router.get("/{agent_id}")
def get_agent_logs(agent_id: str):
    logs = get_agent_audit_logs(agent_id)

    return {
        "agent_id": agent_id,
        "count": len(logs),
        "events": logs
    }