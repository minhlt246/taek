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
  const pathname = usePathname();
  const { loginSuccess, account } = useAccountStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: "ti ti-home" },
    { href: "/gioi-thieu", label: "Giới thiệu", icon: "ti ti-info-circle" },
    { href: "/lop-hoc", label: "Lớp học", icon: "ti ti-school" },
    { href: "/tin-tuc", label: "Tin tức", icon: "ti ti-news" },
    {
      href: "/huan-luyen-vien",
      label: "Huấn luyện viên",
      icon: "ti ti-user-star",
    },
    { href: "/lich-tap", label: "Lịch tập", icon: "ti ti-calendar" },
    { href: "/thu-vien", label: "Thư viện", icon: "ti ti-photo" },
    { href: "/lien-he", label: "Liên hệ", icon: "ti ti-phone" },
  ];

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleOffcanvasClose = (): void => {
    const offcanvasElement = document.getElementById("menu");
    if (offcanvasElement) {
      const bsOffcanvas = (window as any).bootstrap?.Offcanvas.getInstance(
        offcanvasElement
      );
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <nav className="navbar navbar-expand-lg py-0">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link href="/" className="navbar-brand p-0">
            <Image
              src="/styles/images/logo.png"
              alt="Taekwondo Logo"
              width={100}
              height={100}
              className="img-logo"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="navbar-nav ms-auto d-none d-lg-flex">
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
              <li className="nav-item">
                <Link href="/user-center/profile" className="nav-link me-lg-3">
                  <i className="ti ti-user nav-icon"></i>
                  <span>{account?.name || "Tài khoản"}</span>
                </Link>
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
