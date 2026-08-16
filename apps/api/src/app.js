import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import nodemailer from "nodemailer";
import pg from "pg";

const app = express();
const PORT = process.env.PORT || 4000;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(currentDir, "..");
const storageDir = process.env.STORAGE_DIR ? path.resolve(process.env.STORAGE_DIR) : apiDir;
const dataDir = path.join(storageDir, "data");
const dataFile = path.join(dataDir, "products.json");
const slidersFile = path.join(dataDir, "sliders.json");
const ordersFile = path.join(dataDir, "orders.json");
const uploadsDir = path.join(storageDir, "uploads");
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "info@ramanstore.com").trim().toLowerCase();
const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const otpChallenges = new Map();
const sessions = new Map();
let dbPool = null;

const seedProducts = [
  { id: "1", slug: "emerald-glow-earrings", title: "Emerald Glow Earrings", price: 299, mrp: 399, category: "artificial-jewellery", subcategory: "earrings", audience: "women", image: "https://picsum.photos/seed/earrings1/800/800", description: "Elegant emerald-finish earrings for festive and everyday styling.", stock: 20, isFeatured: true },
  { id: "2", slug: "floral-kurti-set", title: "Floral Kurti Set", price: 899, mrp: 1199, category: "female-wear", subcategory: "kurti-sets", audience: "women", image: "https://picsum.photos/seed/kurti1/800/800", description: "Comfortable printed kurti set with a flattering everyday fit.", stock: 12, isFeatured: true },
  { id: "3", slug: "kids-party-dress", title: "Kids Party Dress", price: 699, mrp: 899, category: "kids-wear", subcategory: "girls-dresses", audience: "kids", image: "https://picsum.photos/seed/kidsdress1/800/800", description: "Soft and festive party dress designed for all-day comfort.", stock: 8, isFeatured: true },
  { id: "4", slug: "champagne-pearl-necklace", title: "Champagne Pearl Necklace", price: 499, mrp: 649, category: "artificial-jewellery", subcategory: "necklaces", audience: "women", image: "https://picsum.photos/seed/necklace1/800/800", description: "Classic pearl necklace with a premium champagne finish.", stock: 15, isFeatured: false },
];

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(seedProducts, null, 2));
if (!fs.existsSync(slidersFile)) fs.writeFileSync(slidersFile, "[]");
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]");

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
  persistDocument("products", products);
}

function readSliders() {
  try { return JSON.parse(fs.readFileSync(slidersFile, "utf8")); }
  catch (error) { console.error("Could not read slider database", error); return []; }
}

function saveSliders(sliders) {
  fs.writeFileSync(slidersFile, JSON.stringify(sliders, null, 2));
  persistDocument("sliders", sliders);
}

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ordersFile, "utf8")); }
  catch (error) { console.error("Could not read orders database", error); return []; }
}

function saveOrders(orders) { fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2)); persistDocument("orders", orders); }

async function persistDocument(name, value) {
  if (!dbPool) return;
  try { await dbPool.query("INSERT INTO store_documents(name, value, updated_at) VALUES($1,$2,NOW()) ON CONFLICT(name) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()", [name, JSON.stringify(value)]); }
  catch (error) { console.error(`Could not persist ${name}`, error); }
}

async function initDatabase() {
  if (!process.env.DATABASE_URL) return;
  dbPool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false } });
  await dbPool.query("CREATE TABLE IF NOT EXISTS store_documents(name TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())");
  await dbPool.query("CREATE TABLE IF NOT EXISTS media_assets(id TEXT PRIMARY KEY, mime_type TEXT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())");
  for (const [name, file, fallback] of [["products", dataFile, seedProducts], ["sliders", slidersFile, []], ["orders", ordersFile, []]]) {
    const result = await dbPool.query("SELECT value FROM store_documents WHERE name=$1", [name]);
    if (result.rows.length) fs.writeFileSync(file, JSON.stringify(result.rows[0].value, null, 2));
    else await persistDocument(name, fallback);
  }
  console.info("Persistent PostgreSQL storage connected.");
}

