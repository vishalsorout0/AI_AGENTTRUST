"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAudit();
  }, []);

  async function loadAudit() {
    try {
      setLoading(true);

      const data = await api.getAuditLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to load audit trail."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <nav className="top-nav">
        <Link href="/dashboard">
          ← Merchant Console
        </Link>

        <span>AgentTrust / Audit</span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          IMMUTABLE DECISION TRAIL
        </span>

        <h1>Audit Trail</h1>

        <p>
          Every AI transaction decision is recorded
          for merchant visibility.
        </p>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading audit events...
        </div>
      ) : (
        <div className="audit-card">
          {logs.length === 0 ? (
            <div className="empty-state">
              No audit events found.
            </div>
          ) : (
            <div className="audit-list">
              {logs.map((log, index) => (
                <AuditRow
                  key={
                    log.id ||
                    log.transaction_id ||
                    index
                  }
                  log={log}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function AuditRow({ log }) {
  const decision = String(
    log.decision ||
      log.status ||
      "UNKNOWN"
  ).toUpperCase();

  let decisionClass = "neutral";

  if (
    decision === "APPROVE" ||
    decision === "APPROVED"
  ) {
    decisionClass = "approved";
  }

  if (
    decision === "BLOCK" ||
    decision === "BLOCKED"
  ) {
    decisionClass = "blocked";
  }

  if (
    decision === "STEP_UP" ||
    decision === "STEP-UP"
  ) {
    decisionClass = "stepup";
  }

  return (
    <div className="audit-row">
      <div className="audit-time">
        {formatDate(log.created_at)}
      </div>

      <div className="audit-main">
        <strong>
          {log.event ||
            log.action ||
            "Transaction decision"}
        </strong>

        <span>
          Agent: {log.agent_id || "--"}
        </span>

        <span>
          Transaction:{" "}
          {log.transaction_id || "--"}
        </span>
      </div>

      <div className="audit-risk">
        <span>Risk</span>
        <strong>
          {log.risk_score ?? "--"}
        </strong>
      </div>

      <span
        className={`decision-badge ${decisionClass}`}
      >
        {decision.replace("_", "-")}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}