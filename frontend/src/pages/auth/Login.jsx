// frontend/src/pages/auth/Login.jsx
import { useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import Lottie from "lottie-react";
// usa um ficheiro Lottie local ou URL; como exemplo use um JSON de sucesso
import successAnimation from "../../assets/lottie/success.json";

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
  const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY";

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Por favor preencha o email e a password.");
      return;
    }

    setLoading(true);

    try {
      // Executar reCAPTCHA (se configurado)
      let captchaToken = null;
      if (RECAPTCHA_SITE_KEY && recaptchaRef.current) {
        captchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();
      }

      // Chamada ao AuthContext.login — o AuthContext deve adicionar captchaToken ao request (se desejar)
      const ok = await login(email, password, captchaToken);

      if (ok) {
        // Mostrar animação de sucesso por 1s e redirecionar
        setShowSuccessAnim(true);
        setTimeout(() => {
          setShowSuccessAnim(false);
          // lembrar: se não 'remember', o AuthContext já move token para sessionStorage (se implementado)
          navigate("/dashboard");
        }, 900);
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
    setEmail("demo@greatnexus.com");
    setPassword("demo123");
    setLoading(true);
    setErrorMsg("");
    try {
      const ok = await login("demo@greatnexus.com", "demo123");
      if (ok) navigate("/dashboard");
      else setErrorMsg("Demo login falhou.");
    } catch {
      setErrorMsg("Erro no login demo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div
        className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        role="region"
        aria-labelledby="login-heading"
      >
        {/* LEFT: FORM */}
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 id="login-heading" className="text-2xl md:text-3xl font-extrabold text-gray-900">
              GREAT NEXUS
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Ecossistema Empresarial Inteligente — faça login para continuar
            </p>
          </div>

          {errorMsg && (
            <div
              className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded"
              role="alert"
              aria-live="assertive"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="login-help">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-required="true"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-required="true"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="inline-flex items-center gap-2" htmlFor="remember">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-4 w-4"
                />
                <span>Lembrar-me</span>
              </label>

              <Link to="/forgot-password" className="text-indigo-600 hover:underline">
                Esqueceu a password?
              </Link>
            </div>

            {/* reCAPTCHA */}
            {RECAPTCHA_SITE_KEY && (
              <div className="mt-2" aria-hidden="true">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  size="invisible"
                  ref={recaptchaRef}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition disabled:opacity-60"
              aria-busy={loading}
            >
              {loading ? "A autenticar..." : "Entrar"}
            </button>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
              <div className="text-xs text-gray-500">ou</div>
              <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
            </div>

            <button
              type="button"
              onClick={handleDemo}
              className="w-full mt-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 flex items-center justify-center gap-3"
            >
              Entrar com Demo
              <span className="text-sm text-gray-400">(demo@greatnexus.com)</span>
            </button>

            <p id="login-help" className="mt-4 text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Criar Conta
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT: Lottie / Branding */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 p-6">
          <div className="text-center text-white px-4">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Great Nexus</h2>
            <p className="opacity-90 mb-6">
              Gestão integrada: ERP • MRP • CRM • HR • B2B • Fintech • Logística
            </p>

            {/* Lottie success placeholder: será mostrado apenas quando login for bem-sucedido */}
            <div aria-hidden={!showSuccessAnim}>
              {showSuccessAnim ? (
                <div className="w-56 mx-auto">
                  <Lottie animationData={successAnimation} loop={false} />
                </div>
              ) : (
                <img
                  src="/assets/images/login-illustration.png"
                  alt="App illustration"
                  className="mx-auto w-56 opacity-90 rounded"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
