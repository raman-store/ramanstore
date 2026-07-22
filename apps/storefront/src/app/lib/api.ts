export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export type ProductMedia = { type: "image" | "video"; url: string };
export type Product = { id: string; title: string; slug: string; price: number; mrp?: number; category: string; subcategory?: string; audience?: string; image?: string; media?: ProductMedia[]; description?: string; stock: number; isFeatured?: boolean; isNewArrival?: boolean; createdAt?: string };

export async function fetchProducts(query = "") {
  const res = await fetch(`${API_BASE}/products${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Products could not be loaded.");
  const data = await res.json();
  return (data.items || []) as Product[];
}

export async function fetchProduct(slug: string) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Product could not be loaded.");
  const data = await res.json();
  return data.item as Product;
}
