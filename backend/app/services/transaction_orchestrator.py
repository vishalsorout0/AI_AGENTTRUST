from app.agents.agent_identity import verify_identity
from app.agents.agent_registry import get_agent
from app.authorization.authorization_engine import authorize_transaction
from app.policy.policy_engine import evaluate_policy
from app.risk.risk_engine import calculate_transaction_risk
from app.risk.trust_score import calculate_trust_score
from app.audit.audit_service import save_audit_event
from app.api.routes.approvals import create_approval_request
from app.db.database import supabase
import uuid


def process_transaction(
    agent_id: str,
    amount: float,
    category: str,
    transaction_count: int = 0
):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "decision": "BLOCK",
            "reason": "Agent not found"
        }

    identity = verify_identity(agent_id)

    if not identity["verified"]:
        return {
            "decision": "BLOCK",
            "reason": identity["reason"]
        }

    authorization = authorize_transaction(
        agent_id,
        amount,
        category
    )

    if authorization["decision"] == "BLOCK":
        return {
            "decision": "BLOCK",
            "reason": authorization["reason"],
            "authorization": authorization
        }

    policy = evaluate_policy(
        amount,
        category
    )

    if policy["decision"] == "BLOCK":
        return {
            "decision": "BLOCK",
            "reason": policy["reason"],
            "authorization": authorization,
            "policy": policy
        }

    risk = calculate_transaction_risk(
        agent_id,
        amount,
        category,
        transaction_count
    )

    trust = calculate_trust_score(agent_id)

    risk_score = risk["risk_score"]
    trust_score = trust["trust_score"]
    approval = None
    transaction_id = None

    if risk_score >= 80:
        final_decision = "BLOCK"
        reason = "Transaction risk is critically high"

    elif policy["decision"] == "STEP_UP":
        final_decision = "STEP_UP"
        reason = "Human approval required by policy"
        transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
        approval = approval = create_approval_request(
            transaction_id=transaction_id,
            agent_id=agent_id,
            amount=amount,
            category=category
        )

    elif risk_score >= 60:
        final_decision = "STEP_UP"
        reason = "Transaction has elevated risk"
        transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
        approval = create_approval_request(transaction_id)

    elif trust_score < 40:
        final_decision = "STEP_UP"
        reason = "Agent trust score is too low"
        transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
        approval = create_approval_request(transaction_id)

    else:
        final_decision = "APPROVE"
        reason = "All trust, risk, policy and authorization checks passed"



    if not transaction_id:
        transaction_id = f"txn_{uuid.uuid4().hex[:16]}"

    if supabase:
        supabase.table("transactions").upsert({
        "id": transaction_id,
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "decision": final_decision,
        "reason": reason,
        "risk_score": risk_score,
        "trust_score": trust_score,
        "status": final_decision
        }).execute()



    save_audit_event(
        agent_id=agent_id,
        amount=amount,
        category=category,
        decision=final_decision,
        reason=reason,
        risk_score=risk_score,
        trust_score=trust_score
    )

    return {
        "decision": final_decision,
        "reason": reason,
        "agent_id": agent_id,
        "amount": amount,
        "category": category,
        "trust_score": trust_score,
        "risk_score": risk_score,
        "risk_level": risk["risk_level"],
        "authorization": authorization,
        "policy": policy,
        "risk": risk,
        "trust": trust,
        "transaction_id": transaction_id,
        "approval": approval,
    }