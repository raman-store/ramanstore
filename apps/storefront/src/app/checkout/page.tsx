"use client";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { API_BASE, Product } from "../lib/api";

declare global { interface Window { Razorpay: any } }
function CheckoutContent() {
  const slug = useSearchParams().get("product") || "";
  const [product, setProduct] = useState<Product | null>(null); const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod"); const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", address: "", pincode: "" });
  useEffect(() => { if (!slug) return setLoading(false); fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`).then((res) => res.ok ? res.json() : Promise.reject()).then((data) => setProduct(data.item)).catch(() => setError("This product could not be loaded.")).finally(() => setLoading(false)); }, [slug]);
  const update = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));
  async function placeOrder(event: React.FormEvent) {
    event.preventDefault(); if (!product) return; setSubmitting(true); setError("");
    try {
      const response = await fetch(`${API_BASE}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, productId: product.id, quantity, paymentMethod }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Your order could not be placed.");
      if (paymentMethod === "cod") { setSuccess(data.orderId); return; }
      if (!window.Razorpay) throw new Error("The secure payment window could not be loaded. Please try again.");
      const razorpay = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: data.currency, name: "Raman Store", description: product.title, order_id: data.razorpayOrderId, prefill: { name: form.name, email: form.email, contact: form.mobile }, theme: { color: "#173f32" }, handler: async (payment: any) => { const verify = await fetch(`${API_BASE}/orders/verify-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderId, ...payment }) }); const result = await verify.json(); if (!verify.ok) return setError(result.message || "Payment verification failed."); setSuccess(result.orderId); } });
      razorpay.on("payment.failed", (failure: any) => setError(failure.error?.description || "Payment failed. Please try again.")); razorpay.open();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Your order could not be placed."); }
    finally { setSubmitting(false); }
  }
  if (loading) return <main className="container checkoutPage"><div className="checkoutLoading">Preparing secure checkout…</div></main>;
  if (success) return <main className="container checkoutPage"><section className="orderSuccess"><span>✓</span><h1>Thank you for your order.</h1><p>Your order reference is <strong>{success}</strong>. We will contact you with delivery updates.</p><Link className="btn btnPrimary" href="/shop">Continue shopping</Link></section></main>;
  if (!product) return <main className="container checkoutPage"><div className="emptyState">{error || "Please select a product before checking out."}</div></main>;
  return <main className="container checkoutPage"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/><div className="checkoutHeading"><span className="kicker dark">Secure checkout</span><h1>Complete your order</h1><p>Enter your delivery details and select a payment method.</p></div><form className="checkoutGrid" onSubmit={placeOrder}><section className="checkoutForm"><h2>Delivery information</h2><div className="checkoutFields"><label>Full name<input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required /></label><label>Mobile number<input value={form.mobile} onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" pattern="[0-9]{10}" required /></label><label>Email address<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required /></label><label>PIN code<input value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" required /></label><label className="fullField">Complete delivery address<textarea rows={4} value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" placeholder="House or flat number, street, locality, city and state" required /></label></div><h2>Payment method</h2><div className="paymentChoices"><label className={paymentMethod === "cod" ? "selected" : ""}><input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /><span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span></label><label className={paymentMethod === "razorpay" ? "selected" : ""}><input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} /><span><strong>Pay securely online</strong><small>UPI, cards, net banking and wallets via Razorpay</small></span></label></div>{error && <div className="checkoutError">{error}</div>}</section><aside className="orderSummary"><h2>Order summary</h2><div className="summaryProduct">{product.image && <img src={product.image} alt={product.title}/>}<div><strong>{product.title}</strong><span>₹{product.price.toLocaleString("en-IN")}</span></div></div><label className="quantityField">Quantity<select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{Array.from({ length: Math.min(10, product.stock) }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label><div className="summaryTotal"><span>Total</span><strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong></div><button className="btn btnPrimary checkoutButton" disabled={submitting}>{submitting ? "Processing…" : paymentMethod === "cod" ? "Place COD order" : "Proceed to payment"}</button><small className="secureNote">Your personal and payment information is transmitted securely.</small></aside></form></main>;
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="container checkoutPage"><div className="checkoutLoading">Preparing secure checkout…</div></main>}><CheckoutContent /></Suspense>;
}
