import { ProductGrid } from "../ui/ProductGrid";

export default function ShopPage() {
  return (
    <div className="container" style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Shop</h2>
        <div style={{ fontSize: 13, opacity: 0.75 }}>Filters & sorting can be added next.</div>
      </div>

      <div style={{ height: 14 }} />
      <ProductGrid />
    </div>
  );
}
