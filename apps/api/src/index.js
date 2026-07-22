import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(currentDir, "..");
const dataDir = path.join(apiDir, "data");
const dataFile = path.join(dataDir, "products.json");
const uploadsDir = path.join(apiDir, "uploads");

const seedProducts = [
  { id: "1", slug: "emerald-glow-earrings", title: "Emerald Glow Earrings", price: 299, mrp: 399, category: "artificial-jewellery", subcategory: "earrings", audience: "women", image: "https://picsum.photos/seed/earrings1/800/800", description: "Elegant emerald-finish earrings for festive and everyday styling.", stock: 20, isFeatured: true },
  { id: "2", slug: "floral-kurti-set", title: "Floral Kurti Set", price: 899, mrp: 1199, category: "female-wear", subcategory: "kurti-sets", audience: "women", image: "https://picsum.photos/seed/kurti1/800/800", description: "Comfortable printed kurti set with a flattering everyday fit.", stock: 12, isFeatured: true },
  { id: "3", slug: "kids-party-dress", title: "Kids Party Dress", price: 699, mrp: 899, category: "kids-wear", subcategory: "girls-dresses", audience: "kids", image: "https://picsum.photos/seed/kidsdress1/800/800", description: "Soft and festive party dress designed for all-day comfort.", stock: 8, isFeatured: true },
  { id: "4", slug: "champagne-pearl-necklace", title: "Champagne Pearl Necklace", price: 499, mrp: 649, category: "artificial-jewellery", subcategory: "necklaces", audience: "women", image: "https://picsum.photos/seed/necklace1/800/800", description: "Classic pearl necklace with a premium champagne finish.", stock: 15, isFeatured: false },
];

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(seedProducts, null, 2));

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (error) {
    console.error("Could not read products database", error);
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(dataFile, JSON.stringify(products, null, 2));
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: (origin, cb) => !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error(`CORS blocked for origin: ${origin}`)) }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-")}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")),
});

function productFromRequest(req, existing = {}) {
  const uploadedMedia = (req.files || []).map((file) => ({
    type: file.mimetype.startsWith("video/") ? "video" : "image",
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
  }));
  let urlMedia = [];
  try { urlMedia = JSON.parse(req.body.mediaUrls || "[]"); } catch { urlMedia = []; }
  const existingMedia = Array.isArray(existing.media) ? existing.media : (existing.image ? [{ type: "image", url: existing.image }] : []);
  const media = [...existingMedia, ...urlMedia, ...uploadedMedia].filter((item, index, all) => item?.url && all.findIndex((candidate) => candidate.url === item.url) === index);
  return {
    ...existing,
    title: String(req.body.title ?? existing.title ?? "").trim(),
    slug: String(req.body.slug ?? existing.slug ?? "").trim(),
    category: String(req.body.category ?? existing.category ?? "").trim(),
    subcategory: String(req.body.subcategory ?? existing.subcategory ?? "").trim(),
    audience: String(req.body.audience ?? existing.audience ?? "women").trim(),
    price: Number(req.body.price ?? existing.price ?? 0),
    mrp: Number(req.body.mrp ?? existing.mrp ?? 0),
    stock: Number(req.body.stock ?? existing.stock ?? 0),
    description: String(req.body.description ?? existing.description ?? "").trim(),
    isFeatured: String(req.body.isFeatured ?? existing.isFeatured) === "true",
    isNewArrival: String(req.body.isNewArrival ?? existing.isNewArrival) === "true",
    media,
    image: media.find((item) => item.type === "image")?.url || String(req.body.image ?? existing.image ?? "").trim(),
    createdAt: existing.createdAt || new Date().toISOString(),
  };
}

function validateProduct(product, products, currentId) {
  if (!product.title || !product.slug || !product.category) return "Title, slug and category are required.";
  if (!Number.isFinite(product.price) || product.price < 0) return "Price must be a valid non-negative number.";
  if (!Number.isFinite(product.stock) || product.stock < 0) return "Stock must be a valid non-negative number.";
  if (products.some((item) => item.slug === product.slug && String(item.id) !== String(currentId ?? ""))) return "Slug must be unique.";
  return "";
}

app.get("/", (_req, res) => res.send("RamanStore API is running."));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get(["/products", "/shop"], (req, res) => {
  let items = readProducts();
  const { category, subcategory, audience, featured, newArrival, q } = req.query;
  if (category) items = items.filter((p) => p.category === String(category));
  if (subcategory) items = items.filter((p) => p.subcategory === String(subcategory));
  if (audience) items = items.filter((p) => p.audience === String(audience));
  if (featured === "true") items = items.filter((p) => p.isFeatured);
  if (newArrival === "true") items = items.filter((p) => p.isNewArrival);
  if (q) {
    const query = String(q).toLowerCase();
    items = items.filter((p) => `${p.title} ${p.category} ${p.subcategory}`.toLowerCase().includes(query));
  }
  res.json({ items, total: items.length });
});

app.get("/products/:slug", (req, res) => {
  const item = readProducts().find((p) => p.slug === req.params.slug);
  if (!item) return res.status(404).json({ message: "Product not found." });
  res.json({ item });
});

app.get("/admin/products", (_req, res) => {
  const items = readProducts();
  res.json({ items, total: items.length });
});

app.get("/admin/products/:id", (req, res) => {
  const item = readProducts().find((p) => String(p.id) === String(req.params.id));
  if (!item) return res.status(404).json({ message: "Product not found." });
  res.json({ item });
});

app.post("/admin/products", upload.array("mediaFiles", 10), (req, res) => {
  const products = readProducts();
  const item = productFromRequest(req, { id: String(Date.now()) });
  const validationError = validateProduct(item, products);
  if (validationError) return res.status(400).json({ message: validationError });
  products.unshift(item);
  saveProducts(products);
  res.status(201).json({ ok: true, item });
});

app.put("/admin/products/:id", upload.array("mediaFiles", 10), (req, res) => {
  const products = readProducts();
  const index = products.findIndex((p) => String(p.id) === String(req.params.id));
  if (index < 0) return res.status(404).json({ message: "Product not found." });
  const item = productFromRequest(req, products[index]);
  const validationError = validateProduct(item, products, req.params.id);
  if (validationError) return res.status(400).json({ message: validationError });
  products[index] = item;
  saveProducts(products);
  res.json({ ok: true, item });
});

app.delete("/admin/products/:id", (req, res) => {
  const products = readProducts();
  const nextProducts = products.filter((p) => String(p.id) !== String(req.params.id));
  if (products.length === nextProducts.length) return res.status(404).json({ message: "Product not found." });
  saveProducts(nextProducts);
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`RamanStore API running on http://localhost:${PORT}`));
