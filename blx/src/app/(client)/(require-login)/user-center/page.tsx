"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAccountStore } from "@/stores/account";
import { enrollmentsApi } from "@/services/api/enrollments";

export default function UserCenterPage() {
  useRequireAuth();
  const { user, account } = useAccountStore();
  const [myEnrollmentsCount, setMyEnrollmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEnrollmentsCount();
  }, []);

  const fetchMyEnrollmentsCount = async () => {
    try {
      const enrollments = await enrollmentsApi.getMyEnrollments();
      setMyEnrollmentsCount(enrollments.length);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = account || user;

  return (
    <div className="user-center-page">
      <PageHeader
        title="Trang chủ cá nhân"
        description={`Xin chào, ${currentUser?.name || currentUser?.email || "Thành viên"}!`}
      />

      <section className="user-dashboard-section py-5">
        <div className="container">
          {/* Welcome Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h2 className="card-title">
                    Xin chào, {currentUser?.name || currentUser?.email || "Thành viên"}!
                  </h2>
                  <p className="card-text">
                    Chào mừng bạn đến với trang quản lý cá nhân. Tại đây bạn có thể xem
                    thông tin lớp học, lịch tập, và nhiều hơn nữa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="stat-icon mb-3">
                    <i className="ti ti-school" style={{ fontSize: "48px", color: "#0d6efd" }}></i>
                  </div>
                  <h3 className="stat-number">{loading ? "..." : myEnrollmentsCount}</h3>
                  <p className="stat-label">Lớp học đã đăng ký</p>
                  <Link href="/user-center/my-courses" className="btn btn-outline-primary btn-sm">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="stat-icon mb-3">
                    <i className="ti ti-calendar" style={{ fontSize: "48px", color: "#198754" }}></i>
                  </div>
                  <h3 className="stat-number">-</h3>
                  <p className="stat-label">Lịch tập tuần này</p>
                  <Link href="/user-center/my-schedule" className="btn btn-outline-success btn-sm">
                    Xem lịch
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body text-center">
                  <div className="stat-icon mb-3">
                    <i className="ti ti-check" style={{ fontSize: "48px", color: "#ffc107" }}></i>
                  </div>
                  <h3 className="stat-number">-</h3>
                  <p className="stat-label">Buổi tập đã tham gia</p>
                  <Link href="/user-center/attendance" className="btn btn-outline-warning btn-sm">
                    Xem thống kê
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Thao tác nhanh</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-sm-6 mb-3">
                      <Link
                        href="/lop-hoc"
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-school me-2"></i>
                        Xem lớp học
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <Link
                        href="/user-center/my-courses"
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-list me-2"></i>
                        Lớp của tôi
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <Link
                        href="/user-center/my-schedule"
                        className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-calendar me-2"></i>
                        Lịch tập
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                      <Link
                        href="/user-center/profile"
                        className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-user me-2"></i>
                        Tài khoản
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

