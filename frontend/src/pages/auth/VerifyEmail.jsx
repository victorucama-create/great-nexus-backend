import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Lottie from "lottie-react";
import successAnimation from "../../assets/lottie/success.json";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function verify() {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center">

        {status === "loading" && <p>A validar email...</p>}

        {status === "success" && (
          <>
            <Lottie animationData={successAnimation} style={{ height: 160 }} />
            <h2 className="text-xl font-bold">Email verificado!</h2>
            <p className="text-gray-600 mt-2">Agora já pode iniciar sessão.</p>

            <Link
              to="/login"
              className="mt-4 block bg-indigo-600 text-white py-2 rounded-lg"
            >
              Ir para Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Token inválido</h2>
            <p className="text-gray-600 mt-2">
              O link pode ter expirado. Solicite novamente.
            </p>

            <Link
              to="/resend-verification"
              className="mt-4 block bg-indigo-600 text-white py-2 rounded-lg"
            >
              Reenviar verificação
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
