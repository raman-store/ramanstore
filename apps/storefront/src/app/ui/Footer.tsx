import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: 34 }}>
      <div className="container" style={{ padding: "26px 16px", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900 }}>RamanStore</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>Elegant artificial jewellery for every occasion.</div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/policies">Policies</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>© {new Date().getFullYear()} RamanStore.com</div>
      </div>
    </footer>
  );
}
