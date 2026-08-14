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

const CATEGORIES = ["female-wear", "kids-wear", "artificial-jewellery"] as const;

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
    <div className="adminPage productsPage">
      <div className="catalogueHeader">
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>Manage pricing, inventory and product visibility</div>
        </div>

        <div className="catalogueActions">
          <button onClick={load} className="secondaryButton">
            Refresh
          </button>

          <Link
            to="/products/new"
            className="cataloguePrimaryButton"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="catalogueFilters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title / slug / category..."
          className="catalogueInput"
        />

        <select value={cat} onChange={(e) => setCat(e.target.value)} className="catalogueInput catalogueSelect">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="catalogueCount">
          Showing <b>{filtered.length}</b> of <b>{items.length}</b>
        </div>
      </div>

      {loading && <div className="catalogueLoading"><span />Loading products…</div>}

      {!loading && err && (
        <div style={errorBox()}>
          <b>Products could not be loaded.</b>
          <div style={{ marginTop: 6, fontSize: 13 }}>Please check your connection and try Refresh. Technical detail: {err}</div>
        </div>
      )}

      {!loading && !err && (
        <>
        <div className="catalogueTableWrap">
          <table style={table()}>
            <thead>
              <tr>
                <th style={th()}>ID</th>
                <th style={th()}>Title</th>
                <th style={th()}>Category</th>
                <th style={th()}>Price</th>
                <th style={th()}>Slug</th>
                <th style={th()}>Preview</th>
                <th style={th()}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={String(p.id)}>
                  <td style={tdMono()}>{p.id}</td>
                  <td style={td()}>{p.title}</td>
                  <td style={td()}>{p.category}</td>
                  <td style={td()}>₹{p.price.toLocaleString("en-IN")}</td>
                  <td style={tdMono()}>{p.slug}</td>
                  <td style={td()}>
                    {p.image ? (
                      <a href={p.image} target="_blank" rel="noreferrer">
                        View image
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={td()}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link
                        to={`/products/${p.id}/edit`}
                        className="secondaryButton"
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
        <div className="productCardList">
          {filtered.map((p) => (
            <article className="catalogueCard" key={String(p.id)}>
              <div className="catalogueCardTop">
                <div>
                  <span className="catalogueCardCategory">{p.category.replace(/-/g, " ")}</span>
                  <h3>{p.title}</h3>
                  <small>#{p.id} · {p.slug}</small>
                </div>
                <strong>₹{p.price.toLocaleString("en-IN")}</strong>
              </div>
              <div className="catalogueCardActions">
                {p.image && <a href={p.image} target="_blank" rel="noreferrer" className="secondaryButton">View image</a>}
                <Link to={`/products/${p.id}/edit`} className="secondaryButton">Edit product</Link>
                <button onClick={() => remove(p.id)} className="dangerButton">Delete</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="catalogueEmpty">No products found.</div>}
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
