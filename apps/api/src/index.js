import express from "express";
import cors from "cors";

const app = express();

// --- middlewares ---
app.use(cors());
app.use(express.json());

// --- in-memory DB (abhi demo) ---
let PRODUCTS = [
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

// --- health ---
app.get("/health", (req, res) => res.json({ ok: true }));

// --- storefront endpoint ---
app.get("/shop", (req, res) => {
  const { category } = req.query;
  const items = category
    ? PRODUCTS.filter((p) => p.category === String(category))
    : PRODUCTS;

  res.json({ items, total: items.length });
});

// --- admin endpoints ---
app.get("/admin/products", (req, res) => {
  res.json({ items: PRODUCTS, total: PRODUCTS.length });
});

app.post("/admin/products", (req, res) => {
  const { title, slug, price, category, image } = req.body || {};

  if (!title || !slug || !category) {
    return res.status(400).json({ error: "title, slug, category are required" });
  }

  const exists = PRODUCTS.some((p) => p.slug === slug);
  if (exists) {
    return res.status(409).json({ error: "slug already exists" });
  }

  const id = PRODUCTS.length ? Number(PRODUCTS[PRODUCTS.length - 1].id) + 1 : 1;

  const product = {
    id,
    title: String(title),
    slug: String(slug),
    category: String(category),
    price: Number(price ?? 0),
    image: image ? String(image) : "",
  };

  PRODUCTS.push(product);
  res.status(201).json(product);
});

app.delete("/admin/products/:id", (req, res) => {
  const id = req.params.id;
  const before = PRODUCTS.length;
  PRODUCTS = PRODUCTS.filter((p) => String(p.id) !== String(id));
  const after = PRODUCTS.length;

  if (before === after) {
    return res.status(404).json({ error: "not found" });
  }

  res.json({ ok: true });
});

// --- root ---
app.get("/", (req, res) => res.send("RamanStore API running"));

// --- start ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("API running on port", PORT));
