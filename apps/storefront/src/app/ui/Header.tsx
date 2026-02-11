"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [q, setQ] = useState("");

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,244,236,.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="card" style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 14 }}>
            <span style={{ fontWeight: 900 }}>RS</span>
          </div>
          <div>
            <div style={{ fontWeight: 900, letterSpacing: -0.3 }}>RamanStore</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Artificial Jewellery • Premium Finish</div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        <input
          className="input"
          style={{ maxWidth: 360 }}
          placeholder="Search jewellery…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <Link className="btn btnGhost" href="/shop">Shop</Link>
        <Link className="btn btnPrimary" href="/shop">Buy Now</Link>
      </div>
    </header>
  );
}
