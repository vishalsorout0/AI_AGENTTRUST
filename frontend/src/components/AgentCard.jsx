"use client";

import Link from "next/link";

export default function AgentCard({ agent }) {
  const trust = Number(agent.trust_score || 0);

  const status = agent.status || "UNKNOWN";

  return (
    <div className="agent-card">
      <div className="agent-main">
        <div className="agent-avatar">
          {(agent.name || "A").charAt(0).toUpperCase()}
        </div>

        <div>
          <h3>{agent.name || "Unnamed Agent"}</h3>

          <p>
            {agent.external_agent_id ||
              agent.id ||
              "Unknown agent ID"}
          </p>
        </div>
      </div>

      <div className="agent-status">
        <span className={`status-dot ${status.toLowerCase()}`} />
        {status}
      </div>

      <div className="trust-section">
        <div className="trust-header">
          <span>Trust Score</span>
          <strong>{trust}/100</strong>
        </div>

        <div className="trust-bar">
          <div
            className="trust-fill"
            style={{
              width: `${Math.min(Math.max(trust, 0), 100)}%`
            }}
          />
        </div>
      </div>

      <div className="agent-meta">
        <div>
          <span>Max transaction</span>
          <strong>
            ₹{Number(agent.max_transaction || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>Daily limit</span>
          <strong>
            ₹{Number(agent.daily_limit || 0).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      {agent.id && (
        <Link
          href={`/dashboard/agents?id=${encodeURIComponent(agent.id)}`}
          className="agent-link"
        >
          View agent →
        </Link>
      )}
    </div>
  );
}