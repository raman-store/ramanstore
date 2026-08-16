import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminShell from "./ui/AdminShell";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/editProduct";
import Login from "./pages/Login";
import Sliders from "./pages/Sliders";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/$/, "");

export default function App() {
  const [auth, setAuth] = useState<"loading" | "yes" | "no">("loading");
  useEffect(() => { fetch(`${API_BASE}/admin/auth/session`, { credentials: "include" }).then((response) => setAuth(response.ok ? "yes" : "no")).catch(() => setAuth("no")); }, []);
  async function logout() { await fetch(`${API_BASE}/admin/auth/logout`, { method: "POST", credentials: "include" }); setAuth("no"); }
  if (auth === "loading") return <div className="authLoading">Checking secure session…</div>;
  if (auth === "no") return <Login onLogin={() => setAuth("yes")} />;
  return (
    <AdminShell onLogout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<AddProduct />} />
        <Route path="/products/:id/edit" element={<EditProduct />} />
        <Route path="/sliders" element={<Sliders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminShell>
  );
}
