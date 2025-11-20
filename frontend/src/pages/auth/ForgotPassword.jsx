import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../services/api";
import Lottie from "lottie-react";
import emailAnimation from "../../assets/lottie/email.json";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.post("/auth/forgot-password", { email });

      if (res.data.success) {
        setSent(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Erro ao enviar código.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
      
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 max-w-md w-full">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">
          Recuperar Password
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-6">
          Insira o seu email para receber o código de recuperação
        </p>

        {/* LOTTIE ANIMATION */}
        <div className="w-48 h-48 mx-auto mb-4">
          <Lottie animationData={emailAnimation} loop={true} />
        </div>

        {/* CONFIRMAÇÃO DE ENVIO */}
        {sent ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 text-lg font-medium mb-6">
              ✔ Código enviado para o seu email!
            </p>
            <Link
              to="/reset-password"
              className="w-full block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl transition"
            >
              Inserir Código OTP
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* INPUT EMAIL */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-1 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 dark:text-white outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition"
                placeholder="o.seu@email.com"
              />
            </div>

            {/* ERRO */}
            {errorMsg && (
              <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Enviar código"}
            </button>
          </form>
        )}

        {/* VOLTAR AO LOGIN */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
}
