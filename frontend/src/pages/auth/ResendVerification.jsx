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
    if (!email) return pushToast({ type: "error", title: "Erro", message: "Insira o seu email." });

    setLoading(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      pushToast({ type: "success", title: "Enviado", message: res.data?.message || "Verifique o seu email." });
      setSent(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erro ao reenviar.";
      pushToast({ type: "error", title: "Erro", message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
        {!sent ? (
          <>
            <h2 className="text-2xl font-bold mb-2">Reenviar verificação</h2>
            <p className="text-gray-600 mb-4">Insira o email que usou para registar e enviaremos um novo link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                aria-label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200"
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "A enviar..." : "Reenviar link"}
              </button>
            </form>

            <div className="mt-4 text-sm text-gray-600">
              <Link to="/login" className="text-indigo-600 hover:underline">Voltar ao login</Link>
            </div>
          </>
        ) : (
          <div>
            <Lottie animationData={emailAnimation} style={{ height: 160 }} />
            <h3 className="text-lg font-bold mt-2">Verificação reenviada</h3>
            <p className="text-gray-600 mt-1">Verifique a sua caixa de entrada.</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Ir para Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
