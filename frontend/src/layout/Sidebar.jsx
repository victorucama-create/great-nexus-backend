import { NavLink } from "react-router-dom";
import "./Layout.css";

export default function Sidebar() {
  return (
    <div className="gn-sidebar">
      <div className="gn-logo">Great Nexus</div>

      <div className="tenant-box">
        <div className="tenant-name">Minha Empresa</div>
        <div className="tenant-plan">Plano: Enterprise</div>
      </div>

      <nav className="gn-nav">
        <NavLink to="/dashboard">📊 Dashboard</NavLink>

        <p className="nav-section">ERP</p>
        <NavLink to="/products">📦 Produtos</NavLink>
        <NavLink to="/inventory">📚 Inventário</NavLink>
        <NavLink to="/suppliers">🏭 Fornecedores</NavLink>
        <NavLink to="/purchases">🧾 Compras</NavLink>
        <NavLink to="/sales">🛒 Vendas</NavLink>

        <p className="nav-section">Produção</p>
        <NavLink to="/mrp">🏗️ MRP</NavLink>

        <p className="nav-section">CRM & HR</p>
        <NavLink to="/crm">👥 CRM</NavLink>
        <NavLink to="/hr">🧑‍💼 RH</NavLink>

        <p className="nav-section">Fintech</p>
        <NavLink to="/investments">💰 Great Mola</NavLink>

        <p className="nav-section">Marketplace B2B</p>
        <NavLink to="/b2b">🤝 B2B Marketplace</NavLink>

        <p className="nav-section">Logística</p>
        <NavLink to="/logistics">🚚 Logística</NavLink>

        <p className="nav-section">Sistema</p>
        <NavLink to="/settings">⚙️ Configurações</NavLink>
        <NavLink to="/profile">👤 Meu Perfil</NavLink>
      </nav>
    </div>
  );
}
