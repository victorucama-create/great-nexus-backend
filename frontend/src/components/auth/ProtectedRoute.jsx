import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Aguardar o carregamento do contexto (evita flicker)
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg font-medium">
        Carregando...
      </div>
    );
  }

  // Se não estiver logado → ir ao Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Caso logado → renderizar conteúdo protegido
  return children;
}
