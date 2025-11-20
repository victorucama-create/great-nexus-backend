// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./layout/MainLayout";

// ============================
// AUTH PAGES
// ============================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ============================
// MODULE PAGES (protected)
// ============================
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

// ============================
// APP ROUTER
// ============================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* -------------------------------
              ROTAS PÚBLICAS (sem login)
           ------------------------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* -------------------------------
               ROTAS PROTEGIDAS
           ------------------------------- */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
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

        {/* -------------------------------
                FALLBACK DEFAULT
           ------------------------------- */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
