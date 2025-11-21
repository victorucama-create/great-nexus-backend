import { useState } from "react";
import api from "../../services/api";
import Lottie from "lottie-react";
import emailAnimation from "../../assets/lottie/email.json";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post("/auth/forgot-password", { email });
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">

        {sent ? (
          <div className="text-center">
            <Lottie animationData={emailAnimation} style={{ height: 180 }} />
            <h2 className="font-bold text-xl">Código enviado!</h2>
            <p className="text-gray-600 mt-2">
              Verifique sua caixa de entrada.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Recuperar palavra-passe</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Seu email"
                className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="w-full py-3 bg-indigo-600 text-white rounded-lg">
                Enviar código
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
