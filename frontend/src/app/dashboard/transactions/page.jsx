"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import TransactionTable from "../../../components/TransactionTable";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const data = await api.getAuditLogs();

      setTransactions(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);
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

        <span>
          AgentTrust / Transactions
        </span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          TRANSACTION MONITOR
        </span>

        <h1>Transactions</h1>

        <p>
          Review every transaction decision made
          by the trust layer.
        </p>
      </div>

      <div className="dashboard-panel">
        {loading ? (
          <div className="loading-state">
            Loading transactions...
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
          />
        )}
      </div>
    </main>
  );
}