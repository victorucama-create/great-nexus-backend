import { useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import axios from "../../services/api";

// Import da animação
import emailAnimation from "../../assets/lottie/email.json";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/forgot-password", { email });

      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.message || "Algo correu mal.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erro ao enviar instruções de recuperação."
      );
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white">
            Recuperar Password
          </h1>
          <p className="text-slate-300 mt-2">
            Insira o seu email e enviaremos instruções para redefinir.
          </p>
        </div>

        {/* Animação */}
        <div className="w-48 mx-auto mb-4">
          <Lottie animationData={emailAnimation} loop />
        </div>

        {/* Caso sucesso */}
        {success ? (
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400">
              Email enviado com sucesso! 📩
            </h2>
            <p className="text-slate-300 mt-2">
              Verifique a sua caixa de entrada (ou SPAM).
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Voltar ao Login
            </Link>
          </div>
        ) : (
          /* Form */
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 text-red-300 p-3 rounded-lg border border-red-500/40">
                {error}
              </div>
            )}

            <div>
              <label className="text-white font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Enviando..." : "Enviar Instruções"}
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                Voltar ao Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
