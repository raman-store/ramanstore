import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProduct } from "../../lib/api";
import { ProductGallery } from "../../ui/ProductGallery";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug); if (!product) notFound();
  const media = product.media?.length ? product.media : product.image ? [{ type: "image" as const, url: product.image }] : [];
  const checkoutUrl = `/checkout?product=${encodeURIComponent(product.slug)}`;
  return <main className="container productPage"><div className="productDetailGrid"><ProductGallery media={media} title={product.title}/><div className="productSummary">{product.isNewArrival && <span className="productNewLabel">New arrival</span>}<div className="eyebrow">{product.category.replaceAll("-", " ")} · {product.subcategory?.replaceAll("-", " ")}</div><h1>{product.title}</h1><div className="priceRow detailPrice"><strong>₹{product.price.toLocaleString("en-IN")}</strong>{product.mrp ? <span className="mrp">₹{product.mrp.toLocaleString("en-IN")}</span> : null}</div><p>{product.description || "A quality piece, thoughtfully selected by Raman Store."}</p><div className={product.stock > 0 ? "stock inStock" : "stock outStock"}>{product.stock > 0 ? `✓ In stock · ${product.stock} available` : "Currently out of stock"}</div><div className="actionRow">{product.stock > 0 ? <><Link className="btn btnPrimary" href={checkoutUrl}>Order now</Link><Link className="btn btnGhost" href={checkoutUrl}>Buy now</Link></> : <><button className="btn btnPrimary" disabled>Order now</button><button className="btn btnGhost" disabled>Buy now</button></>}</div><div className="deliveryNote">Secure checkout · Delivery across India · Friendly customer assistance</div></div></div></main>;
}
