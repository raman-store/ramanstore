import { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");
type Slide = { id: string; label: string; title: string; note: string; buttonText: string; href: string; media: { type: "image" | "video"; url: string }; isActive: boolean };
const initialForm = { label: "Featured collection", title: "", note: "", buttonText: "Shop collection", href: "/shop", isActive: true };

export default function Sliders() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const preview = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/sliders`, { credentials: "include" });
      if (!response.ok) throw new Error("Slider content could not be loaded.");
      setSlides((await response.json()).items || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Slider content could not be loaded."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return setMessage("Please select an image or video for this slide.");
    setSaving(true); setMessage("");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
      body.append("mediaFile", file);
      const response = await fetch(`${API_BASE}/admin/sliders`, { method: "POST", credentials: "include", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The slide could not be published.");
      setForm(initialForm); setFile(null); setMessage("Slide published successfully."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The slide could not be published."); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this slide permanently?")) return;
    const response = await fetch(`${API_BASE}/admin/sliders/${id}`, { method: "DELETE", credentials: "include" });
    if (response.ok) setSlides((current) => current.filter((item) => item.id !== id));
    else setMessage("The slide could not be deleted.");
  }

  return <div className="adminPage sliderAdminPage">
    <div className="pageTitle"><div><h2>Homepage slider</h2><p>Upload promotional images or videos for the homepage showcase.</p></div></div>
    <div className="sliderAdminLayout">
      <form className="adminForm easyProductForm sliderForm" onSubmit={submit}>
        <section className="formSection">
          <div className="formSectionTitle"><span>1</span><div><strong>Slide media</strong><small>Upload one landscape image or video, up to 25 MB</small></div></div>
          <label className="mediaDrop"><input type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /><strong>＋ Choose an image or video</strong><small>Recommended ratio: 4:5 · JPG, PNG, WebP or MP4</small></label>
          {preview && <div className="sliderMediaPreview">{file?.type.startsWith("video/") ? <video src={preview} controls /> : <img src={preview} alt="New slide preview" />}</div>}
        </section>
        <section className="formSection">
          <div className="formSectionTitle"><span>2</span><div><strong>Slide content</strong><small>Professional copy displayed over the uploaded media</small></div></div>
          <div className="formGrid"><label>Category label<input value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Women’s edit" /></label><label>Slide title<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Everyday elegance." required /></label></div>
          <label>Description<textarea rows={3} value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="A concise description of the collection" /></label>
          <div className="formGrid"><label>Button text<input value={form.buttonText} onChange={(e) => update("buttonText", e.target.value)} /></label><label>Destination link<input value={form.href} onChange={(e) => update("href", e.target.value)} placeholder="/shop?category=female-wear" /></label></div>
          <label className="checkLabel"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Publish this slide immediately</label>
        </section>
        {message && <div className={message.includes("successfully") ? "loginSuccess" : "errorMessage"}>{message}</div>}
        <div className="formActions"><button className="primaryButton" disabled={saving}>{saving ? "Publishing…" : "Publish slide"}</button></div>
      </form>
      <section className="sliderLibrary"><div><h3>Published slides</h3><span>{slides.length} custom {slides.length === 1 ? "slide" : "slides"}</span></div>{loading ? <div className="catalogueLoading"><span />Loading slides…</div> : slides.length === 0 ? <div className="catalogueEmpty">No custom slides yet. The storefront is using its original showcase.</div> : <div className="sliderAdminGrid">{slides.map((slide) => <article className="sliderAdminCard" key={slide.id}><div className="sliderAdminMedia">{slide.media.type === "video" ? <video src={slide.media.url} muted playsInline /> : <img src={slide.media.url} alt={slide.title} />}<span>{slide.media.type}</span></div><div><small>{slide.label}</small><h4>{slide.title}</h4><p>{slide.note}</p><button className="dangerButton" onClick={() => remove(slide.id)}>Delete slide</button></div></article>)}</div>}</section>
    </div>
  </div>;
}
