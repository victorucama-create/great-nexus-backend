// frontend/src/pages/auth/Login.jsx

import { useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import Lottie from "lottie-react";

// LOTTIE animation (sucesso)
import successAnimation from "../../assets/lottie/success.json";

// IMAGEM (caso não tenha, substitua)
import mockupImage from "../../assets/images/login-mockup.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  const recaptchaRef = useRef(null);
  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  // CREDENCIAIS DEMO
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
      // reCAPTCHA invisível (opcional)
      let captchaToken = null;
      if (RECAPTCHA_SITE_KEY && recaptchaRef.current) {
        try {
          captchaToken = await recaptchaRef.current.executeAsync();
          recaptchaRef.current.reset();
        } catch (err) {
          console.warn("Erro no reCAPTCHA:", err);
        }
      }

      const ok = await login(email, password, captchaToken);

      if (ok) {
        // animação curta de sucesso
        setShowSuccessAnim(true);
        setTimeout(() => {
          setShowSuccessAnim(false);
          navigate("/dashboard");
        }, 900);
      } else {
        setErrorMsg("Credenciais inválidas. Verifique e tente novamente.");
      }
    } catch (err) {
      setErrorMsg("Erro ao conectar ao servidor.");
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
      else setErrorMsg("Login Demo falhou.");
    } catch {
      setErrorMsg("Erro no login demo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* ================== LEFT: FORM ================== */}
        <div className="p-10 md:p-14 lg:p-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Great Nexus
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ecossistema Empresarial Inteligente
          </p>

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                Palavra-passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-4 w-4"
                />
                <span className="text-gray-700 dark:text-gray-300">Lembrar-me</span>
              </label>

              <Link to="/forgot-password" className="text-indigo-600 hover:underline">
                Esqueceu a password?
              </Link>
            </div>

            {/* reCAPTCHA invisível */}
            {RECAPTCHA_SITE_KEY && (
              <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} size="invisible" ref={recaptchaRef} />
            )}

            {/* LOGIN BTN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-lg bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "A autenticar..." : "Entrar"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Demo Login */}
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2"
            >
              Entrar com Demo
              <span className="text-xs text-gray-400">(demo@greatnexus.com)</span>
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
                Criar Conta
              </Link>
            </p>
          </form>
        </div>

        {/* ================== RIGHT: ART + SUCCESS ================== */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 p-10 relative">

          {!showSuccessAnim ? (
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Great Nexus</h2>
              <p className="text-sm opacity-90 mb-6">
                ERP • MRP • CRM • HR • Fintech • B2B • Logística
              </p>

              <img
                src={mockupImage}
                alt="Great Nexus Mockup"
                className="w-60 opacity-95 rounded-lg shadow-xl mx-auto"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-52">
                <Lottie animationData={successAnimation} loop={false} />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
