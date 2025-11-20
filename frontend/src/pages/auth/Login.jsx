// frontend/src/pages/auth/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Demo credentials (useful for demo button)
  const DEMO_EMAIL = "demo@greatnexus.com";
  const DEMO_PASS = "demo123";

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Por favor preencha o email e a password.");
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);

      if (ok) {
        // If user chose not to remember, keep tokens in session only (optional)
        if (!remember) {
          // move accessToken to sessionStorage to avoid persistent login
          const token = localStorage.getItem("accessToken");
          if (token) {
            sessionStorage.setItem("accessToken", token);
            localStorage.removeItem("accessToken");
          }
        }
        navigate("/dashboard");
      } else {
        setErrorMsg("Credenciais inválidas. Verifique e tente novamente.");
      }
    } catch (err) {
      setErrorMsg(typeof err === "string" ? err : "Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setLoading(true);
    setErrorMsg("");
    try {
      const ok = await login(DEMO_EMAIL, DEMO_PASS);
      if (ok) navigate("/dashboard");
      else setErrorMsg("Demo login falhou.");
    } catch {
      setErrorMsg("Erro no login demo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT: FORM */}
        <div className="p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              GREAT NEXUS
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ecossistema Empresarial Inteligente — faça login para continuar
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                />
                <span>Lembrar-me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:underline"
              >
                Esqueceu a password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition disabled:opacity-60"
            >
              {loading ? "A autenticar..." : "Entrar"}
            </button>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-xs text-gray-500 dark:text-gray-400">ou</div>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full mt-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 hover:shadow"
            >
              Entrar com Demo
              <span className="text-sm text-gray-400">(demo@greatnexus.com)</span>
            </button>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Criar Conta
              </Link>
            </p>
          </form>

          {/* Small footer */}
          <div className="mt-8 text-xs text-gray-400">
            Ao entrar aceita os nossos <Link className="underline">Termos</Link> e a{" "}
            <Link className="underline">Política de Privacidade</Link>.
          </div>
        </div>

        {/* RIGHT: Illustration / Mockup */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 p-6">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Great Nexus</h2>
            <p className="opacity-90 mb-6">
              Gestão integrada: ERP • MRP • CRM • HR • B2B • Fintech • Logística
            </p>

            {/* MOCKUP IMAGE - local path you uploaded */}
            <img
              src="/mnt/data/A_digital_image_displays_mockups_of_a_software_int.png"
              alt="Great Nexus mockup"
              className="mx-auto w-56 drop-shadow-2xl rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
