// frontend/src/pages/auth/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import Lottie from "lottie-react";
// Se preferir usar a animação que já gerámos no servidor, ver nota abaixo.
// import successAnimation from "../../assets/lottie/success.json";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'error'
  const [message, setMessage] = useState("");

  // Opcional: animação de sucesso (mostra após sucesso)
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setStatus(null);

    // Validações simples de UI
    if (!email || !otp || !password || !confirm) {
      setStatus("error");
      setMessage("Por favor preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("As passwords não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        otp,
        newPassword: password,
      };

      const res = await axios.post("/auth/reset-password", payload);

      if (res.data && res.data.success) {
        setStatus("ok");
        setMessage(res.data.message || "Password alterada com sucesso.");
        setShowSuccess(true);

        // mostrar animação um segundo e redirecionar para login
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/login");
        }, 1200);
      } else {
        setStatus("error");
        setMessage(res.data?.message || "Erro ao redefinir password.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message ||
          "Erro de comunicação com o servidor. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Redefinir Password
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Introduza o email, o código OTP que recebeu por email e a nova
          password.
        </p>

        {status === "error" && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-100"
            aria-live="assertive"
          >
            {message}
          </div>
        )}

        {status === "ok" && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-100"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-describedby="reset-help">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@empresa.com"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código OTP
            </label>
            <input
              id="otp"
              type="text"
              required
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              aria-describedby="otp-help"
            />
            <p id="otp-help" className="text-xs text-gray-400 mt-1">
              Insira o código de 6 dígitos que recebeu por email (válido 10 minutos).
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nova password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova password"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmar password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Reescreva a nova password"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-60"
            aria-busy={loading}
          >
            {loading ? "A processar..." : "Atualizar password"}
          </button>
        </form>

        {/* Success animation modal area (opcional) */}
        {showSuccess && (
          <div className="mt-6 flex justify-center">
            <div className="w-40">
              {/* Se importar uma animação local: descomente a linha import e troque aqui */}
              {/* <Lottie animationData={successAnimation} loop={false} /> */}
              <div className="text-center text-green-600 font-semibold">✔ Sucesso</div>
            </div>
          </div>
        )}

        <div id="reset-help" className="mt-6 text-sm text-gray-500">
          <p>
            Se não recebeu o código, verifique a pasta de SPAM ou solicite novamente.
          </p>
        </div>
      </div>
    </div>
  );
}