async function prepareUploadedFiles(req) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    file.filename = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    if (dbPool) await dbPool.query("INSERT INTO media_assets(id,mime_type,data) VALUES($1,$2,$3)", [file.filename, file.mimetype, file.buffer]);
    else fs.writeFileSync(path.join(uploadsDir, file.filename), file.buffer);
  }
}

function validateCustomer(customer) {
  if (!customer.name || customer.name.length < 2) return "Please enter the customer’s full name.";
  if (!/^\d{10}$/.test(customer.mobile)) return "Please enter a valid 10-digit mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return "Please enter a valid email address.";
  if (!customer.address || customer.address.length < 10) return "Please enter the complete delivery address.";
  if (!/^\d{6}$/.test(customer.pincode)) return "Please enter a valid 6-digit PIN code.";
  return "";
}

function reduceProductStock(productId, quantity) {
  const products = readProducts();
  const product = products.find((item) => String(item.id) === String(productId));
  if (product) { product.stock = Math.max(0, Number(product.stock) - quantity); saveProducts(products); }
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://ramanstore.com,https://www.ramanstore.com,https://admin.ramanstore.com,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    const localPreview = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
    return !origin || allowedOrigins.includes(origin) || localPreview
      ? cb(null, true)
      : cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/uploads/:id", async (req, res) => {
  if (dbPool) { const result = await dbPool.query("SELECT mime_type,data FROM media_assets WHERE id=$1", [req.params.id]); if (result.rows.length) { res.setHeader("Content-Type", result.rows[0].mime_type); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); return res.send(result.rows[0].data); } }
  const localFile = path.join(uploadsDir, path.basename(req.params.id));
  if (fs.existsSync(localFile)) return res.sendFile(localFile);
  res.status(404).end();
});

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((part) => part.trim().split(/=(.*)/s)).filter(([key]) => key).map(([key, value]) => [key, decodeURIComponent(value || "")]));
}

function sessionCookie(token, maxAge = SESSION_TTL_MS) {
  const production = process.env.NODE_ENV === "production";
  return `raman_admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=${production ? "None" : "Lax"}; Path=/; Max-Age=${Math.floor(maxAge / 1000)}${production ? "; Secure" : ""}`;
}

function getSession(req) {
  const token = readCookies(req).raman_admin_session;
  if (!token) return null;
  const session = sessions.get(hash(token));
  if (!session || session.expiresAt <= Date.now()) {
    if (session) sessions.delete(hash(token));
    return null;
  }
  return session;
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (!session || session.email !== ADMIN_EMAIL) return res.status(401).json({ message: "Login required." });
  req.admin = session;
  next();
}

