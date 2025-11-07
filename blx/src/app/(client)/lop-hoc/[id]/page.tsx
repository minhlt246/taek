"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import { coursesApi, getCourseLevelLabel } from "@/services/api/courses";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id ? Number(params.id) : null;

  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError("ID lớp học không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await coursesApi.getDetail(courseId);
        if (detail) {
          setCourseDetail(detail);
        } else {
          setError("Không tìm thấy lớp học.");
        }
      } catch (err) {
        console.error("Error loading course detail:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Đang cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Đang cập nhật";
    }
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <PageHeader title="Chi tiết lớp học" description="" />
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

  if (error || !courseDetail) {
    return (
      <div className="course-detail-page">
        <PageHeader title="Chi tiết lớp học" description="" />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error || "Không tìm thấy lớp học."}
          </div>
          <Link href="/lop-hoc" className="btn btn-primary mt-3">
            Quay lại danh sách lớp học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <PageHeader
        title={courseDetail.title}
        description={courseDetail.description || "Thông tin chi tiết lớp học"}
      />

      <section className="course-detail-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="course-detail-card">
                {courseDetail.image_url ? (
                  <img
                    src={courseDetail.image_url}
                    alt={courseDetail.title}
                    className="course-detail-image"
                    onError={(e) => {
                      e.currentTarget.src = "/styles/images/logo.png";
                    }}
                  />
                ) : (
                  <div className="course-detail-image-placeholder">
                    <i className="ti ti-school"></i>
                  </div>
                )}

                <div className="course-detail-content">
                  <div className="course-detail-header">
                    <div className="course-level-badge">
                      <span className="level-badge">
                        {getCourseLevelLabel(courseDetail.level)}
                      </span>
                    </div>
                    <h2 className="course-detail-title">
                      {courseDetail.title}
                    </h2>
                    {courseDetail.description && (
                      <p className="course-detail-description">
                        {courseDetail.description}
                      </p>
                    )}
                  </div>

                  <div className="course-detail-info">
                    <div className="info-row">
                      <div className="info-col">
                        <div className="info-item">
                          <i className="ti ti-star"></i>
                          <div>
                            <strong>Trình độ:</strong>
                            <span>
                              {getCourseLevelLabel(courseDetail.level)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="info-col">
                        <div className="info-item">
                          <i className="ti ti-users"></i>
                          <div>
                            <strong>Số lượng võ sinh:</strong>
                            <span>
                              {courseDetail.studentCount || 0} học viên
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {courseDetail.branch && (
                      <div className="info-item">
                        <i className="ti ti-map-pin"></i>
                        <div>
                          <strong>Địa điểm:</strong>
                          <span>
                            {courseDetail.branch.name}
                            {courseDetail.branch.address &&
                              ` - ${courseDetail.branch.address}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {courseDetail.coach && (
                      <div className="info-item">
                        <i className="ti ti-user"></i>
                        <div>
                          <strong>Huấn luyện viên phụ trách:</strong>
                          <span>{courseDetail.coach.name}</span>
                          {courseDetail.coach.role && (
                            <span className="badge bg-primary ms-2">
                              {courseDetail.coach.role}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {courseDetail.start_date && (
                      <div className="info-item">
                        <i className="ti ti-calendar"></i>
                        <div>
                          <strong>Ngày bắt đầu:</strong>
                          <span>{formatDate(courseDetail.start_date)}</span>
                        </div>
                      </div>
                    )}

                    {courseDetail.end_date && (
                      <div className="info-item">
                        <i className="ti ti-calendar"></i>
                        <div>
                          <strong>Ngày kết thúc:</strong>
                          <span>{formatDate(courseDetail.end_date)}</span>
                        </div>
                      </div>
                    )}

                    {courseDetail.quarter && courseDetail.year && (
                      <div className="info-item">
                        <i className="ti ti-calendar-event"></i>
                        <div>
                          <strong>Kỳ học:</strong>
                          <span>
                            {courseDetail.quarter} - {courseDetail.year}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {courseDetail.schedules &&
                    courseDetail.schedules.length > 0 && (
                      <div className="schedule-section mt-4">
                        <h3 className="schedule-title">Lịch tập</h3>
                        <div className="schedule-list">
                          {courseDetail.schedules.map(
                            (schedule: any, index: number) => (
                              <div key={index} className="schedule-item">
                                <div className="schedule-day">
                                  {schedule.day_of_week === "monday" && "Thứ 2"}
                                  {schedule.day_of_week === "tuesday" &&
                                    "Thứ 3"}
                                  {schedule.day_of_week === "wednesday" &&
                                    "Thứ 4"}
                                  {schedule.day_of_week === "thursday" &&
                                    "Thứ 5"}
                                  {schedule.day_of_week === "friday" && "Thứ 6"}
                                  {schedule.day_of_week === "saturday" &&
                                    "Thứ 7"}
                                  {schedule.day_of_week === "sunday" &&
                                    "Chủ nhật"}
                                </div>
                                <div className="schedule-time">
                                  {schedule.start_time} - {schedule.end_time}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="course-actions mt-4">
                    <Link href="/register" className="btn btn-primary btn-lg">
                      Đăng ký ngay
                    </Link>
                    <Link
                      href="/lop-hoc"
                      className="btn btn-outline-secondary btn-lg ms-2"
                    >
                      Quay lại danh sách
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="course-sidebar">
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Thông tin nhanh</h3>
                  <div className="sidebar-info">
                    <div className="sidebar-item">
                      <i className="ti ti-users"></i>
                      <div>
                        <div className="sidebar-label">Số lượng võ sinh</div>
                        <div className="sidebar-value">
                          {courseDetail.studentCount || 0} học viên
                        </div>
                      </div>
                    </div>
                    {courseDetail.branch && (
                      <div className="sidebar-item">
                        <i className="ti ti-map-pin"></i>
                        <div>
                          <div className="sidebar-label">Địa điểm</div>
                          <div className="sidebar-value">
                            {courseDetail.branch.name}
                          </div>
                        </div>
                      </div>
                    )}
                    {courseDetail.coach && (
                      <div className="sidebar-item">
                        <i className="ti ti-user"></i>
                        <div>
                          <div className="sidebar-label">HLV phụ trách</div>
                          <div className="sidebar-value">
                            {courseDetail.coach.name}
                          </div>
                        </div>
                      </div>
                    )}
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
