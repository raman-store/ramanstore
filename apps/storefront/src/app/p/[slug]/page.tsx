import { notFound } from "next/navigation";
import { fetchProduct } from "../../lib/api";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug);
  if (!product) notFound();
  return <div className="container productPage"><div className="productDetailGrid">
    <div className="card detailImageWrap">{product.image ? <img src={product.image} alt={product.title} className="detailImage" /> : <div className="imagePlaceholder">Raman Store</div>}</div>
    <div className="card productSummary"><div className="eyebrow">{product.category} · {product.subcategory}</div><h1>{product.title}</h1><div className="priceRow detailPrice"><strong>₹{product.price}</strong>{product.mrp ? <span className="mrp">₹{product.mrp}</span> : null}</div><p>{product.description || "Quality product from Raman Store."}</p><div className={product.stock > 0 ? "stock inStock" : "stock outStock"}>{product.stock > 0 ? `${product.stock} pieces available` : "Currently out of stock"}</div><div className="actionRow"><button className="btn btnPrimary" disabled={product.stock < 1}>Add to Cart</button><button className="btn btnGhost" disabled={product.stock < 1}>Buy Now</button></div><div className="deliveryNote">Secure checkout · Pan-India delivery · Easy assistance</div></div>
  </div></div>;
}
