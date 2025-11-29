"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import { coursesApi, getCourseLevelLabel } from "@/services/api/courses";
import { enrollmentsApi } from "@/services/api/enrollments";
import { useAccountStore } from "@/stores/account";
import { useToast } from "@/utils/toast";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params?.id ? Number(params.id) : null;

  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);

  const { loginSuccess, isAuthenticated } = useAccountStore();

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
      } catch (err: any) {
        console.error("Error loading course detail:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại sau.";
        setError(errorMessage);
        
        // If course not found, show specific message
        if (err.response?.status === 404) {
          setError("Không tìm thấy lớp học.");
        }
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (loginSuccess || isAuthenticated) {
        try {
          setIsCheckingEnrollment(true);
          const enrolled = await enrollmentsApi.isEnrolled(courseId);
          setIsEnrolled(enrolled);
        } catch (err) {
          console.error("Error checking enrollment:", err);
        } finally {
          setIsCheckingEnrollment(false);
        }
      } else {
        setIsCheckingEnrollment(false);
      }
    };

    fetchCourseDetail();
    checkEnrollment();
  }, [courseId, loginSuccess, isAuthenticated]);

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

  /**
   * Handle course enrollment
   */
  const handleEnroll = async () => {
    // Check if user is authenticated
    if (!loginSuccess && !isAuthenticated) {
      // Redirect to login with return URL
      const currentPath = `/lop-hoc/${courseId}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!courseId) {
      useToast.error("Không tìm thấy lớp học.");
      return;
    }

    try {
      setIsEnrolling(true);
      await enrollmentsApi.enroll(courseId);
      setIsEnrolled(true);
      useToast.success("Đăng ký lớp học thành công!");
      // Redirect to my courses page
      router.push("/user-center/my-courses");
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể đăng ký lớp học. Vui lòng thử lại sau.";
      useToast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
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
                      e.currentTarget.src = "/client/images/logo.png";
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

                  {(courseDetail.training_time || courseDetail.training_days) && (
                    <div className="schedule-section mt-4">
                      <h3 className="schedule-title">Lịch tập</h3>
                      <div className="schedule-info">
                        {courseDetail.training_days && (
                          <div className="info-item">
                            <i className="ti ti-calendar me-2"></i>
                            <strong>Buổi tập:</strong>
                            <span>{courseDetail.training_days}</span>
                          </div>
                        )}
                        {courseDetail.training_time && (
                          <div className="info-item">
                            <i className="ti ti-clock me-2"></i>
                            <strong>Giờ tập:</strong>
                            <span>{courseDetail.training_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="course-actions mt-4">
                    {isCheckingEnrollment ? (
                      <button
                        className="btn btn-primary btn-lg"
                        disabled
                      >
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang kiểm tra...
                      </button>
                    ) : isEnrolled ? (
                      <>
                        <Link
                          href="/user-center/my-courses"
                          className="btn btn-success btn-lg"
                        >
                          <i className="ti ti-check me-2"></i>
                          Đã đăng ký - Xem lớp của tôi
                        </Link>
                        <Link
                          href="/lop-hoc"
                          className="btn btn-outline-secondary btn-lg ms-2"
                        >
                          Quay lại danh sách
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleEnroll}
                          className="btn btn-primary btn-lg"
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Đang đăng ký...
                            </>
                          ) : (
                            <>
                              <i className="ti ti-user-plus me-2"></i>
                              Đăng ký lớp học
                            </>
                          )}
                        </button>
                        <Link
                          href="/lop-hoc"
                          className="btn btn-outline-secondary btn-lg ms-2"
                        >
                          Quay lại danh sách
                        </Link>
                      </>
                    )}
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
