import Link from "next/link";
import Image from "next/image";

type P = {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp?: number;
  isFeatured?: boolean;
  images?: string[];
};

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/products`, { cache: "no-store" });
  return res.json();
}

export async function ProductGrid({ featuredOnly }: { featuredOnly?: boolean }) {
  const items: P[] = await getProducts();
  const list = featuredOnly ? items.filter(p => p.isFeatured) : items;

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {list.map(p => (
        <Link key={p.id} href={`/p/${p.slug}`} className="card" style={{ overflow: "hidden" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
            <Image src={p.images?.[0]} alt={p.title} fill style={{ objectFit: "cover" }} />
          </div>
          <div style={{ padding: 12, display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>{p.title}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <div style={{ fontWeight: 900 }}>₹{p.price}</div>
              {p.mrp ? <div style={{ textDecoration: "line-through", opacity: 0.6, fontSize: 13 }}>₹{p.mrp}</div> : null}
            </div>
            <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 800 }}>View details →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
