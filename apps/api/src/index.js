import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// ✅ CORS (Vercel + Admin local)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://ramanstore-frontend.vercel.app",
      // agar aapka vercel url kuch aur hai to add kar dena
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Health
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ---------------------------
// In-memory DB (abhi demo)
// ---------------------------
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

// ✅ SHOP (Frontend)
app.get("/shop", (req, res) => {
  const { category } = req.query;

  const filtered =
    category && category !== "all"
      ? products.filter((p) => p.category === category)
      : products;

  res.json({ items: filtered, total: filtered.length });
});

// ✅ ADMIN - list all products
app.get("/admin/products", (req, res) => {
  res.json({ items: products, total: products.length });
});

// ✅ ADMIN - add product
app.post("/admin/products", (req, res) => {
  const { title, price, category, image, slug } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ error: "title, price, category required" });
  }

  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  const newItem = {
    id,
    title,
    price: Number(price),
    category,
    image: image || "https://picsum.photos/seed/new/600/600",
    slug: slug || `${title}`.toLowerCase().replace(/\s+/g, "-"),
  };

  products.push(newItem);
  res.status(201).json(newItem);
});

// ✅ ADMIN - update product
app.put("/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) return res.status(404).json({ error: "Not found" });

  products[idx] = { ...products[idx], ...req.body, id };
  res.json(products[idx]);
});

// ✅ ADMIN - delete product
app.delete("/admin/products/:id", (req, res) => {
  const id = Number(req.params.id);
  products = products.filter((p) => p.id !== id);
  res.json({ ok: true });
});

// ✅ Root optional (to avoid Cannot GET /)
app.get("/", (req, res) => {
  res.send("RamanStore API is running. Try /health or /shop");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("API running on", PORT));
