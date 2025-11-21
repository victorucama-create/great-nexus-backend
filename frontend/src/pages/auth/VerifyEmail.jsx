import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("validating");

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    }

    if (token) verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center">

        {status === "validating" && (
          <h2 className="text-lg font-semibold text-gray-600">A validar token...</h2>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-bold text-green-600">Email verificado!</h2>
            <p className="mt-3 text-gray-600">
              Agora já pode iniciar sessão no Great Nexus.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-block bg-indigo-600 px-5 py-2 text-white rounded-lg"
            >
              Ir para Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Token inválido</h2>
            <p className="mt-3 text-gray-600">Peça um novo link de verificação.</p>
            <Link
              to="/resend-verification"
              className="mt-5 inline-block bg-gray-700 px-5 py-2 text-white rounded-lg"
            >
              Reenviar Link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
