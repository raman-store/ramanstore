import Image from "next/image";

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/products`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) return <div className="container" style={{ padding: 20 }}>Product not found</div>;

  return (
    <div className="container" style={{ padding: "20px 16px" }}>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: 16, overflow: "hidden" }}>
            <Image src={p.images?.[0]} alt={p.title} fill style={{ objectFit: "cover" }} />
          </div>
        </div>

        <div className="card" style={{ padding: 16, display: "grid", gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>{p.title}</h1>

          <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>₹{p.price}</div>
            {p.mrp ? <div style={{ textDecoration: "line-through", opacity: 0.6 }}>₹{p.mrp}</div> : null}
            <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, background: "rgba(15,81,50,.10)", border: "1px solid rgba(15,81,50,.18)" }}>
              {p.type === "STOCK" ? "In Stock" : p.type === "MADE_TO_ORDER" ? "Made to Order" : "Stock + Made to Order"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary">Add to Cart</button>
            <button className="btn btnGhost">Buy Now</button>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, opacity: 0.85, fontSize: 14 }}>
            Premium artificial jewellery with elegant finish. (Description + specs will be driven from admin.)
          </div>
        </div>
      </div>
    </div>
  );
}
