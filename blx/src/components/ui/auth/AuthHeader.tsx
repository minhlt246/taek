"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AuthHeader: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="auth-header">
      <div className="container-fluid">
        <div className="auth-header-content">
          {/* Logo */}
          <div className="auth-header-logo">
            <Link href="/" className="auth-logo-link">
              <span className="auth-logo-text">TAEKWONDO ĐỒNG PHÚ</span>
            </Link>
            <div className="auth-logo-dots">
              <span className="auth-dot"></span>
              <span className="auth-dot"></span>
              <span className="auth-dot"></span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="auth-header-nav">
            <Link
              href="/"
              className={`auth-nav-link ${pathname === "/" ? "active" : ""}`}
            >
              Trang chủ
            </Link>
            <Link
              href="/login"
              className={`auth-nav-link ${
                pathname === "/login" ? "active" : ""
              }`}
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className={`auth-nav-link ${
                pathname === "/register" ? "active" : ""
              }`}
            >
              Đăng ký
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
