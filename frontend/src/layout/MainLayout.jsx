import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function MainLayout() {
  return (
    <div className="gn-layout">
      <Sidebar />

      <div className="gn-main-area">
        <Topbar />

        <div className="gn-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
