import Link from "next/link";

const categories = [
  { title: "Female Wear", slug: "female-wear", note: "Kurtis, suits, sarees and more" },
  { title: "Kids Wear", slug: "kids-wear", note: "Comfortable styles for kids" },
  { title: "Artificial Jewellery", slug: "artificial-jewellery", note: "Everyday and occasion jewellery" },
];

export function CategoryGrid() {
  return <section><div className="sectionHeading"><h2>Shop by category</h2><Link href="/shop">View all</Link></div><div className="categoryGrid">{categories.map((category) => <Link key={category.slug} href={`/shop?category=${category.slug}`} className="card categoryCard"><div className="categoryIcon">{category.title.charAt(0)}</div><div><strong>{category.title}</strong><p>{category.note}</p></div></Link>)}</div></section>;
}
