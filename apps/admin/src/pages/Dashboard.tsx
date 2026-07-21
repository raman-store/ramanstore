import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>
      <p style={{ opacity: 0.8 }}>
        Welcome! Use links below to manage products.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link to="/products" style={btnLink()}>
          Products
        </Link>
        <Link to="/products/new" style={btnLinkPrimary()}>
          + Add Product
        </Link>
      </div>
    </div>
  );
}

function btnLink(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    textDecoration: "none",
    color: "#111827",
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
  };
}

function btnLinkPrimary(): React.CSSProperties {
  return {
    ...btnLink(),
    background: "#111827",
    color: "white",
    border: "1px solid #111827",
    fontWeight: 700,
  };
}