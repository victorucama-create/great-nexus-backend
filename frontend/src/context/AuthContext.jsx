import { createContext, useState, useEffect } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar token do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    const storedTenant = localStorage.getItem("tenantId");

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setTenantId(storedTenant);
    }

    setLoading(false);
  }, []);

  // LOGIN
  async function login(email, password) {
    try {
      const res = await axios.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user, tenantId } = res.data.data;

      // guardar
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tenantId", tenantId);

      setUser(user);
      setTenantId(tenantId);

      navigate("/dashboard");
    } catch (err) {
      throw err.response?.data?.message || "Erro ao fazer login.";
    }
  }

  // REGISTO
  async function register(payload) {
    try {
      const res = await axios.post("/auth/register", payload);

      const { accessToken, refreshToken, user, tenant } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tenantId", tenant._id);

      setUser(user);
      setTenantId(tenant._id);

      navigate("/dashboard");
    } catch (err) {
      throw err.response?.data?.message || "Erro ao registar.";
    }
  }

  // LOGOUT
  function logout() {
    localStorage.clear();
    setUser(null);
    setTenantId(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, tenantId, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
