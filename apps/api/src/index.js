import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const categories = [
  { id: "c1", name: "Earrings", slug: "earrings" },
  { id: "c2", name: "Necklaces", slug: "necklaces" },
  { id: "c3", name: "Rings", slug: "rings" },
  { id: "c4", name: "Bridal Sets", slug: "bridal-sets" },
  { id: "c5", name: "Daily Wear", slug: "daily-wear" }
];

const products = [
  {
    id: "p1",
    title: "Emerald Glow Earrings",
    slug: "emerald-glow-earrings",
    price: 399,
    mrp: 599,
    categorySlug: "earrings",
    isFeatured: true,
    type: "STOCK",
    stockQty: 24,
    images: [
      "https://picsum.photos/seed/raman1/900/900",
      "https://picsum.photos/seed/raman2/900/900"
    ]
  },
  {
    id: "p2",
    title: "Champagne Pearl Necklace",
    slug: "champagne-pearl-necklace",
    price: 799,
    mrp: 1099,
    categorySlug: "necklaces",
    isFeatured: true,
    type: "BOTH",
    stockQty: 8,
    leadTimeDays: 5,
    images: [
      "https://picsum.photos/seed/raman3/900/900",
      "https://picsum.photos/seed/raman4/900/900"
    ]
  }
];

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/categories", (_, res) => res.json(categories));

app.get("/products", (req, res) => {
  const { category, q } = req.query;
  let out = [...products];
  if (category) out = out.filter(p => p.categorySlug === category);
  if (q) out = out.filter(p => p.title.toLowerCase().includes(String(q).toLowerCase()));
  res.json(out);
});

app.get("/products/:slug", (req, res) => {
  const p = products.find(x => x.slug === req.params.slug);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
// --- Admin create product (temporary in-memory) ---
app.post("/admin/products", (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.slug || !body.price) {
    return res.status(400).json({ message: "title, slug, price required" });
  }

  const exists = products.find(p => p.slug === body.slug);
  if (exists) return res.status(409).json({ message: "Slug already exists" });

  const newP = {
    id: `p${products.length + 1}`,
    title: body.title,
    slug: body.slug,
    price: Number(body.price),
    mrp: body.mrp ? Number(body.mrp) : undefined,
    categorySlug: body.categorySlug || "earrings",
    isFeatured: !!body.isFeatured,
    type: body.type || "STOCK",            // STOCK / MADE_TO_ORDER / BOTH
    stockQty: body.stockQty ?? 0,
    leadTimeDays: body.leadTimeDays ?? null,
    images: body.images?.length ? body.images : ["https://picsum.photos/seed/new1/900/900"]
  };

  products.unshift(newP);
  res.json(newP);
});

// --- Admin list products ---
app.get("/admin/products", (_, res) => res.json(products));

// --- Simple uniqueness check for slug (optional) ---
app.get("/admin/check-slug/:slug", (req, res) => {
  const exists = products.some(p => p.slug === req.params.slug);
  res.json({ exists });
});
