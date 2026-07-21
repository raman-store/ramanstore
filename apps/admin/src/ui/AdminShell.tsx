import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();

  const nav = [
    { to: "/", label: "Dashboard" },
    { to: "/products", label: "Products" },
    { to: "/products/new", label: "Add Product" },
  ];

  return (
    <div style={wrap()}>
      <aside style={side()}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>RamanStore Admin</div>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                style={{
                  ...link(),
                  ...(active ? activeLink() : {}),
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </aside>

      <main style={main()}>
        <div style={topbar()}>
          <div style={{ fontWeight: 700 }}>Admin Panel</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{loc.pathname}</div>
        </div>

        <div style={{ padding: 16 }}>{children}</div>
      </main>
    </div>
  );
}

function wrap(): React.CSSProperties {
  return { display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" };
}
function side(): React.CSSProperties {
  return {
    padding: 16,
    background: "white",
    borderRight: "1px solid #e5e7eb",
  };
}
function main(): React.CSSProperties {
  return { background: "#f6f7fb" };
}
function topbar(): React.CSSProperties {
  return {
    height: 54,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    background: "white",
    borderBottom: "1px solid #e5e7eb",
  };
}
function link(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    background: "white",
    color: "#111827",
    fontSize: 14,
    fontWeight: 700,
  };
}
function activeLink(): React.CSSProperties {
  return {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
  };
}
