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

function getApiBase() {
  // Vite (most common for React admin)
  const viteBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;

  // fallback: if you ever use same env name as Next
  const nextBase = (import.meta as any)?.env?.NEXT_PUBLIC_API_BASE as string | undefined;

  return (
    viteBase ||
    nextBase ||
    "http://localhost:4000" // local fallback
  ).replace(/\/$/, "");
}

export default function Products() {
  const API_BASE = useMemo(() => getApiBase(), []);

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();

      // Accept either {items: []} or direct []
      const list: Product[] = Array.isArray(data) ? data : (data?.items ?? []);
      setItems(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Optional delete (works only if backend supports it)
  async function remove(id: Product["id"]) {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed ${res.status}: ${text || res.statusText}`);
      }

      // refresh list
      await load();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>API: {API_BASE}</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={btn()}>
            Refresh
          </button>

          <Link to="/products/new" style={{ ...btn(), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            + Add Product
          </Link>
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
              <li>API_BASE env set in Admin: <code>VITE_API_BASE</code></li>
              <li>CORS allow your admin origin</li>
            </ul>
          </div>
        </div>
      )}

      {!loading && !err && (
        <>
          <div style={{ marginTop: 14, marginBottom: 10, fontSize: 14 }}>
            Total: <b>{items.length}</b>
          </div>

          <div style={{ overflowX: "auto" }}>
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
                {items.map((p) => (
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
                      {/* Optional delete */}
                      <button onClick={() => remove(p.id)} style={dangerBtn()}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td style={td()} colSpan={7}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* styles */
function table(): React.CSSProperties {
  return {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
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
