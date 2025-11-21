import { useState } from "react";
import api from "../../services/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pass, setPass] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword: pass,
    });

    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">

        {done ? (
          <div className="text-center text-green-600 font-bold">
            Palavra-passe redefinida! Já pode fazer login.
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Definir nova password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-100 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                placeholder="Código recebido"
                className="w-full px-4 py-3 bg-gray-100 rounded"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <input
                type="password"
                placeholder="Nova password"
                className="w-full px-4 py-3 bg-gray-100 rounded"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />

              <button className="w-full py-3 bg-indigo-600 text-white rounded-lg">
                Redefinir
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
