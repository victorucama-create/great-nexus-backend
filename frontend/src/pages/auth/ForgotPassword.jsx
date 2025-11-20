// frontend/src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | 'sent' | 'error' | 'loading'
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data?.success) {
        setStatus("sent");
        setMsg("Se o email existir, enviámos instruções para reconfigurar a password.");
      } else {
        setStatus("error");
        setMsg(res.data?.message || "Erro ao processar pedido.");
      }
    } catch (err) {
      setStatus("error");
      setMsg("Erro de comunicação. Tente novamente mais tarde.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-8">
        <h2 className="text-xl font-bold mb-2">Recuperar Password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Insira o email da conta. Iremos enviar um link para reconfigurar a password.
        </p>

        {status === "sent" && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded" role="status">
            {msg}
          </div>
        )}

        {status === "error" && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded" role="alert">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full px-3 py-2 border rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required="true"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-2 bg-indigo-600 text-white rounded"
            aria-busy={status === "loading"}
          >
            {status === "loading" ? "A processar..." : "Enviar instruções"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <a href="/login" className="text-indigo-600">Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}
