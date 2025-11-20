import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    country: "MZ",
    currency: "MZN",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const success = await register(form);

    if (!success) {
      setErrorMsg("Erro ao criar conta. Verifique os dados.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 px-4">
      
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden flex">
        
        {/* LEFT SIDE — FORM */}
        <div className="w-full md:w-1/2 p-10">
          
          <h2 className="text-3xl font-bold text-gray-900">
            Criar Conta
          </h2>

          <p className="text-gray-500 mt-2 mb-6">
            Bem-vindo ao <strong>Great Nexus</strong> — o ecossistema empresarial inteligente.
          </p>

          {errorMsg && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome */}
            <div>
              <label className="text-sm font-medium text-gray-700">Nome completo</label>
              <input
                type="text"
                name="name"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: João Manuel"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="empresa@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input
                type="text"
                name="companyName"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Great Pollo"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* País */}
            <div>
              <label className="text-sm font-medium text-gray-700">País</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MZ">Moçambique (MZ)</option>
                <option value="PT">Portugal (PT)</option>
                <option value="BR">Brasil (BR)</option>
                <option value="ZA">África do Sul (ZA)</option>
              </select>
            </div>

            {/* Moeda */}
            <div>
              <label className="text-sm font-medium text-gray-700">Moeda</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MZN">Metical (MZN)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="ZAR">Rand (ZAR)</option>
              </select>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg transition shadow-lg"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-500 text-sm">
              Já tem conta?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Entrar
              </Link>
            </p>

          </form>
        </div>

        {/* RIGHT SIDE — BRANDING */}
        <div className="hidden md:flex w-1/2 bg-indigo-700 text-white flex-col justify-center items-center p-10 text-center">
          <h1 className="text-4xl font-extrabold mb-4">Great Nexus</h1>
          <p className="text-lg opacity-90">
            Gestão empresarial inteligente.  
            ERP • MRP • CRM • HR • B2B • Logística • Mola  
          </p>
          <div className="mt-8">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
              className="w-40 opacity-90 drop-shadow-lg"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