async function sendOtpEmail(otp) {
  const { SMTP_HOST, SMTP_HOST_IP, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("Email service is not configured.");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST_IP || SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    tls: { servername: SMTP_HOST },
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Raman Store Admin <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: "Raman Store Admin login OTP",
    text: `Your Raman Store Admin login OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px"><h2>Raman Store Admin</h2><p>Your login OTP is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px;background:#f3f5f2;text-align:center">${otp}</div><p>This code expires in 10 minutes. Do not share it with anyone.</p></div>`,
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
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
app.get("/health", (_req, res) => res.json({ ok: true, storage: dbPool ? "postgresql" : "filesystem" }));

app.get(["/products", "/shop"], (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
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
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const item = readProducts().find((p) => p.slug === req.params.slug);
  if (!item) return res.status(404).json({ message: "Product not found." });
  res.json({ item });
});

app.get("/sliders", (_req, res) => {
  const items = readSliders().filter((item) => item.isActive !== false);
  res.json({ items, total: items.length });
});

app.post("/orders", async (req, res) => {
  const products = readProducts();
  const product = products.find((item) => String(item.id) === String(req.body.productId));
  const quantity = Math.max(1, Math.min(10, Number(req.body.quantity) || 1));
  if (!product) return res.status(404).json({ message: "Product not found." });
  if (Number(product.stock) < quantity) return res.status(400).json({ message: "The requested quantity is not available." });
  const customer = {
    name: String(req.body.name || "").trim(), mobile: String(req.body.mobile || "").replace(/\D/g, ""),
    email: String(req.body.email || "").trim().toLowerCase(), address: String(req.body.address || "").trim(),
    pincode: String(req.body.pincode || "").replace(/\D/g, ""),
  };
  const validationError = validateCustomer(customer);
  if (validationError) return res.status(400).json({ message: validationError });
  const paymentMethod = req.body.paymentMethod === "razorpay" ? "razorpay" : "cod";
  const order = {
    id: `RS${Date.now()}`, productId: String(product.id), productTitle: product.title, quantity,
    unitPrice: Number(product.price), total: Number(product.price) * quantity, customer, paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "cash-on-delivery" : "pending", orderStatus: "placed",
    createdAt: new Date().toISOString(),
  };
  if (paymentMethod === "cod") {
    const orders = readOrders(); orders.unshift(order); saveOrders(orders); reduceProductStock(product.id, quantity);
    return res.status(201).json({ ok: true, orderId: order.id, paymentMethod });
  }
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(503).json({ message: "Online payment is temporarily unavailable. Please select Cash on Delivery." });
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` }, body: JSON.stringify({ amount: Math.round(order.total * 100), currency: "INR", receipt: order.id, notes: { product: product.title } }) });
    const razorpayOrder = await response.json();
    if (!response.ok) throw new Error(razorpayOrder.error?.description || "Razorpay order creation failed.");
    order.razorpayOrderId = razorpayOrder.id;
    const orders = readOrders(); orders.unshift(order); saveOrders(orders);
    res.status(201).json({ ok: true, orderId: order.id, paymentMethod, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: "INR", keyId });
  } catch (error) { res.status(502).json({ message: error.message || "Online payment could not be initiated." }); }
});

app.post("/orders/verify-payment", (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (!razorpay_signature || expected !== razorpay_signature) return res.status(400).json({ message: "Payment verification failed." });
  const orders = readOrders(); const order = orders.find((item) => item.id === orderId && item.razorpayOrderId === razorpay_order_id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.paymentStatus !== "paid") { order.paymentStatus = "paid"; order.razorpayPaymentId = razorpay_payment_id; order.paidAt = new Date().toISOString(); saveOrders(orders); reduceProductStock(order.productId, order.quantity); }
  res.json({ ok: true, orderId: order.id });
});

app.post("/admin/auth/request-otp", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (email !== ADMIN_EMAIL) return res.status(403).json({ message: "This email is not authorised for admin access." });
  const key = `${email}:${req.ip}`;
  const existing = otpChallenges.get(key);
  if (existing?.lastSentAt > Date.now() - OTP_RESEND_MS) {
    return res.status(429).json({ message: "Please wait 60 seconds before requesting another OTP." });
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  const salt = crypto.randomBytes(16).toString("hex");
  otpChallenges.set(key, { email, otpHash: hash(`${salt}:${otp}`), salt, expiresAt: Date.now() + OTP_TTL_MS, lastSentAt: Date.now(), attempts: 0 });
  try {
    await sendOtpEmail(otp);
    console.info("OTP email accepted by SMTP", { email });
    res.json({ ok: true, message: "OTP email sent." });
  } catch (error) {
    otpChallenges.delete(key);
    console.error("OTP email failed", error);
    res.status(503).json({ message: "OTP email could not be sent. Please try again." });
  }
});

app.post("/admin/auth/verify-otp", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const key = `${email}:${req.ip}`;
  const challenge = otpChallenges.get(key);
  if (email !== ADMIN_EMAIL || !challenge || challenge.expiresAt <= Date.now()) {
    if (challenge) otpChallenges.delete(key);
    return res.status(400).json({ message: "OTP expired or invalid. Request a new OTP." });
  }
  challenge.attempts += 1;
  if (challenge.attempts > 5) {
    otpChallenges.delete(key);
    return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
  }
  const supplied = Buffer.from(hash(`${challenge.salt}:${otp}`));
  const expected = Buffer.from(challenge.otpHash);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return res.status(400).json({ message: "Incorrect OTP." });
  }
  otpChallenges.delete(key);
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(hash(token), { email, expiresAt: Date.now() + SESSION_TTL_MS });
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.json({ ok: true, email });
});

app.get("/admin/auth/session", (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, email: session.email });
});

app.post("/admin/auth/logout", (req, res) => {
  const token = readCookies(req).raman_admin_session;
  if (token) sessions.delete(hash(token));
  res.setHeader("Set-Cookie", sessionCookie("", 0));
  res.json({ ok: true });
});

app.use("/admin/sliders", requireAdmin);

app.get("/admin/sliders", (_req, res) => {
  const items = readSliders();
  res.json({ items, total: items.length });
});

app.post("/admin/sliders", upload.single("mediaFile"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please upload an image or video." });
  await prepareUploadedFiles(req);
  const sliders = readSliders();
  const item = {
    id: String(Date.now()),
    label: String(req.body.label || "Featured collection").trim(),
    title: String(req.body.title || "").trim(),
    note: String(req.body.note || "").trim(),
    buttonText: String(req.body.buttonText || "Shop collection").trim(),
    href: String(req.body.href || "/shop").trim(),
    media: {
      type: req.file.mimetype.startsWith("video/") ? "video" : "image",
      url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    },
    isActive: String(req.body.isActive ?? "true") === "true",
    createdAt: new Date().toISOString(),
  };
  if (!item.title) return res.status(400).json({ message: "A slide title is required." });
  sliders.push(item);
  saveSliders(sliders);
  res.status(201).json({ ok: true, item });
});

app.delete("/admin/sliders/:id", (req, res) => {
  const sliders = readSliders();
  const nextSliders = sliders.filter((item) => String(item.id) !== String(req.params.id));
  if (nextSliders.length === sliders.length) return res.status(404).json({ message: "Slide not found." });
  saveSliders(nextSliders);
  res.json({ ok: true });
});

app.use("/admin/orders", requireAdmin);
app.get("/admin/orders", (_req, res) => { const items = readOrders(); res.json({ items, total: items.length }); });
app.patch("/admin/orders/:id", (req, res) => {
  const allowed = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: "Invalid order status." });
  const orders = readOrders(); const order = orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  order.orderStatus = req.body.orderStatus; order.updatedAt = new Date().toISOString(); saveOrders(orders); res.json({ ok: true, item: order });
});

app.use("/admin/products", requireAdmin);

app.get("/admin/products", (_req, res) => {
  const items = readProducts();
  res.json({ items, total: items.length });
});

app.get("/admin/products/:id", (req, res) => {
  const item = readProducts().find((p) => String(p.id) === String(req.params.id));
  if (!item) return res.status(404).json({ message: "Product not found." });
  res.json({ item });
});

app.post("/admin/products", upload.array("mediaFiles", 10), async (req, res) => {
  await prepareUploadedFiles(req);
  const products = readProducts();
  const item = productFromRequest(req, { id: String(Date.now()) });
  const validationError = validateProduct(item, products);
  if (validationError) return res.status(400).json({ message: validationError });
  products.unshift(item);
  saveProducts(products);
  res.status(201).json({ ok: true, item });
});

app.put("/admin/products/:id", upload.array("mediaFiles", 10), async (req, res) => {
  await prepareUploadedFiles(req);
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

initDatabase().then(() => app.listen(PORT, () => console.log(`RamanStore API running on http://localhost:${PORT}`))).catch((error) => { console.error("Database initialization failed", error); process.exit(1); });
