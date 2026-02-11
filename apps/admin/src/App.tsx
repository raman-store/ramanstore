import { Routes, Route, Navigate } from "react-router-dom";
import { AdminShell } from "./ui/AdminShell";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { AddProduct } from "./pages/AddProduct";

export default function App() {
  return (
    <AdminShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<AddProduct />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminShell>
  );
}
