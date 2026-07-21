import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Product = {
  id: number | string;
  slug: string;
  title: string;
  price: number;
  category: string;
  image?: string;
};

const CATEGORIES = ["earrings", "necklaces", "rings", "bridal-sets", "daily-wear"] as const;

function getApiBase() {
  const viteBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  const nextBase = (import.meta as any)?.env?.NEXT_PUBLIC_API_BASE as string | undefined;
  return (viteBase || nextBase || "http://localhost:4000").replace(/\/$/, "");
}

export default function Products() {
  const API_BASE = useMemo(() => getApiBase(), []);

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();
      const list: Product[] = Array.isArray(data) ? data : data?.items ?? [];
      setItems(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: Product["id"]) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed ${res.status}: ${text || res.statusText}`);
      }

      await load();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((p) => {
      const okCat = cat === "all" ? true : p.category === cat;
      const okQ =
        !qq
          ? true
          : `${p.title} ${p.slug} ${p.category} ${p.id}`.toLowerCase().includes(qq);
      return okCat && okQ;
    });
  }, [items, q, cat]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>API: {API_BASE}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={load} style={btn()}>
            Refresh
          </button>

          <Link
            to="/products/new"
            style={{ ...primaryBtn(), textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title / slug / category..."
          style={input()}
        />

        <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...input(), width: 200 }}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div style={{ fontSize: 14, alignSelf: "center", opacity: 0.85 }}>
          Showing <b>{filtered.length}</b> of <b>{items.length}</b>
        </div>
      </div>

      {loading && <p style={{ marginTop: 14 }}>Loading…</p>}

      {!loading && err && (
        <div style={errorBox()}>
          <b>Failed:</b> {err}
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Check:
            <ul style={{ margin: "8px 0 0 18px" }}>
              <li>Backend route exists: <code>/admin/products</code></li>
              <li>Vercel env set: <code>VITE_API_BASE</code></li>
              <li>CORS allow your admin origin</li>
            </ul>
          </div>
        </div>
      )}

      {!loading && !err && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={table()}>
            <thead>
              <tr>
                <th style={th()}>ID</th>
                <th style={th()}>Title</th>
                <th style={th()}>Category</th>
                <th style={th()}>Price</th>
                <th style={th()}>Slug</th>
                <th style={th()}>Image</th>
                <th style={th()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={String(p.id)}>
                  <td style={tdMono()}>{p.id}</td>
                  <td style={td()}>{p.title}</td>
                  <td style={td()}>{p.category}</td>
                  <td style={td()}>{p.price}</td>
                  <td style={tdMono()}>{p.slug}</td>
                  <td style={td()}>
                    {p.image ? (
                      <a href={p.image} target="_blank" rel="noreferrer">
                        open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={td()}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link
                        to={`/products/${p.id}/edit`}
                        style={{ ...btn(), textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                      >
                        Edit
                      </Link>
                      <button onClick={() => remove(p.id)} style={dangerBtn()}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td style={td()} colSpan={7}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* styles */
function table(): React.CSSProperties {
  return {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
  };
}
function th(): React.CSSProperties {
  return {
    textAlign: "left",
    fontSize: 13,
    padding: "10px 10px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fafafa",
    whiteSpace: "nowrap",
  };
}
function td(): React.CSSProperties {
  return {
    fontSize: 14,
    padding: "10px 10px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  };
}
function tdMono(): React.CSSProperties {
  return {
    ...td(),
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
  };
}
function input(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
    minWidth: 260,
  };
}
function btn(): React.CSSProperties {
  return {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontSize: 14,
  };
}
function primaryBtn(): React.CSSProperties {
  return {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  };
}
function dangerBtn(): React.CSSProperties {
  return {
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    cursor: "pointer",
    fontSize: 13,
  };
}
function errorBox(): React.CSSProperties {
  return {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#7f1d1d",
  };
}
