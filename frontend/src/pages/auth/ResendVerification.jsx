// frontend/src/pages/auth/ResendVerification.jsx
import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import emailAnimation from "../../assets/lottie/email.json";
import successAnimation from "../../assets/lottie/success.json";
import useToast from "../../hooks/useToast";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { pushToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      pushToast({
        type: "error",
        title: "Email necessário",
        message: "Digite o email usado na criação da conta.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });

      pushToast({
        type: "success",
        title: "Enviado!",
        message: res.data?.message || "Verifique o seu email para o novo link.",
      });

      setSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Erro ao reenviar o link de verificação.";

      pushToast({
        type: "error",
        title: "Erro",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
        
        {!sent ? (
          <>
            <Lottie animationData={emailAnimation} style={{ height: 150 }} />

            <h2 className="text-2xl font-bold mt-2">Reenviar Verificação</h2>
            <p className="text-gray-600 mt-2">
              Insira o email usado na sua conta e enviaremos um novo link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg font-semibold disabled:opacity-60"
              >
                {loading ? "A enviar..." : "Reenviar Link"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
              <Link to="/login" className="text-indigo-600 hover:underline">
                Voltar ao login
              </Link>
            </p>
          </>
        ) : (
          <>
            <Lottie animationData={successAnimation} style={{ height: 160 }} />

            <h3 className="text-xl font-bold mt-3 text-green-600">
              Verificação enviada!
            </h3>

            <p className="text-gray-600 mt-1">
              Por favor verifique a sua caixa de entrada.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-3 rounded-lg"
            >
              Ir para Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
