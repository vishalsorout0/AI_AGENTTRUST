"use client";

import Link from "next/link";
import BuyerAgent from "../../components/BuyerAgent";

export default function BuyerPage() {
  return (
    <main>
      <nav className="top-nav">
        <Link href="/dashboard">
          ← Merchant Console
        </Link>

        <span>AgentTrust / AI Buyer</span>
      </nav>

      <BuyerAgent />
    </main>
  );
}