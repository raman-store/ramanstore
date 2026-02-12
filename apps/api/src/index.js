// apps/api/src/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// ✅ CORS (abhi easy mode: allow all)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ In-memory products (abhi DB nahi hai, isliye memory)
// (later Mongo/Postgres me shift kar denge)
let products = [
  {
    id: 1,
    slug: "emerald-glow-earrings",
    title: "Emerald Glow Earrings",
    price: 299,
    category: "earrings",
    image: "https://picsum.photos/seed/earrings1/600/600",
  },
  {
    id: 2,
    slug: "champagne-pearl-necklace",
    title: "Champagne Pearl Necklace",
    price: 499,
    category: "necklaces",
    image: "https://picsum.photos/seed/necklace1/600/600",
  },
  {
    id: 3,
    slug: "classic-ring",
    title: "Classic Ring",
    price: 199,
    category: "rings",
    image: "https://picsum.photos/seed/ring1/600/600",
  },
  {
    id: 4,
    slug: "bridal-sets-royal",
    title: "Royal Bridal Set",
    price: 999,
    category: "bridal-sets",
    image: "https://picsum.photos/seed/bridal1/600/600",
  },
  {
    id: 5,
    slug: "daily-wear-studs",
    title: "Daily Wear Studs",
    price: 149,
    category: "daily-wear",
    image: "https://picsum.photos/seed/daily1/600/600",
  },
];

// ✅ helpers
const toSlug = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ✅ health
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ storefront endpoint (already your frontend calls this)
app.get("/shop", (req, res) => {
  const { category } = req.query;
  const items = category
    ? products.filter((p) => p.category === category)
    : products;

  res.json({ items, total: items.length });
});

// ✅ ADMIN APIs
app.get("/admin/products", (req, res) => {
  res.json({ items: products, total: products.length });
});

app.post("/admin/products", (req, res) => {
  const { title, price, category, image, slug } = req.body || {};

  if (!title || !price || !category) {
    return res
      .status(400)
      .json({ ok: false, message: "title, price, category required" });
  }

  const newItem = {
    id: Date.now(),
    title: String(title),
    price: Number(price),
    category: String(category),
    image: image ? String(image) : "https://picsum.photos/seed/new/600/600",
    slug: slug ? String(slug) : toSlug(title),
  };

  products = [newItem, ...products];
  res.status(201).json({ ok: true, item: newItem });
});

app.put("/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, message: "Not found" });

  products[idx] = { ...products[idx], ...req.body };
  res.json({ ok: true, item: products[idx] });
});

app.delete("/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  res.json({ ok: true, deleted: before - products.length });
});

// ✅ root (optional) - to avoid "Cannot GET /"
app.get("/", (req, res) => res.send("RamanStore API is running"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("API running on", PORT));
