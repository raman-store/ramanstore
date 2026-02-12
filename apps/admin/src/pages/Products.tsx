import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

type Product = {
  id: number;
  slug: string;
  title: string;
  price: number;
  category: string;
  image?: string;
};

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState("earrings");
  const [image, setImage] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await apiGet("/products");
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function addProduct() {
    setErr("");
    try {
      const created = await apiPost("/products", {
        title,
        price,
        category,
        image,
      });

      // instantly show on top
      setItems((prev) => [created, ...prev]);

      // reset
      setTitle("");
      setPrice(0);
      setCategory("earrings");
      setImage("");
    } catch (e: any) {
      setErr(e.message || "Failed to add");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Products (Admin)</h2>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          maxWidth: 520,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add Product</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Title (e.g. Ruby Ring)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Price (e.g. 499)"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="earrings">earrings</option>
            <option value="necklaces">necklaces</option>
            <option value="rings">rings</option>
            <option value="bridal-sets">bridal-sets</option>
            <option value="daily-wear">daily-wear</option>
          </select>

          <input
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <button onClick={addProduct} disabled={!title || !price || !category}>
            Add
          </button>

          {err ? (
            <div style={{ color: "crimson", fontSize: 13 }}>{err}</div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={load}>Reload</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ marginTop: 14 }}>
          <p>Total: {items.length}</p>

          <div style={{ display: "grid", gap: 10 }}>
            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #eee",
                  padding: 12,
                  borderRadius: 10,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div style={{ width: 60, height: 60, background: "#f5f5f5" }}>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  ) : null}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>
                    {p.category} • ₹{p.price} • {p.slug}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
