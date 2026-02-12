import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function getApiBase() {
  const viteBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  const nextBase = (import.meta as any)?.env?.NEXT_PUBLIC_API_BASE as string | undefined;

  return (viteBase || nextBase || "http://localhost:4000").replace(/\/$/, "");
}

export default function AddProduct() {
  const API_BASE = useMemo(() => getApiBase(), []);
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("earrings");
  const [price, setPrice] = useState<number>(299);
  const [image, setImage] = useState("https://picsum.photos/seed/earrings1/600/600");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  function autoSlug(v: string) {
    return v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        title: title.trim(),
        slug: (slug.trim() || autoSlug(title)).trim(),
        category: category.trim(),
        price: Number(price),
        image: image.trim(),
      };

      if (!payload.title) throw new Error("Title required");
      if (!payload.slug) throw new Error("Slug required");
      if (!payload.category) throw new Error("Category required");
      if (!Number.isFinite(payload.price)) throw new Error("Price invalid");

      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed ${res.status}: ${text || res.statusText}`);
      }

      setMsg("✅ Product added successfully!");
      // go back to list after short moment
      setTimeout(() => nav("/products"), 600);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Failed"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Add Product</h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>API: {API_BASE}</div>
        </div>

        <button onClick={() => nav("/products")} style={btn()}>
          ← Back
        </button>
      </div>

      <form onSubmit={submit} style={card()}>
        <label style={label()}>
          Title
          <input
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              // auto-fill slug only if user hasn't typed slug yet
              if (!slug) setSlug(autoSlug(v));
            }}
            placeholder="Emerald Glow Earrings"
            style={input()}
          />
        </label>

        <label style={label()}>
          Slug
          <input
            value={slug}
            onChange={(e) => setSlug(autoSlug(e.target.value))}
            placeholder="emerald-glow-earrings"
            style={input()}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={label()}>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={input()}>
              <option value="earrings">earrings</option>
              <option value="necklaces">necklaces</option>
              <option value="rings">rings</option>
              <option value="bridal-sets">bridal-sets</option>
              <option value="daily-wear">daily-wear</option>
            </select>
          </label>

          <label style={label()}>
            Price
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={input()}
            />
          </label>
        </div>

        <label style={label()}>
          Image URL
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            style={input()}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
          <button disabled={saving} type="submit" style={primaryBtn()}>
            {saving ? "Saving..." : "Save Product"}
          </button>

          {msg && (
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {msg}
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
          This will call: <code>POST {API_BASE}/admin/products</code>
        </div>
      </form>
    </div>
  );
}

/* styles */
function card(): React.CSSProperties {
  return {
    marginTop: 14,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    display: "grid",
    gap: 12,
  };
}
function label(): React.CSSProperties {
  return {
    display: "grid",
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
  };
}
function input(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
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
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  };
}
