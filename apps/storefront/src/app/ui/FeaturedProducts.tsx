import Link from "next/link";import{ProductGrid}from"./ProductGrid";
export function FeaturedProducts(){return <section className="featuredSection"><div className="sectionHeading"><div><span className="kicker dark">The Raman edit</span><h2>Trending now</h2></div><Link href="/shop">Shop all →</Link></div><ProductGrid featuredOnly/></section>}
