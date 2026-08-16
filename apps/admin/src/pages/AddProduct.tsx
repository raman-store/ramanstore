import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/apiBase";

const categories = [
  { value: "female-wear", label: "Women’s wear" },
  { value: "kids-wear", label: "Kids’ wear" },
  { value: "artificial-jewellery", label: "Artificial jewellery" },
];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
const empty = { title: "", slug: "", category: "female-wear", subcategory: "", audience: "women", price: "", mrp: "", stock: "0", description: "", isFeatured: false, isNewArrival: true };

export default function AddProduct() {
  const navigate = useNavigate();
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));
  const previews = useMemo(() => files.map((file) => ({ name: file.name, type: file.type, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    setFiles((current) => [...current, ...Array.from(selected)].slice(0, 10));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
      body.append("mediaUrls", "[]");
      files.forEach((file) => body.append("mediaFiles", file));
      const response = await fetch(`${API_BASE}/admin/products`, { method: "POST", credentials: "include", body });
      if (!response.ok) throw new Error((await response.json()).message || "The product could not be saved.");
      navigate("/products");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="adminPage mobileAddPage">
    <div className="pageTitle"><div><h2>Add a new product</h2><p>Upload product imagery, enter the pricing details and publish the listing.</p></div></div>
    <form className="adminForm easyProductForm" onSubmit={submit}>
      <section className="formSection mobileMediaFirst">
        <div className="formSectionTitle"><span>1</span><div><strong>Product images</strong><small>The first image will be used as the product cover</small></div></div>
        <div className="mobilePhotoActions">
          <button type="button" onClick={() => cameraInput.current?.click()}><span>📷</span><strong>Take a photo</strong><small>Open the camera</small></button>
          <button type="button" onClick={() => galleryInput.current?.click()}><span>▧</span><strong>Choose from gallery</strong><small>Select one or more files</small></button>
        </div>
        <input ref={cameraInput} className="hiddenFileInput" type="file" accept="image/*" capture="environment" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <input ref={galleryInput} className="hiddenFileInput" type="file" accept="image/*,video/*" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        {previews.length > 0 ? <>
          <div className="selectedMediaSummary"><strong>{previews.length} file selected</strong><span>Maximum 10</span></div>
          <div className="mediaPreviewGrid mobilePreviewGrid">{previews.map((item, index) => <div key={item.url} className="mediaPreviewItem">
            {item.type.startsWith("video") ? <video src={item.url} /> : <img src={item.url} alt={item.name} />}
            {index === 0 && <b>Cover</b>}
            <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>×</button>
          </div>)}</div>
        </> : <div className="photoTip">Use good lighting and capture a clear front view of the product. You may add up to 10 files.</div>}
      </section>

      <section className="formSection"><div className="formSectionTitle"><span>2</span><div><strong>Product details</strong><small>Information displayed to customers</small></div></div>
        <label>Product name<input value={form.title} placeholder="For example: Floral cotton kurti" onChange={(e) => { update("title", e.target.value); update("slug", slugify(e.target.value)); }} required /></label>
        <div className="formGrid"><label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label><label>Subcategory <small>(optional)</small><input value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} placeholder="For example: Kurtis" /></label></div>
        <label>Description <small>(optional)</small><textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Include fabric, colour, size and other relevant details…" /></label>
      </section>

      <section className="formSection"><div className="formSectionTitle"><span>3</span><div><strong>Price and inventory</strong><small>Pricing and availability details</small></div></div>
        <div className="formGrid three"><label>Selling price (₹)<input inputMode="decimal" type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} required /></label><label>MRP (₹) <small>(optional)</small><input inputMode="decimal" type="number" min="0" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} /></label><label>Available stock<input inputMode="numeric" type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} required /></label></div>
      </section>

      <section className="publishOptions"><label className="checkLabel"><input type="checkbox" checked={form.isNewArrival} onChange={(e) => update("isNewArrival", e.target.checked)} /><span><strong>New arrival</strong><small>Display the “New” badge</small></span></label><label className="checkLabel"><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} /><span><strong>Feature on homepage</strong><small>Include in the featured collection</small></span></label></section>
      {message && <div className="errorMessage">{message}</div>}
      <div className="formActions mobilePublishBar"><button className="primaryButton" disabled={saving}>{saving ? "Saving product…" : "Publish product"}</button><button type="button" onClick={() => navigate("/products")}>Cancel</button></div>
    </form>
  </div>;
}
