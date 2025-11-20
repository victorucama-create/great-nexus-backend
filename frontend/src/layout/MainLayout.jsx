import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function MainLayout({ children }) {
  return (
    <div className="gn-layout">
      <Sidebar />
      <div className="gn-main-area">
        <Topbar />
        <div className="gn-page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
