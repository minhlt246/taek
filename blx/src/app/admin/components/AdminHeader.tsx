"use client";

import { useAccountStore } from "@/stores/account";
import { useRouter } from "next/navigation";

const AdminHeader = () => {
  const { account, logout } = useAccountStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="btn btn-outline-primary btn-sm">
            <i className="fas fa-bell"></i>
            <span className="badge badge-danger">3</span>
          </button>

          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-user"></i>
              {account?.name || "Admin"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="/admin/profile">
                  <i className="fas fa-user"></i> Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/admin/settings">
                  <i className="fas fa-cog"></i> Settings
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
