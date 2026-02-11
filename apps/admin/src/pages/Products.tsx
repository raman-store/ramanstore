import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type P = { id: string; title: string; slug: string; price: number; categorySlug: string; type: string; stockQty?: number };

export function Products() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<P[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/admin/products`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(p => p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
  }, [q, items]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 1000, fontSize: 18 }}>Products</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>Add/Edit products (DB connect next)</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input className="input" style={{ width: 260 }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Link className="btn btnPrimary" to="/products/new">+ Add Product</Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr .6fr .6fr .6fr", gap: 0, borderBottom: "1px solid var(--border)", background: "rgba(198,167,94,.10)" }}>
          {["Title", "Category", "Type", "Price", "Stock"].map(h => (
            <div key={h} style={{ padding: 12, fontWeight: 1000 }}>{h}</div>
          ))}
        </div>

        {filtered.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr .6fr .6fr .6fr", borderBottom: "1px solid var(--border)" }}>
            <div style={{ padding: 12, fontWeight: 900 }}>{p.title}<div style={{ fontSize: 12, opacity: 0.65 }}>{p.slug}</div></div>
            <div style={{ padding: 12 }}>{p.categorySlug}</div>
            <div style={{ padding: 12 }}>{p.type}</div>
            <div style={{ padding: 12, fontWeight: 900 }}>₹{p.price}</div>
            <div style={{ padding: 12 }}>{p.stockQty ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
