import { useMemo, useState } from "react";

export function AddProduct() {
  const API = import.meta.env.VITE_API_BASE as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [categorySlug, setCategorySlug] = useState("earrings");
  const [type, setType] = useState<"STOCK"|"MADE_TO_ORDER"|"BOTH">("STOCK");
  const [stockQty, setStockQty] = useState<number>(0);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);
  const [isFeatured, setIsFeatured] = useState(false);

  const canSave = useMemo(() => title.trim() && slug.trim() && price > 0, [title, slug, price]);

  async function onSave() {
    if (!canSave) return;

    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      price,
      mrp: mrp > 0 ? mrp : undefined,
      categorySlug,
      type,
      stockQty: type === "MADE_TO_ORDER" ? null : stockQty,
      leadTimeDays: type === "STOCK" ? null : leadTimeDays,
      isFeatured,
      images: [] // later
    };

    const r = await fetch(`${API}/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      alert(err.message || "Failed to save");
      return;
    }

    alert("Product saved ✅");
    // Optionally redirect later
    setTitle(""); setSlug(""); setPrice(0); setMrp(0);
  }

  return (
    <div className="card" style={{ padding: 16, maxWidth: 760 }}>
      <div style={{ fontWeight: 1000, fontSize: 18 }}>Add Product</div>
      <div style={{ fontSize: 13, opacity: 0.75 }}>This will save to API (temporary in-memory).</div>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Title</div>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" />
        </label>

        <label>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Slug</div>
          <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="emerald-glow-earrings" />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Price</div>
            <input className="input" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>

          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>MRP (optional)</div>
            <input className="input" type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Category</div>
            <select className="input" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
              <option value="earrings">Earrings</option>
              <option value="necklaces">Necklaces</option>
              <option value="rings">Rings</option>
              <option value="bridal-sets">Bridal Sets</option>
              <option value="daily-wear">Daily Wear</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Type</div>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="STOCK">Stock</option>
              <option value="MADE_TO_ORDER">Made to Order</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
        </div>

        {type !== "MADE_TO_ORDER" && (
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Stock Qty</div>
            <input className="input" type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} />
          </label>
        )}

        {type !== "STOCK" && (
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Lead Time (days)</div>
            <input className="input" type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(Number(e.target.value))} />
          </label>
        )}

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <div style={{ fontWeight: 900 }}>Featured product</div>
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <button className={`btn ${canSave ? "btnPrimary" : ""}`} type="button" onClick={onSave} disabled={!canSave}>
            Save Product
          </button>
          <button className="btn" type="button" onClick={() => history.back()}>Back</button>
        </div>
      </div>
    </div>
  );
}
