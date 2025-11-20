import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const ok = await login(email, password);

    if (ok) {
      navigate("/dashboard");
    } else {
      setErrorMsg("Credenciais inválidas. Verifique e tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* CARD */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-10 border border-gray-200 dark:border-gray-700">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            GREAT NEXUS
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Ecossistema Empresarial</p>
        </div>

        {/* ERRO */}
        {errorMsg && (
          <div className="mb-4 text-red-600 text-sm text-center bg-red-100 dark:bg-red-900 py-2 rounded">
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin}>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="ex: admin@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Palavra-passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Introduza a palavra-passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition disabled:bg-blue-400"
          >
            {loading ? "A autenticar..." : "Entrar"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
          Não tens conta?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
}
