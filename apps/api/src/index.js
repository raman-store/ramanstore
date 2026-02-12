import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

/* ---------------- CORS ---------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173", // admin local
      "http://localhost:3000", // frontend local
      "https://ramanstore-frontend.vercel.app" // frontend live
    ],
    credentials: true,
  })
);

/* ---------------- Health ---------------- */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ---------------- Temporary DB ---------------- */
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
];

/* ---------------- GET Products ---------------- */
app.get("/products", (req, res) => {
  res.json({
    items: PRODUCTS,
    total: PRODUCTS.length,
  });
});

/* ---------------- ADD Product ---------------- */
app.post("/products", (req, res) => {
  const { title, price, category, image } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({
      error: "title, price, category required",
    });
  }

  const id = Date.now();

  const slug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const newProduct = {
    id,
    slug,
    title,
    price: Number(price),
    category,
    image: image || "",
  };

  PRODUCTS.unshift(newProduct);

  res.status(201).json(newProduct);
});

/* ---------------- UPDATE Product ---------------- */
app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = PRODUCTS.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  PRODUCTS[index] = {
    ...PRODUCTS[index],
    ...req.body,
  };

  res.json(PRODUCTS[index]);
});

/* ---------------- DELETE Product ---------------- */
app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  PRODUCTS = PRODUCTS.filter((p) => p.id !== id);

  res.json({ ok: true });
});

/* ---------------- Server Start ---------------- */
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
