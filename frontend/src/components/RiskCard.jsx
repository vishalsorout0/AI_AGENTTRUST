"use client";

export default function RiskCard({ auditLogs = [] }) {
  const risks = auditLogs
    .map((item) => Number(item.risk_score))
    .filter((value) => !Number.isNaN(value));

  const averageRisk =
    risks.length > 0
      ? Math.round(
          risks.reduce((sum, value) => sum + value, 0) /
            risks.length
        )
      : 0;

  const highRiskCount = risks.filter(
    (risk) => risk >= 70
  ).length;

  const blockedCount = auditLogs.filter((item) => {
    const decision = String(item.decision || "").toUpperCase();

    return (
      decision === "BLOCK" ||
      decision === "BLOCKED"
    );
  }).length;

  return (
    <div className="dashboard-panel risk-card">
      <div className="panel-header">
        <div>
          <h2>Transaction Risk</h2>
          <p>Current risk intelligence from AgentTrust.</p>
        </div>

        <span className="risk-icon">R</span>
      </div>

      <div className="risk-score-main">
        <div className="big-risk-score">
          {averageRisk}
          <span>/100</span>
        </div>

        <div>
          <strong>Average Risk</strong>
          <p>
            {averageRisk < 30
              ? "Low transaction risk"
              : averageRisk < 70
              ? "Moderate transaction risk"
              : "High transaction risk"}
          </p>
        </div>
      </div>

      <div className="risk-metrics">
        <div>
          <span>High risk events</span>
          <strong>{highRiskCount}</strong>
        </div>

        <div>
          <span>Blocked</span>
          <strong>{blockedCount}</strong>
        </div>
      </div>

      <div className="risk-bar">
        <div
          className="risk-bar-fill"
          style={{
            width: `${Math.min(Math.max(averageRisk, 0), 100)}%`
          }}
        />
      </div>
    </div>
  );
}