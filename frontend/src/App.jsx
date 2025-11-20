import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Páginas base
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Suppliers from "./pages/suppliers/Suppliers";
import Purchases from "./pages/purchases/Purchases";
import Sales from "./pages/sales/Sales";
import MRP from "./pages/mrp/MRP";
import CRM from "./pages/crm/CRM";
import HR from "./pages/hr/HR";
import Investments from "./pages/investments/Investments";
import B2B from "./pages/b2b/B2B";
import Logistics from "./pages/logistics/Logistics";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/profile/Profile";

// Autenticação
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ROTAS PROTEGIDAS COM LAYOUT (Sidebar + Topbar) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/mrp" element={<MRP />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/b2b" element={<B2B />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
