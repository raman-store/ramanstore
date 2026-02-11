import Link from "next/link";

const cats = [
  { title: "Earrings", slug: "earrings" },
  { title: "Necklaces", slug: "necklaces" },
  { title: "Rings", slug: "rings" },
  { title: "Bridal Sets", slug: "bridal-sets" },
  { title: "Daily Wear", slug: "daily-wear" }
];

export function CategoryGrid() {
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>Categories</h3>
        <Link href="/shop" style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 700 }}>View all</Link>
      </div>
      <div style={{ height: 12 }} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {cats.map(c => (
          <Link key={c.slug} href={`/shop?category=${c.slug}`} className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900 }}>{c.title}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Shop now →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
