"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";

export default function RiskPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskData();
  }, []);

  async function loadRiskData() {
    try {
      const data = await api.getAuditLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const scores = logs
    .map((log) => Number(log.risk_score))
    .filter((score) => !Number.isNaN(score));

  const average =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (sum, score) => sum + score,
            0
          ) / scores.length
        )
      : 0;

  const highRisk = scores.filter(
    (score) => score >= 70
  ).length;

  const mediumRisk = scores.filter(
    (score) => score >= 40 && score < 70
  ).length;

  const lowRisk = scores.filter(
    (score) => score < 40
  ).length;

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="loading-state">
          Loading risk intelligence...
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <nav className="top-nav">
        <Link href="/dashboard">
          ← Merchant Console
        </Link>

        <span>AgentTrust / Risk</span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          TRANSACTION INTELLIGENCE
        </span>

        <h1>Risk Center</h1>

        <p>
          Monitor transaction risk before money
          reaches the payment layer.
        </p>
      </div>

      <div className="risk-overview-grid">
        <RiskMetric
          label="Average Risk"
          value={`${average}/100`}
        />

        <RiskMetric
          label="High Risk"
          value={highRisk}
          type="danger"
        />

        <RiskMetric
          label="Medium Risk"
          value={mediumRisk}
          type="warning"
        />

        <RiskMetric
          label="Low Risk"
          value={lowRisk}
          type="success"
        />
      </div>

      <div className="risk-distribution">
        <div>
          <span>LOW</span>
          <div className="distribution-bar">
            <div
              style={{
                width: `${percentage(
                  lowRisk,
                  scores.length
                )}%`
              }}
            />
          </div>
        </div>

        <div>
          <span>MEDIUM</span>
          <div className="distribution-bar">
            <div
              style={{
                width: `${percentage(
                  mediumRisk,
                  scores.length
                )}%`
              }}
            />
          </div>
        </div>

        <div>
          <span>HIGH</span>
          <div className="distribution-bar">
            <div
              style={{
                width: `${percentage(
                  highRisk,
                  scores.length
                )}%`
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function RiskMetric({
  label,
  value,
  type = ""
}) {
  return (
    <div className={`risk-metric ${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function percentage(value, total) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}