from app.agents.agent_registry import get_agent
from app.agents.agent_identity import verify_identity
from app.authorization.capability_checker import (
    check_purchase_capability,
    check_category,
)
from app.authorization.spending_limits import check_transaction_limit
from app.authorization.delegation import validate_delegation


def authorize_transaction(
    agent_id: str,
    amount: float,
    category: str
):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": "Agent not found"
        }

    identity = verify_identity(agent_id)

    if not identity["verified"]:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": identity["reason"]
        }

    capability = check_purchase_capability(agent_id)

    if not capability["allowed"]:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": capability["reason"]
        }

    amount_check = check_transaction_limit(
        agent_id,
        amount
    )

    if not amount_check["allowed"]:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": amount_check["reason"],
            "requested_amount": amount,
            "allowed_amount": agent["max_transaction"]
        }

    category_check = check_category(
        agent_id,
        category
    )

    if not category_check["allowed"]:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": category_check["reason"]
        }

    delegation = validate_delegation(
        agent,
        amount,
        category
    )

    if not delegation["allowed"]:
        return {
            "authorized": False,
            "decision": "BLOCK",
            "reason": delegation["reason"]
        }

    return {
        "authorized": True,
        "decision": "APPROVE",
        "reason": "Agent is authorized for this transaction",
        "agent_id": agent_id,
        "amount": amount,
        "category": category
    }