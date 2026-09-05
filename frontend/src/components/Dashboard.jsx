"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../lib/api";

import TransactionTable from "./TransactionTable";
import RiskCard from "./RiskCard";
import PaymentCard from "./PaymentCard";
import ApprovalPanel from "./ApprovalPanel";
import AgentCard from "./AgentCard";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [agentsData, auditData] = await Promise.all([
        api.getAgents(),
        api.getAuditLogs()
      ]);

      setAgents(
        Array.isArray(agentsData)
          ? agentsData
          : agentsData?.agents || []
      );

      setAuditLogs(
        Array.isArray(auditData)
          ? auditData
          : auditData?.events || []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalTransactions = auditLogs.length;

  const approved = auditLogs.filter((item) => {
    const decision = String(
      item.decision || ""
    ).toUpperCase();

    return (
      decision === "APPROVED" ||
      decision === "APPROVE"
    );
  }).length;

  const blocked = auditLogs.filter((item) => {
    const decision = String(
      item.decision || ""
    ).toUpperCase();

    return (
      decision === "BLOCKED" ||
      decision === "BLOCK"
    );
  }).length;

  const stepUp = auditLogs.filter((item) => {
    const decision = String(
      item.decision || ""
    )
      .toUpperCase()
      .replace("-", "_");

    return decision === "STEP_UP";
  }).length;

  const averageTrust =
    agents.length > 0
      ? Math.round(
          agents.reduce(
            (sum, agent) =>
              sum + Number(agent.trust_score || 0),
            0
          ) / agents.length
        )
      : 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          Loading AgentTrust...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-brand">
            AgentTrust
          </div>

          <h1>Merchant Console</h1>

          <p>
            Monitor AI agents, transactions, risk
            and trust.
          </p>
        </div>

        <div className="header-actions">
          <Link
            href="/buyer"
            className="primary-button"
          >
            AI Buyer →
          </Link>
        </div>
      </header>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          label="Active Agents"
          value={agents.length}
        />

        <StatCard
          label="Transactions"
          value={totalTransactions}
        />

        <StatCard
          label="Approved"
          value={approved}
          type="success"
        />

        <StatCard
          label="Blocked"
          value={blocked}
          type="danger"
        />

        <StatCard
          label="Step-up"
          value={stepUp}
          type="warning"
        />

        <StatCard
          label="Average Trust"
          value={`${averageTrust}/100`}
        />
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>AI Agents</h2>

              <p>
                Agents currently registered with
                AgentTrust.
              </p>
            </div>

            <Link href="/dashboard/agents">
              View all →
            </Link>
          </div>

          <div className="agent-list">
            {agents.length === 0 ? (
              <div className="empty-state">
                No agents registered yet.
              </div>
            ) : (
              agents
                .slice(0, 5)
                .map((agent) => (
                  <AgentCard
                    key={
                      agent.id ||
                      agent.external_agent_id
                    }
                    agent={agent}
                  />
                ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Decisions</h2>

              <p>
                Latest AgentTrust transaction
                events.
              </p>
            </div>

            <Link href="/dashboard/audit">
              Audit trail →
            </Link>
          </div>

          <TransactionTable
            transactions={auditLogs.slice(0, 8)}
          />
        </div>
      </section>

      <section className="dashboard-grid">
        <RiskCard
          auditLogs={auditLogs}
        />

        <PaymentCard />
      </section>

      <section className="dashboard-panel approval-panel-wrapper">
        <ApprovalPanel />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  type
}) {
  return (
    <div
      className={`stat-card ${type || ""}`}
    >
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}