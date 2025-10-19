"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Tổng quan",
      icon: "fas fa-tachometer-alt",
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      title: "Võ sinh",
      icon: "fas fa-users",
      href: "/admin/users",
      active: pathname.startsWith("/admin/users"),
    },
    {
      title: "Huấn luyện viên",
      icon: "fas fa-user-tie",
      href: "/admin/coaches",
      active: pathname.startsWith("/admin/coaches"),
    },
    {
      title: "Câu lạc bộ",
      icon: "fas fa-building",
      href: "/admin/clubs",
      active: pathname.startsWith("/admin/clubs"),
    },
    {
      title: "Khóa học",
      icon: "fas fa-book",
      href: "/admin/courses",
      active: pathname.startsWith("/admin/courses"),
    },
    {
      title: "Cấp đai",
      icon: "fas fa-medal",
      href: "/admin/belt-levels",
      active: pathname.startsWith("/admin/belt-levels"),
    },
    {
      title: "Thanh toán",
      icon: "fas fa-credit-card",
      href: "/admin/payments",
      active: pathname.startsWith("/admin/payments"),
    },
    {
      title: "Sự kiện",
      icon: "fas fa-calendar",
      href: "/admin/events",
      active: pathname.startsWith("/admin/events"),
    },
    {
      title: "Tin tức",
      icon: "fas fa-newspaper",
      href: "/admin/news",
      active: pathname.startsWith("/admin/news"),
    },
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-shield-alt"></i>
          {!isCollapsed && <span>Bảng điều khiển</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i
            className={`fas ${
              isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            }`}
          ></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link ${item.active ? "active" : ""}`}
              >
                <i className={item.icon}></i>
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <i className="fas fa-user-circle"></i>
          {!isCollapsed && (
            <div className="user-details">
              <span className="user-name">Quản trị viên</span>
              <span className="user-role">Quản trị viên</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
