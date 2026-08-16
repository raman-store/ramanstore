import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PwaInstallButton } from "./PwaInstallButton";

export default function AdminShell({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const location = useLocation();
  const nav = [{ to: "/", label: "Overview", icon: "◫" }, { to: "/products", label: "Products", icon: "◇" }, { to: "/products/new", label: "Add product", icon: "＋" }, { to: "/sliders", label: "Homepage slider", icon: "▣" }];
  const page = location.pathname === "/" ? "Store overview" : location.pathname === "/sliders" ? "Homepage slider" : location.pathname.includes("new") ? "Add new product" : location.pathname.includes("edit") ? "Edit product" : "Product catalogue";
  return <div className="adminShell">
    <aside className="adminSidebar"><div className="adminBrand"><span className="adminBrandLogo"><img src="/ramanstore-final-logo-v5.png" alt="RamanStore Women and Kids Fashion logo" /></span><span><strong>RAMAN</strong><small>STORE ADMIN</small></span></div><div className="navLabel">Workspace</div><nav className="adminNav">{nav.map((item) => <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}><span className="navIcon">{item.icon}</span><span>{item.label}</span></Link>)}</nav><div className="sidebarFooter">Raman Store management<br />Inventory workspace</div></aside>
    <main className="adminMain"><header className="adminTopbar"><div className="topbarTitle"><strong>{page}</strong><span>Manage your online store</span></div><div className="adminProfile"><PwaInstallButton /><span>Store administrator</span><button className="logoutButton" onClick={onLogout}>Logout</button><div className="adminAvatar"><img src="/ramanstore-final-icon-192-v5.png" alt="RamanStore" /></div></div></header><div className="adminContent">{children}</div></main>
    <nav className="adminMobileNav" aria-label="Admin navigation">{nav.map((item) => <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}><span>{item.icon}</span>{item.label}</Link>)}</nav>
  </div>;
}
