import { createContext, useState, useEffect, useCallback } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // =========================================================
  // Helper — Guarda no localStorage
  // =========================================================
  const saveSession = (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("tenantId", data.tenantId);

    setUser(data.user);
    setTenantId(data.tenantId);
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });

      const { accessToken, refreshToken, user, tenantId } = res.data.data;

      saveSession({ accessToken, refreshToken, user, tenantId });

      navigate("/dashboard");
      return true;
    } catch (error) {
      return false;
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================
  const register = async (payload) => {
    try {
      const res = await axios.post("/auth/register", payload);

      const { accessToken, refreshToken, user, tenant } = res.data.data;

      saveSession({
        accessToken,
        refreshToken,
        user,
        tenantId: tenant._id,
      });

      navigate("/dashboard");
      return true;
    } catch (error) {
      return false;
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
  // Refresh Token Automático
  // =========================================================
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return logout();

    try {
      const res = await axios.post("/auth/refresh", { refreshToken });
      const { accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);
      return accessToken;

    } catch (error) {
      logout();
    }
  }, [logout]);

  // =========================================================
  // Axios Interceptor — adiciona token automaticamente
  // =========================================================
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        let token = localStorage.getItem("accessToken");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // =========================================================
  // Axios Interceptor — Repetir request dps de refresh
  // =========================================================
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshAccessToken]);

  // =========================================================
  // Carregar sessão ao iniciar
  // =========================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedTenant = localStorage.getItem("tenantId");

    if (storedUser && storedTenant) {
      setUser(JSON.parse(storedUser));
      setTenantId(storedTenant);
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
        logout,
        loadingUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
