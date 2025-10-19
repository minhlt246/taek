"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      icon: "fas fa-tachometer-alt",
      href: "/admin",
      active: pathname === "/admin"
    },
    {
      title: "Users",
      icon: "fas fa-users",
      href: "/admin/users",
      active: pathname.startsWith("/admin/users")
    },
    {
      title: "Coaches",
      icon: "fas fa-user-tie",
      href: "/admin/coaches",
      active: pathname.startsWith("/admin/coaches")
    },
    {
      title: "Clubs",
      icon: "fas fa-building",
      href: "/admin/clubs",
      active: pathname.startsWith("/admin/clubs")
    },
    {
      title: "Branches",
      icon: "fas fa-map-marker-alt",
      href: "/admin/branches",
      active: pathname.startsWith("/admin/branches")
    },
    {
      title: "Courses",
      icon: "fas fa-book",
      href: "/admin/courses",
      active: pathname.startsWith("/admin/courses")
    },
    {
      title: "Belt Levels",
      icon: "fas fa-medal",
      href: "/admin/belt-levels",
      active: pathname.startsWith("/admin/belt-levels")
    },
    {
      title: "Payments",
      icon: "fas fa-credit-card",
      href: "/admin/payments",
      active: pathname.startsWith("/admin/payments")
    },
    {
      title: "Events",
      icon: "fas fa-calendar",
      href: "/admin/events",
      active: pathname.startsWith("/admin/events")
    },
    {
      title: "News",
      icon: "fas fa-newspaper",
      href: "/admin/news",
      active: pathname.startsWith("/admin/news")
    }
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="fas fa-shield-alt"></i>
          {!isCollapsed && <span>Admin Panel</span>}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link 
                href={item.href}
                className={`nav-link ${item.active ? 'active' : ''}`}
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
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
