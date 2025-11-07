"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: "ti ti-dashboard",
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      title: "Võ sinh",
      icon: "ti ti-users",
      href: "/admin/users",
      active: pathname.startsWith("/admin/users"),
    },
    {
      title: "Huấn luyện viên",
      icon: "ti ti-user-star",
      href: "/admin/coaches",
      active: pathname.startsWith("/admin/coaches"),
    },
    {
      title: "Câu lạc bộ",
      icon: "ti ti-building-store",
      href: "/admin/clubs",
      active: pathname.startsWith("/admin/clubs"),
    },
    {
      title: "Khóa học",
      icon: "ti ti-book",
      href: "/admin/courses",
      active: pathname.startsWith("/admin/courses"),
    },
    {
      title: "Lịch tập",
      icon: "ti ti-calendar-event",
      href: "/admin/schedules",
      active: pathname.startsWith("/admin/schedules"),
    },
    {
      title: "Cấp đai",
      icon: "ti ti-award",
      href: "/admin/belt-levels",
      active: pathname.startsWith("/admin/belt-levels"),
    },
    {
      title: "Thanh toán",
      icon: "ti ti-credit-card",
      href: "/admin/payments",
      active: pathname.startsWith("/admin/payments"),
    },
    {
      title: "Sự kiện",
      icon: "ti ti-calendar",
      href: "/admin/events",
      active: pathname.startsWith("/admin/events"),
    },
    {
      title: "Tin tức",
      icon: "ti ti-brand-blogger",
      href: "/admin/news",
      active: pathname.startsWith("/admin/news"),
    },
  ];

  return (
    <div className="sidebar" id="sidebar">
      {/* Start Logo */}
      <div className="sidebar-logo">
        <div>
          {/* Logo Normal */}
          <Link href="/admin" className="logo logo-normal">
            <Image
              src="/styles/images/logo.png"
              alt="Logo"
              width={180}
              height={60}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Logo Small */}
          <Link href="/admin" className="logo-small">
            <Image
              src="/styles/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Logo Dark */}
          <Link href="/admin" className="dark-logo">
            <Image
              src="/styles/images/logo.png"
              alt="Logo"
              width={180}
              height={60}
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
        </div>
        <button
          className="sidenav-toggle-btn btn border-0 p-0 active"
          id="toggle_btn"
        >
          <i className="ti ti-arrow-bar-to-left"></i>
        </button>

        {/* Sidebar Menu Close */}
        <button className="sidebar-close">
          <i className="ti ti-x align-middle"></i>
        </button>
      </div>
      {/* End Logo */}

      {/* Sidenav Menu */}
      <div className="sidebar-inner" data-simplebar>
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li className="menu-title">
              <span>Main Menu</span>
            </li>
            <li>
              <ul>
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={item.active ? "active" : ""}
                    >
                      <i className={item.icon}></i>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
