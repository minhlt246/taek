"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccountStore } from "@/stores/account";

/**
 * Header component với Bootstrap offcanvas menu
 */
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { loginSuccess, account } = useAccountStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownElement = document.querySelector(".nav-item.dropdown");
      if (
        isDropdownOpen &&
        dropdownElement &&
        !dropdownElement.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: "ti ti-home" },
    { href: "/gioi-thieu", label: "Giới thiệu", icon: "ti ti-info-circle" },
    { href: "/lop-hoc", label: "Lớp học", icon: "ti ti-school" },
    { href: "/tin-tuc", label: "Tin tức", icon: "ti ti-news" },
    { href: "/thu-vien", label: "Thư viện", icon: "ti ti-photo" },
    { href: "/lien-he", label: "Liên hệ", icon: "ti ti-phone" },
  ];

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <nav className="navbar navbar-expand-lg py-0">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link href="/" className="navbar-brand p-0">
            <Image
              src="/client/images/logo.png"
              alt="Taekwondo Logo"
              width={100}
              height={100}
              className="img-logo"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="navbar-nav ms-auto d-none d-lg-flex" style={{ overflow: "visible" }}>
            {navLinks.map((link) => (
              <li key={link.href} className="nav-item">
                <Link
                  href={link.href}
                  className={`nav-link me-lg-3 ${
                    isActive(link.href) ? "active" : ""
                  }`}
                >
                  <i className={`${link.icon} nav-icon`}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}

            {/* Login/User Menu */}
            {loginSuccess ? (
              <li className="nav-item dropdown" style={{ position: "relative", overflow: "visible" }}>
                <a
                  className="nav-link dropdown-toggle me-lg-3"
                  href="#"
                  id="userDropdown"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  aria-expanded={isDropdownOpen}
                >
                  <i className="ti ti-user nav-icon"></i>
                  <span>{account?.name || "Tài khoản"}</span>
                </a>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${
                    isDropdownOpen ? "show" : ""
                  }`}
                  aria-labelledby="userDropdown"
                  style={{
                    display: isDropdownOpen ? "block" : "none",
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    left: "auto",
                    marginTop: "0.125rem",
                    zIndex: 9999,
                    minWidth: "200px",
                  }}
                >
                  <li>
                    <Link
                      href="/user-center/profile"
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="ti ti-user me-2"></i>
                      Tài khoản
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        // Handle logout
                        if (typeof window !== "undefined") {
                          const { logout } = require("@/stores/account").useAccountStore.getState();
                          logout();
                          window.location.href = "/";
                        }
                      }}
                    >
                      <i className="ti ti-logout me-2"></i>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link href="/login" className="nav-link me-lg-3">
                  <i className="ti ti-login nav-icon"></i>
                  <span>Đăng nhập</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler text-white border-0 pe-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#menu"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <i className="fa-solid fa-bars fa-2x"></i>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
