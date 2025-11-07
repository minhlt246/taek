"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import { clubsApi, ClubOverview } from "@/services/api/clubs";
import { coursesApi, getCourseLevelLabel } from "@/services/api/courses";

export default function CauLacBoPage() {
  const [overview, setOverview] = useState<ClubOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        // Lấy club đầu tiên (có thể thay đổi logic này sau)
        const clubs = await clubsApi.getAll();
        if (clubs.length > 0) {
          const clubOverview = await clubsApi.getOverview(clubs[0].id);
          setOverview(clubOverview);
        } else {
          setError("Không tìm thấy câu lạc bộ nào.");
        }
      } catch (err) {
        console.error("Error loading club overview:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const filteredCourses = selectedBranchId
    ? overview?.courses.filter((course) => course.branch_id === selectedBranchId)
    : overview?.courses;

  if (loading) {
    return (
      <div className="cau-lac-bo-page">
        <PageHeader
          title="Câu lạc bộ"
          description="Thông tin chi tiết về câu lạc bộ Taekwondo"
        />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="cau-lac-bo-page">
        <PageHeader
          title="Câu lạc bộ"
          description="Thông tin chi tiết về câu lạc bộ Taekwondo"
        />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error || "Không tìm thấy thông tin câu lạc bộ."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cau-lac-bo-page">
      <PageHeader
        title={overview.club.name}
        description={overview.club.description || "Thông tin chi tiết về câu lạc bộ Taekwondo"}
      />

      {/* Club Info Section */}
      <section className="club-info-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="club-card">
                <h2 className="club-title">{overview.club.name}</h2>
                {overview.club.description && (
                  <p className="club-description">{overview.club.description}</p>
                )}
                <div className="club-details">
                  {overview.club.address && (
                    <div className="detail-item">
                      <i className="ti ti-map-pin"></i>
                      <span>{overview.club.address}</span>
                    </div>
                  )}
                  {overview.club.phone && (
                    <div className="detail-item">
                      <i className="ti ti-phone"></i>
                      <span>{overview.club.phone}</span>
                    </div>
                  )}
                  {overview.club.email && (
                    <div className="detail-item">
                      <i className="ti ti-mail"></i>
                      <span>{overview.club.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="stats-card">
                <h3 className="stats-title">Thống kê</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{overview.stats.activeBranches}</div>
                    <div className="stat-label">Chi nhánh</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{overview.stats.activeCourses}</div>
                    <div className="stat-label">Lớp học</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section className="branches-section py-5 bg-light">
        <div className="container">
          <h2 className="section-title">Chi nhánh</h2>
          {overview.branches.length > 0 ? (
            <div className="row">
              {overview.branches.map((branch) => (
                <div key={branch.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="branch-card">
                    <h3 className="branch-title">{branch.name}</h3>
                    {branch.address && (
                      <div className="branch-detail">
                        <i className="ti ti-map-pin"></i>
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="branch-detail">
                        <i className="ti ti-phone"></i>
                        <span>{branch.phone}</span>
                      </div>
                    )}
                    <button
                      className={`btn btn-sm mt-3 ${
                        selectedBranchId === branch.id ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() =>
                        setSelectedBranchId(
                          selectedBranchId === branch.id ? null : branch.id
                        )
                      }
                    >
                      {selectedBranchId === branch.id
                        ? "Hiển thị tất cả"
                        : "Xem lớp học"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">Chưa có chi nhánh nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section py-5">
        <div className="container">
          <h2 className="section-title">
            {selectedBranchId
              ? `Lớp học tại ${overview.branches.find((b) => b.id === selectedBranchId)?.name}`
              : "Tất cả lớp học"}
          </h2>
          {filteredCourses && filteredCourses.length > 0 ? (
            <div className="row">
              {filteredCourses.map((course) => (
                <div key={course.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="course-card">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="course-image"
                        onError={(e) => {
                          e.currentTarget.src = "/styles/images/logo.png";
                        }}
                      />
                    ) : (
                      <div className="course-image-placeholder">
                        <i className="ti ti-school"></i>
                      </div>
                    )}
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-description">
                        {course.description || "Khóa học Taekwondo chất lượng cao"}
                      </p>
                      <div className="course-info">
                        {course.branch && (
                          <div className="info-item">
                            <i className="ti ti-map-pin"></i>
                            <span>{course.branch.name}</span>
                          </div>
                        )}
                        {course.coach && (
                          <div className="info-item">
                            <i className="ti ti-user"></i>
                            <span>HLV: {course.coach.name}</span>
                          </div>
                        )}
                        <div className="info-item">
                          <i className="ti ti-users"></i>
                          <span>{course.current_students || 0} học viên</span>
                        </div>
                        {course.level && (
                          <div className="info-item">
                            <i className="ti ti-star"></i>
                            <span>{getCourseLevelLabel(course.level)}</span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/lop-hoc/${course.id}`}
                        className="btn btn-primary course-btn"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">
                {selectedBranchId
                  ? "Chi nhánh này chưa có lớp học nào."
                  : "Chưa có lớp học nào."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

