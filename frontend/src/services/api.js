import axios from "axios";

// =======================================================
// CONFIGURAÇÃO BASE (Render.com + Local)
// =======================================================
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://great-nexus-backend.onrender.com/api/v1",

  timeout: 15000,
});

// =======================================================
// REQUEST INTERCEPTOR
// Adiciona token + tenant automaticamente
// =======================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const tenantId = localStorage.getItem("tenantId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================================================
// REFRESH TOKEN AUTOMÁTICO
// =======================================================
let isRefreshing = false;
let failedQueue = [];

function queueProcess(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });

  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    // Se token expirou e ainda não tentamos o refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Se já existe refresh em andamento, guardar request na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Chamar backend para refresh
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        const newAccess = res.data.data.accessToken;
        const newRefresh = res.data.data.refreshToken;

        // Guardar novos tokens
        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("refreshToken", newRefresh);

        // Atualizar axios default
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;

        // Processar fila de requests à espera
        queueProcess(null, newAccess);
        isRefreshing = false;

        // Tentar novamente a request original
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        queueProcess(err, null);
        isRefreshing = false;

        // Logout se refresh também falhar
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
