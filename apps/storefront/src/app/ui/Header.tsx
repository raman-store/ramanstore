"use client";

import Link from "next/link";

export function Header() {
  return <header className="siteHeader"><div className="container headerInner"><Link href="/" className="brand"><span className="brandMark">RS</span><span><strong>Raman Store</strong><small>Fashion for every celebration</small></span></Link><form action="/shop" className="searchForm"><input className="input" name="q" placeholder="Search products…" /></form><nav className="mainNav"><Link href="/shop?category=female-wear">Women</Link><Link href="/shop?category=kids-wear">Kids</Link><Link href="/shop?category=artificial-jewellery">Jewellery</Link><Link className="btn btnPrimary" href="/shop">Shop</Link></nav></div></header>;
}
