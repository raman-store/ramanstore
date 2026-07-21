import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
const categories = ["female-wear", "kids-wear", "artificial-jewellery"];
const emptyForm = { title: "", slug: "", category: "female-wear", subcategory: "", audience: "women", price: "", mrp: "", stock: "0", description: "", image: "", isFeatured: false };

export default function EditProduct() {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm); const [file, setFile] = useState<File | null>(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));

  useEffect(() => { fetch(`${API_BASE}/admin/products/${id}`).then(async (response) => { if (!response.ok) throw new Error("Product not found."); return response.json(); }).then(({ item }) => setForm({ ...emptyForm, ...item, price: String(item.price), mrp: String(item.mrp || ""), stock: String(item.stock || 0) })).catch((error) => setMessage(error.message)).finally(() => setLoading(false)); }, [id]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try { const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, String(value))); if (file) body.append("imageFile", file); const response = await fetch(`${API_BASE}/admin/products/${id}`, { method: "PUT", body }); if (!response.ok) throw new Error((await response.json()).message || "Could not update product."); navigate("/products"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not update product."); } finally { setSaving(false); }
  }

  if (loading) return <div className="adminPage">Loading product…</div>;
  return <div className="adminPage"><div className="pageTitle"><div><h2>Edit product</h2><p>Update product details and inventory.</p></div></div><form className="adminForm" onSubmit={submit}>
    <label>Product title<input value={form.title} onChange={(e) => update("title", e.target.value)} required /></label><label>Slug<input value={form.slug} onChange={(e) => update("slug", e.target.value)} required /></label>
    <div className="formGrid"><label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Subcategory<input value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} /></label></div>
    <div className="formGrid"><label>Selling price<input type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} required /></label><label>MRP<input type="number" min="0" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} /></label><label>Stock<input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} required /></label></div>
    <label>Description<textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} /></label><div className="formGrid"><label>Replace image<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><label>Image URL<input value={form.image} onChange={(e) => update("image", e.target.value)} /></label></div>
    <label className="checkLabel"><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} /> Show as featured product</label>{message && <div className="errorMessage">{message}</div>}<div className="formActions"><button className="primaryButton" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => navigate("/products")}>Cancel</button></div>
  </form></div>;
}
