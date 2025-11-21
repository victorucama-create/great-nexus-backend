// frontend/src/pages/auth/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || null;
  const [status, setStatus] = useState("idle"); // idle | validating | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token não fornecido.");
      return;
    }

    async function verify() {
      setStatus("validating");
      try {
        // Fazer chamada ao backend para verificar (rota: GET /auth/verify-email/:token)
        const res = await api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
        if (res.data?.success) {
          setStatus("success");
          setMessage(res.data.message || "Email verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Erro ao verificar email.");
        }
      } catch (err) {
        setStatus("error");
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Erro de comunicação com o servidor.";
        setMessage(errMsg);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        {status === "validating" && (
          <>
            <h2 className="text-lg font-semibold">A validar o seu email...</h2>
            <p className="mt-3 text-gray-600">Por favor aguarde enquanto confirmamos o seu endereço de email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold text-green-600">Email verificado!</h2>
            <p className="mt-3 text-gray-700">{message}</p>
            <div className="mt-6">
              <Link to="/login" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
                Ir para Login
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-red-600">Erro</h2>
            <p className="mt-3 text-gray-700">{message}</p>
            <div className="mt-6 flex gap-2 justify-center">
              <Link to="/resend-verification" className="inline-block bg-gray-700 text-white px-4 py-2 rounded">
                Reenviar Link
              </Link>
              <Link to="/login" className="inline-block border border-gray-300 px-4 py-2 rounded">
                Ir para Login
              </Link>
            </div>
          </>
        )}

        {status === "idle" && (
          <>
            <h2 className="text-lg font-semibold">Aguarde...</h2>
          </>
        )}
      </div>
    </div>
  );
}
