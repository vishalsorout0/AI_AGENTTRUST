"use client";

export default function TransactionTable({
  transactions = []
}) {
  if (!transactions.length) {
    return (
      <div className="empty-state">
        No transaction decisions available.
      </div>
    );
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Amount</th>
            <th>Risk</th>
            <th>Trust</th>
            <th>Decision</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction, index) => {
            const decision =
              transaction.decision ||
              transaction.status ||
              "UNKNOWN";

            return (
              <tr
                key={
                  transaction.id ||
                  transaction.transaction_id ||
                  index
                }
              >
                <td>
                  <div className="table-agent">
                    <span className="mini-avatar">
                      {(transaction.agent_id || "A")
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span>
                      {transaction.agent_id || "Unknown"}
                    </span>
                  </div>
                </td>

                <td>
                  ₹
                  {Number(
                    transaction.amount || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td>
                  <RiskValue
                    value={transaction.risk_score}
                  />
                </td>

                <td>
                  {transaction.trust_score ?? "--"}
                </td>

                <td>
                  <DecisionBadge decision={decision} />
                </td>

                <td>
                  {formatTime(transaction.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DecisionBadge({ decision }) {
  const normalized = String(decision)
    .toUpperCase()
    .replace("-", "_");

  let className = "neutral";

  if (
    normalized === "APPROVED" ||
    normalized === "APPROVE"
  ) {
    className = "approved";
  }

  if (
    normalized === "BLOCK" ||
    normalized === "BLOCKED"
  ) {
    className = "blocked";
  }

  if (normalized === "STEP_UP") {
    className = "stepup";
  }

  return (
    <span className={`decision-badge ${className}`}>
      {String(decision).replace("_", "-")}
    </span>
  );
}

function RiskValue({ value }) {
  if (value === undefined || value === null) {
    return <span>--</span>;
  }

  const risk = Number(value);

  return (
    <span className={risk >= 70 ? "risk-high" : risk >= 40 ? "risk-medium" : "risk-low"}>
      {risk}/100
    </span>
  );
}

function formatTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}