import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

export default function VerifyEmail() {
  const { showSuccess, showError } = useToast();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          showSuccess("Email verificado! Pode iniciar sessão.");
          setOk(true);
        } else {
          showError(res.data.message);
        }
      } catch (e) {
        showError("Erro ao verificar email.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full text-center">
        {loading && <p>A validar...</p>}

        {!loading && ok && (
          <>
            <h2 className="text-xl font-bold text-green-600">Email verificado!</h2>
            <Link to="/login" className="block mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
              Ir para Login
            </Link>
          </>
        )}

        {!loading && !ok && (
          <>
            <h2 className="text-xl font-bold text-red-600">Falhou</h2>
            <Link to="/resend-verification" className="block mt-4 bg-gray-800 text-white px-4 py-2 rounded">
              Reenviar Email
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
