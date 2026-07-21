import Link from "next/link";
import { ProductGrid } from "../ui/ProductGrid";

const filters = [["All", ""], ["Female Wear", "female-wear"], ["Kids Wear", "kids-wear"], ["Artificial Jewellery", "artificial-jewellery"]];

export default function ShopPage({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const active = searchParams.category || "";
  return <div className="container shopPage"><div className="sectionHeading"><div><div className="eyebrow">Raman Store Collection</div><h1>Shop all products</h1></div>{searchParams.q ? <div>Results for “{searchParams.q}”</div> : null}</div><div className="filterRow">{filters.map(([label, value]) => <Link key={label} className={`filterChip ${active === value ? "active" : ""}`} href={value ? `/shop?category=${value}` : "/shop"}>{label}</Link>)}</div><ProductGrid category={active} q={searchParams.q} /></div>;
}
