"use client";

import { useAccountStore } from "@/stores/account";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const AdminHeader = () => {
  const { account, logout } = useAccountStore();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      setIsDarkMode(true);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if clicked element is inside notification dropdown or its menu
      const isNotificationClick = target.closest(
        ".notification-dropdown-container"
      );
      if (!isNotificationClick) {
        setShowNotificationDropdown(false);
      }

      // Check if clicked element is inside user dropdown or its menu
      const isUserClick = target.closest(".user-dropdown-container");
      if (!isUserClick) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotificationDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const toggleUserDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-bs-theme");

    if (currentTheme === "dark") {
      html.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      html.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header
      className="navbar-header"
      style={{ overflow: "visible", zIndex: 1000 }}
    >
      <div
        className="page-container topbar-menu"
        style={{ overflow: "visible" }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* Mobile Button */}
          <a id="mobile_btn" className="mobile-btn" href="#sidebar">
            <i className="ti ti-menu-deep fs-24"></i>
          </a>

          <button
            className="sidenav-toggle-btn btn border-0 p-0"
            id="toggle_btn2"
          >
            <i className="ti ti-arrow-bar-to-right"></i>
          </button>

          {/* Search */}
          <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
            <div className="input-icon position-relative me-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search Keyword"
              />
              <span className="input-icon-addon d-inline-flex p-0 header-search-icon">
                <i className="ti ti-command"></i>
              </span>
            </div>
          </div>
        </div>

        <div
          className="d-flex align-items-center"
          style={{ overflow: "visible" }}
        >
          {/* Search for Mobile */}
          <div className="header-item d-flex d-lg-none me-2">
            <button
              className="topbar-link btn"
              data-bs-toggle="modal"
              data-bs-target="#searchModal"
              type="button"
            >
              <i className="ti ti-search fs-16"></i>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <div className="header-item">
            <button
              onClick={toggleFullscreen}
              className="btn topbar-link"
              type="button"
              title="Toàn màn hình"
            >
              <i className="ti ti-maximize"></i>
            </button>
          </div>

          {/* Light/Dark Mode Button */}
          <div className="header-item d-none d-sm-flex me-2">
            <button
              onClick={toggleDarkMode}
              className="topbar-link btn topbar-link"
              type="button"
              title={
                isDarkMode
                  ? "Chuyển sang chế độ sáng"
                  : "Chuyển sang chế độ tối"
              }
            >
              <i
                className={`ti ${isDarkMode ? "ti-sun" : "ti-moon"} fs-16`}
              ></i>
            </button>
          </div>

          <div className="header-line"></div>

          {/* Notification Dropdown */}
          <div className="header-item notification-dropdown-container position-relative">
            <div className="dropdown me-2">
              <button
                className="topbar-link btn topbar-link position-relative"
                onClick={toggleNotificationDropdown}
                onMouseDown={(e) => e.stopPropagation()}
                type="button"
                aria-label="Notifications"
              >
                <i className="ti ti-bell fs-16"></i>
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
                  10
                </span>
              </button>
              {showNotificationDropdown && (
                <div
                  className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg shadow show"
                  style={{
                    minHeight: "300px",
                    minWidth: "350px",
                    zIndex: 1050,
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    left: "auto",
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="p-2 border-bottom">
                    <div className="row align-items-center">
                      <div className="col">
                        <h6 className="m-0 fs-16 fw-semibold">Thông báo</h6>
                      </div>
                      <div className="col-auto">
                        <small className="text-muted">10 thông báo mới</small>
                      </div>
                    </div>
                  </div>
                  <div
                    className="notification-body position-relative z-2 rounded-0"
                    data-simplebar
                    style={{ maxHeight: "400px" }}
                  >
                    {/* Sample notifications */}
                    <div className="dropdown-item py-2 border-bottom">
                      <div className="d-flex">
                        <i className="ti ti-user-plus text-primary me-2"></i>
                        <div>
                          <p className="mb-0 small">
                            Nguyễn Văn A đã đăng ký mới
                          </p>
                          <span className="text-muted small">5 phút trước</span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-item py-2 border-bottom">
                      <div className="d-flex">
                        <i className="ti ti-credit-card text-success me-2"></i>
                        <div>
                          <p className="mb-0 small">Thanh toán thành công</p>
                          <span className="text-muted small">
                            10 phút trước
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-item py-2 border-bottom">
                      <div className="d-flex">
                        <i className="ti ti-award text-warning me-2"></i>
                        <div>
                          <p className="mb-0 small">Hoàn thành thăng đai</p>
                          <span className="text-muted small">1 giờ trước</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-bottom border-top text-center">
                    <Link
                      href="/admin/notifications"
                      className="text-decoration-underline fs-14 mb-0"
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Dropdown */}
          <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center user-dropdown-container position-relative">
            <button
              className="topbar-link drop-arrow-none position-relative border-0 bg-transparent p-0"
              onClick={toggleUserDropdown}
              onMouseDown={(e) => e.stopPropagation()}
              type="button"
              aria-label="User menu"
            >
              <img
                src="/styles/assets/img/users/user-40.jpg"
                width="38"
                className="rounded-1 d-flex"
                alt="user-image"
              />
              <span className="online text-success">
                <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white"></i>
              </span>
            </button>
            {showUserDropdown && (
              <div
                className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2 show"
                style={{
                  zIndex: 1050,
                  position: "absolute",
                  minWidth: "250px",
                  top: "100%",
                  right: 0,
                  left: "auto",
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                  <img
                    src="/styles/assets/img/users/user-40.jpg"
                    className="rounded-circle"
                    width="42"
                    height="42"
                    alt="Img"
                  />
                  <div className="ms-2">
                    <p className="fw-medium text-dark mb-0">
                      {account?.name || "Admin"}
                    </p>
                    <span className="d-block fs-13">
                      {account?.role || "Administrator"}
                    </span>
                  </div>
                </div>

                <Link href="/admin/profile" className="dropdown-item">
                  <i className="ti ti-user-circle me-1 align-middle"></i>
                  <span className="align-middle">Cài đặt hồ sơ</span>
                </Link>

                <Link href="/admin/settings" className="dropdown-item">
                  <i className="ti ti-settings me-1 align-middle"></i>
                  <span className="align-middle">Cài đặt</span>
                </Link>

                <div className="pt-2 mt-2 border-top">
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                    <span className="align-middle">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
