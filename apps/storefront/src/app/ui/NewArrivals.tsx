import Link from"next/link";import{ProductGrid}from"./ProductGrid";
export function NewArrivals(){return <section className="featuredSection"><div className="sectionHeading"><div><span className="kicker dark">Just landed</span><h2>New arrivals</h2></div><Link href="/shop?newArrival=true">See what’s new →</Link></div><ProductGrid newArrivalOnly/></section>}
