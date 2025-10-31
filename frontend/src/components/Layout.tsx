import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";
import "../styles/Layout.css";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Credit Jambo</h2>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/users"
            className={`nav-item ${isActive("/users") ? "active" : ""}`}
          >
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </Link>
          <Link
            to="/credits"
            className={`nav-item ${isActive("/credits") ? "active" : ""}`}
          >
            <span className="nav-icon">💳</span>
            <span>Credit Requests</span>
          </Link>
          <Link
            to="/transactions"
            className={`nav-item ${isActive("/transactions") ? "active" : ""}`}
          >
            <span className="nav-icon">💰</span>
            <span>Transactions</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <strong>
              {admin?.firstName} {admin?.lastName}
            </strong>
            <span className="role">{admin?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
};
