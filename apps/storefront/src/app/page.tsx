import Link from "next/link";
import { CategoryGrid } from "./ui/CategoryGrid";
import { FeaturedProducts } from "./ui/FeaturedProducts";

export default function HomePage() {
  return (
    <div className="container" style={{ padding: "20px 16px" }}>
      {/* Hero */}
      <section className="card" style={{ padding: 18, display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, letterSpacing: -0.6 }}>
            Elegant Artificial Jewellery <span style={{ color: "var(--emerald)" }}>for Every Occasion</span>
          </h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Premium finish • Trendy designs • Pan-India delivery • Secure payments
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btnPrimary" href="/shop">Shop Collection</Link>
          <Link className="btn btnGhost" href="/shop?category=bridal-sets">Bridal Sets</Link>
        </div>
      </section>

      <div style={{ height: 18 }} />

      <CategoryGrid />

      <div style={{ height: 18 }} />

      <FeaturedProducts />

      <div style={{ height: 18 }} />

      {/* Trust Strip */}
      <section className="card" style={{ padding: 16 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {[
            ["Premium Finish", "Luxury look at affordable prices."],
            ["Fast Dispatch", "Stock + Made-to-order supported."],
            ["Pan India Delivery", "City/state wise shipping supported."],
            ["Secure Payments", "Razorpay integration planned."]
          ].map(([t, d]) => (
            <div key={t} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 16, background: "white" }}>
              <div style={{ fontWeight: 900 }}>{t}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
