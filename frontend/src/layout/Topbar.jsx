import "./Layout.css";

export default function Topbar() {
  return (
    <header className="gn-topbar">
      <div className="topbar-left">
        <h2>Great Nexus</h2>
      </div>

      <div className="topbar-right">
        <button className="icon-btn">🔔</button>
        <button className="icon-btn">❓</button>
        <button className="icon-btn">⚙️</button>
      </div>
    </header>
  );
}
