import { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api"; // usa o axios com interceptors
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // =========================================================
  // Helper — guardar sessão no localStorage
  // =========================================================
  const saveSession = ({ accessToken, refreshToken, user, tenantId }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    if (tenantId) localStorage.setItem("tenantId", tenantId);

    setUser(user);
    setTenantId(tenantId || null);
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user, tenant } = res.data.data;

      saveSession({
        accessToken,
        refreshToken,
        user,
        tenantId: tenant?._id || null,
      });

      navigate("/dashboard");
      return true;
    } catch (err) {
      throw err?.response?.data?.message || "Erro ao fazer login.";
    }
  };

  // =========================================================
  // REGISTER (Cria tenant + admin)
  // =========================================================
  const register = async (payload) => {
    try {
      const res = await api.post("/auth/register", payload);

      const { accessToken, refreshToken, user, tenant } = res.data.data;

      saveSession({
        accessToken,
        refreshToken,
        user,
        tenantId: tenant._id,
      });

      navigate("/dashboard");
      return true;
    } catch (err) {
      throw err?.response?.data?.message || "Erro ao registar.";
    }
  };

  // =========================================================
  // FORGOT PASSWORD (email com OTP)
  // =========================================================
  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgot-password", { email });
      return true;
    } catch (err) {
      throw err?.response?.data?.message || "Erro ao enviar instruções.";
    }
  };

  // =========================================================
  // RESET PASSWORD (com OTP)
  // =========================================================
  const resetPassword = async (payload) => {
    try {
      await api.post("/auth/reset-password", payload);
      return true;
    } catch (err) {
      throw err?.response?.data?.message || "Erro ao redefinir password.";
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setTenantId(null);
    navigate("/login");
  }, [navigate]);

  // =========================================================
  // Carregar sessão ao iniciar
  // =========================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedTenant = localStorage.getItem("tenantId");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setTenantId(storedTenant || null);
    }

    setLoadingUser(false);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        tenantId,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        loadingUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
