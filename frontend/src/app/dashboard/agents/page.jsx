"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import AgentCard from "../../../components/AgentCard";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const data = await api.getAgents();
      console.log("AGENTS FROM API:", data);

      setAgents(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load agents."
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

        <span>AgentTrust / Agents</span>
      </nav>

      <div className="page-title">
        <span className="eyebrow">
          AGENT REGISTRY
        </span>

        <h1>AI Agents</h1>

        <p>
          Identity, limits and trust information
          for registered agents.
        </p>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="empty-state">
          No agents registered.
        </div>
      ) : (
        <div className="agent-grid">
          {agents.map((agent) => (
            <AgentCard
              key={
                agent.id ||
                agent.external_agent_id
              }
              agent={agent}
            />
          ))}
        </div>
      )}
    </main>
  );
}