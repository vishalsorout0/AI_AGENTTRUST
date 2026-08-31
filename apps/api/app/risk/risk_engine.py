from app.agents.agent_registry import get_agent

from .anomaly_detector import calculate_anomaly_score
from .velocity_detector import calculate_velocity_risk
from .behavioral_model import calculate_behavioral_risk
from .risk_features import calculate_risk_features


def calculate_transaction_risk(
    agent_id: str,
    amount: float,
    category: str,
    transaction_count: int = 0
):
    agent = get_agent(agent_id)

    if not agent:
        return {
            "risk_score": 100,
            "risk_level": "CRITICAL",
            "reason": "Agent not found"
        }

    max_transaction = agent["max_transaction"]

    features = calculate_risk_features(
        amount,
        category,
        max_transaction
    )

    anomaly_score = calculate_anomaly_score(
        amount,
        max_transaction
    )

    velocity_score = calculate_velocity_risk(
        transaction_count
    )

    behavioral_score = calculate_behavioral_risk(
        amount,
        max_transaction
    )

    risk_score = (
        0.4 * anomaly_score
        + 0.3 * velocity_score
        + 0.3 * behavioral_score
    )

    risk_score = round(risk_score)

    if risk_score < 30:
        risk_level = "LOW"
    elif risk_score < 60:
        risk_level = "MEDIUM"
    elif risk_score < 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "agent_id": agent_id,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "features": features,
        "breakdown": {
            "anomaly": anomaly_score,
            "velocity": velocity_score,
            "behavioral": behavioral_score
        }
    }