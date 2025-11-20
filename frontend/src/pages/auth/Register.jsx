import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);

  const [payload, setPayload] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    country: "",
    currency: "",
  });

  function handleChange(e) {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await register(payload);
  }

  return (
    <div className="auth-container">
      <h2>Criar Conta</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" placeholder="Senha" onChange={handleChange} />
        <input name="companyName" placeholder="Empresa" onChange={handleChange} />
        <input name="country" placeholder="País" onChange={handleChange} />
        <input name="currency" placeholder="Moeda" onChange={handleChange} />

        <button type="submit">Registar</button>
      </form>
    </div>
  );
}
