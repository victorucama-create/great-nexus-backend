// frontend/src/pages/auth/Register.jsx

import { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../../context/AuthContext";

// Assets (no seu ambiente de build estas URLs serão tratadas / servidas)
import successAnimation from "sandbox:/mnt/data/email_lottie_premium.json";
import heroImage from "sandbox:/mnt/data/A_digital_image_displays_mockups_of_a_software_int.png";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("MZ");
  const [currency, setCurrency] = useState("MZN");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const recaptchaRef = useRef(null);
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  // Simple password strength check
  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[\W]/.test(pw)) score++;
    return score; // 0..4
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    // Basic validations
    if (!companyName.trim() || !name.trim() || !email.trim() || !password || !confirm) {
      setErrorMsg("Por favor preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("As passwords não coincidem.");
      return;
    }

    if (password.length < 8 || passwordStrength(password) < 2) {
      setErrorMsg("A password deve ter pelo menos 8 caracteres e ser razoavelmente forte.");
      return;
    }

    setLoading(true);

    try {
      // reCAPTCHA invisible (se configurado)
      let captchaToken = null;
      if (RECAPTCHA_SITE_KEY && recaptchaRef.current) {
        try {
          captchaToken = await recaptchaRef.current.executeAsync();
          recaptchaRef.current.reset();
        } catch (rcErr) {
          // não bloquear se recaptcha falhar; continuar sem token
          console.warn("reCAPTCHA falhou:", rcErr);
        }
      }

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim(),
        country,
        currency,
        phone: phone.trim(),
        captchaToken, // opcional para backend validar
      };

      // Chama o AuthContext.register (que usa api.js)
      await register(payload);

      // mostrar animação de sucesso leve e redirecionar
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/dashboard");
      }, 1100);
    } catch (err) {
      // register deve lançar mensagem de erro amigável
      setErrorMsg(err?.toString?.() || err?.message || "Erro ao registar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT: Form */}
        <div className="p-10 md:p-14 lg:p-16">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Criar Conta — Great Nexus
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Registe a sua empresa e comece a transformar a gestão do seu negócio.
          </p>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded" role="alert" aria-live="assertive">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-describedby="register-help">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Empresa *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Ex: Great Pollo Lda"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="MZ">Moçambique</option>
                  <option value="AO">Angola</option>
                  <option value="PT">Portugal</option>
                  <option value="BR">Brasil</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seu Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: João Silva"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Moeda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="MZN">MZN - Metical</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@empresa.com"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Password *</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repita a password"
                  className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* reCAPTCHA invisível */}
            {RECAPTCHA_SITE_KEY && (
              <div style={{ display: "none" }}>
                <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} size="invisible" ref={recaptchaRef} />
              </div>
            )}

            <div className="mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-60"
                aria-busy={loading}
              >
                {loading ? "A registar..." : "Criar Conta"}
              </button>
            </div>

            <p id="register-help" className="text-sm text-gray-600 dark:text-gray-300 mt-3">
              Ao criar a conta aceita os <Link className="underline">Termos</Link> e a <Link className="underline">Política de Privacidade</Link>.
            </p>
          </form>
        </div>

        {/* RIGHT: Hero / Lottie */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-800 p-8">
          {!showSuccess ? (
            <div className="text-center text-white px-4 max-w-xs">
              <h2 className="text-2xl font-bold mb-2">Comece hoje</h2>
              <p className="opacity-90 mb-6">ERP, MRP, CRM e Fintech integrados para PMEs.</p>
              <img src={heroImage} alt="Great Nexus" className="mx-auto rounded shadow-lg" />
            </div>
          ) : (
            <div className="w-48">
              <Lottie animationData={successAnimation} loop={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
