import Link from "next/link";
import { ProductGrid } from "./ProductGrid";

export function FeaturedProducts() {
  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>Featured</h3>
        <Link href="/shop" style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 700 }}>Shop →</Link>
      </div>
      <div style={{ height: 12 }} />
      <ProductGrid featuredOnly />
    </section>
  );
}
