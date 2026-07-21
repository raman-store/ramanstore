import Link from "next/link";
import { fetchProducts } from "../lib/api";

export async function ProductGrid({ featuredOnly, category, q }: { featuredOnly?: boolean; category?: string; q?: string }) {
  const params = new URLSearchParams();
  if (featuredOnly) params.set("featured", "true");
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const items = await fetchProducts(params.size ? `?${params}` : "");
  if (!items.length) return <div className="card emptyState">No matching products found.</div>;
  return <div className="productGrid">{items.map((p) => <Link key={p.id} href={`/p/${p.slug}`} className="card productCard">
    <div className="productImageWrap">{p.image ? <img src={p.image} alt={p.title} className="productImage" /> : <div className="imagePlaceholder">Raman Store</div>}{p.mrp && p.mrp > p.price ? <span className="discountBadge">{Math.round((1 - p.price / p.mrp) * 100)}% OFF</span> : null}</div>
    <div className="productInfo"><div className="eyebrow">{p.subcategory || p.category}</div><div className="productTitle">{p.title}</div><div className="priceRow"><strong>₹{p.price}</strong>{p.mrp ? <span className="mrp">₹{p.mrp}</span> : null}</div><div className={p.stock > 0 ? "stock inStock" : "stock outStock"}>{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div></div>
  </Link>)}</div>;
}
