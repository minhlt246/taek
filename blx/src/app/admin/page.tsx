"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface DashboardStats {
  totalUsers: number;
  totalCoaches: number;
  totalClubs: number;
  totalBranches: number;
  totalCourses: number;
  totalPayments: number;
  monthlyRevenue: number;
  activeStudents: number;
}

export default function AdminDashboard() {
  const { account } = useAccountStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCoaches: 0,
    totalClubs: 0,
    totalBranches: 0,
    totalCourses: 0,
    totalPayments: 0,
    monthlyRevenue: 0,
    activeStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard statistics
    const fetchStats = async () => {
      setLoading(true);
      // TODO: Replace with actual API calls
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          totalCoaches: 12,
          totalClubs: 3,
          totalBranches: 8,
          totalCourses: 24,
          totalPayments: 89,
          monthlyRevenue: 12500000,
          activeStudents: 142,
        });
        setLoading(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "fas fa-users",
      color: "primary",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      icon: "fas fa-user-graduate",
      color: "success",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Coaches",
      value: stats.totalCoaches,
      icon: "fas fa-user-tie",
      color: "info",
      change: "+2",
      changeType: "positive",
    },
    {
      title: "Clubs",
      value: stats.totalClubs,
      icon: "fas fa-building",
      color: "warning",
      change: "0",
      changeType: "neutral",
    },
    {
      title: "Branches",
      value: stats.totalBranches,
      icon: "fas fa-map-marker-alt",
      color: "secondary",
      change: "+1",
      changeType: "positive",
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: "fas fa-book",
      color: "dark",
      change: "+3",
      changeType: "positive",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: "fas fa-chart-line",
      color: "success",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Total Payments",
      value: stats.totalPayments,
      icon: "fas fa-credit-card",
      color: "primary",
      change: "+23",
      changeType: "positive",
    },
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p>
          Welcome back, {account?.name || "Admin"}! Here's what's happening with
          your Taekwondo club management system.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        {statCards.map((card, index) => (
          <div key={index} className="col-xl-3 col-md-6 mb-4">
            <div className={`card border-left-${card.color} shadow h-100 py-2`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div
                      className={`text-xs font-weight-bold text-${card.color} text-uppercase mb-1`}
                    >
                      {card.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {card.value}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className={`${card.icon} fa-2x text-gray-300`}></i>
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-${
                      card.changeType === "positive"
                        ? "success"
                        : card.changeType === "negative"
                        ? "danger"
                        : "muted"
                    } text-xs`}
                  >
                    <i
                      className={`fas fa-arrow-${
                        card.changeType === "positive"
                          ? "up"
                          : card.changeType === "negative"
                          ? "down"
                          : "right"
                      } mr-1`}
                    ></i>
                    {card.change}
                  </span>
                  <span className="text-muted text-xs ml-2">
                    from last month
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-grid">
                    <button
                      className="btn btn-primary"
                      onClick={() => (window.location.href = "/admin/users")}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add New Student
                    </button>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-grid">
                    <button
                      className="btn btn-success"
                      onClick={() => (window.location.href = "/admin/coaches")}
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Add New Coach
                    </button>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-grid">
                    <button
                      className="btn btn-info"
                      onClick={() => (window.location.href = "/admin/events")}
                    >
                      <i className="fas fa-calendar-plus mr-2"></i>
                      Create Event
                    </button>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-grid">
                    <button
                      className="btn btn-warning"
                      onClick={() => (window.location.href = "/admin/news")}
                    >
                      <i className="fas fa-newspaper mr-2"></i>
                      Publish News
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                Recent Activities
              </h6>
            </div>
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon bg-primary">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">New student registered</p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-success">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">Payment received</p>
                    <small className="text-muted">4 hours ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-info">
                    <i className="fas fa-calendar"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">New event scheduled</p>
                    <small className="text-muted">6 hours ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon bg-warning">
                    <i className="fas fa-medal"></i>
                  </div>
                  <div className="activity-content">
                    <p className="mb-1">Belt promotion completed</p>
                    <small className="text-muted">1 day ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
