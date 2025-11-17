"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import {
  coursesApi,
  Course,
  getCourseLevelLabel,
} from "@/services/api/courses";
import { pageContentApi } from "@/services/api/page-content";
import { Benefit } from "@/constants/benefits";
import { TrainingProgram } from "@/constants/training-programs";
import { FAQ } from "@/constants/faqs";
import { useClubs } from "@/hooks/useClubs";
import { coachesApi, Coach } from "@/services/api/coaches";
import {
  schedulesApi,
  ScheduleGroup,
  ScheduleResponse,
} from "@/services/api/schedules";
import http from "@/services/http";

export default function LopHocPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coaches, setCoaches] = useState<Map<number, Coach>>(new Map());
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>(
    []
  );
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { overview: clubsOverview, loading: clubsLoading } = useClubs();
  const [allSchedules, setAllSchedules] = useState<ScheduleGroup[]>([]);
  const [rawSchedules, setRawSchedules] = useState<ScheduleResponse[]>([]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  /**
   * Fetch all page data from API
   */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          coursesData,
          coachesData,
          benefitsData,
          trainingProgramsData,
          faqsData,
          schedulesData,
        ] = await Promise.all([
          coursesApi.getAll(),
          coachesApi.getAll(),
          pageContentApi.getBenefits(),
          pageContentApi.getTrainingPrograms(),
          pageContentApi.getFAQs(),
          schedulesApi.getAll(),
        ]);

        // Fetch raw schedules để có branch_id
        try {
          const rawSchedulesResponse = await http.get<
            ScheduleResponse[] | { data: ScheduleResponse[] }
          >("/schedules");
          let rawSchedulesData: ScheduleResponse[] = [];
          if (Array.isArray(rawSchedulesResponse.data)) {
            rawSchedulesData = rawSchedulesResponse.data;
          } else {
            rawSchedulesData =
              (rawSchedulesResponse.data as { data: ScheduleResponse[] })
                ?.data || [];
          }
          setRawSchedules(rawSchedulesData);
        } catch (err) {
          console.error("Error loading raw schedules:", err);
          setRawSchedules([]);
        }

        // Create a map of coaches by ID for quick lookup
        const coachesMap = new Map<number, Coach>();
        coachesData.forEach((coach) => {
          coachesMap.set(coach.id, coach);
        });

        setCourses(coursesData);
        setCoaches(coachesMap);
        setBenefits(benefitsData);
        setTrainingPrograms(trainingProgramsData);
        setFaqs(faqsData);
        setAllSchedules(schedulesData);
      } catch (err) {
        console.error("Error loading page data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  /**
   * Get course features based on level
   */
  const getCourseFeatures = (level?: string): string[] => {
    switch (level) {
      case "beginner":
        return [
          "Kỹ thuật cơ bản",
          "Tư thế và động tác",
          "Lý thuyết võ đạo",
          "Rèn luyện thể lực",
        ];
      case "intermediate":
        return [
          "Kỹ thuật nâng cao",
          "Đòn thế phức tạp",
          "Tự vệ thực tế",
          "Thi đấu căn bản",
        ];
      case "advanced":
        return [
          "Kỹ thuật chuyên sâu",
          "Thi đấu chuyên nghiệp",
          "Chiến thuật",
          "Tâm lý thi đấu",
        ];
      default:
        return [
          "Kỹ thuật cơ bản",
          "Tư thế và động tác",
          "Lý thuyết võ đạo",
          "Rèn luyện thể lực",
        ];
    }
  };

  /**
   * Format date range for course
   */
  const formatCourseDuration = (
    startDate?: string,
    endDate?: string
  ): string => {
    if (!startDate || !endDate) return "Đang cập nhật";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return `${diffMonths} tháng`;
    } catch {
      return "Đang cập nhật";
    }
  };

  /**
   * Get day name in Vietnamese
   */
  const getDayName = (dayOfWeek: string): string => {
    const dayMap: Record<string, string> = {
      Monday: "Thứ 2",
      Tuesday: "Thứ 3",
      Wednesday: "Thứ 4",
      Thursday: "Thứ 5",
      Friday: "Thứ 6",
      Saturday: "Thứ 7",
      Sunday: "Chủ nhật",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  /**
   * Format time from "HH:mm:ss" or "HH:mm" to "HH:mm"
   */
  const formatTime = (time?: string): string => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  /**
   * Format time range
   */
  const formatTimeRange = (startTime?: string, endTime?: string): string => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    if (!start && !end) return "";
    if (!start) return end;
    if (!end) return start;
    return `${start} - ${end}`;
  };

  /**
   * Get schedules for a specific branch
   */
  const getSchedulesForBranch = (
    branchId?: number,
    clubId?: number
  ): ScheduleResponse[] => {
    if (!branchId && !clubId) return [];
    return rawSchedules.filter((schedule) => {
      if (branchId) {
        return schedule.branch_id === branchId;
      }
      if (clubId) {
        return schedule.club_id === clubId && !schedule.branch_id;
      }
      return false;
    });
  };

  /**
   * Group schedules by day for a branch
   */
  const getBranchSchedulesGrouped = (
    branchId?: number,
    clubId?: number
  ): Array<{ day: string; schedules: ScheduleResponse[] }> => {
    const branchSchedules = getSchedulesForBranch(branchId, clubId);
    const grouped: Record<string, ScheduleResponse[]> = {};

    branchSchedules.forEach((schedule) => {
      const dayName = getDayName(schedule.day_of_week);
      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }
      grouped[dayName].push(schedule);
    });

    // Sort by day order
    const dayOrder = [
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
      "Chủ nhật",
    ];
    return dayOrder
      .filter((day) => grouped[day])
      .map((day) => ({
        day,
        schedules: grouped[day].sort((a, b) => {
          const timeA = formatTime(a.start_time) || "00:00";
          const timeB = formatTime(b.start_time) || "00:00";
          return timeA.localeCompare(timeB);
        }),
      }));
  };

  if (loading) {
    return (
      <div className="lop-hoc-page">
        <PageHeader
          title="Lớp học"
          description="Chương trình đào tạo đa dạng phù hợp với mọi lứa tuổi và trình độ"
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

  if (error) {
    return (
      <div className="lop-hoc-page">
        <PageHeader
          title="Lớp học"
          description="Chương trình đào tạo đa dạng phù hợp với mọi lứa tuổi và trình độ"
        />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lop-hoc-page">
      {/* Page Header */}
      <PageHeader
        title="Lớp học"
        description="Chương trình đào tạo đa dạng phù hợp với mọi lứa tuổi và trình độ"
      />

      {/* Intro Section */}
      <section className="intro-section">
        <div className="container">
          <div className="section-title">
            <h2 className="intro-section-title">Chương trình đào tạo</h2>
            <p className="intro-section-description">
              Chúng tôi cung cấp các lớp học từ cơ bản đến nâng cao, phù hợp với
              mọi lứa tuổi và trình độ
            </p>
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="training-programs-section">
        <div className="container">
          <h3 className="section-subtitle">Chương trình đào tạo</h3>
          <div className="row">
            {trainingPrograms.map((program, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="program-card">
                  <div className="program-icon">
                    <i className="ti ti-check"></i>
                  </div>
                  <h4 className="program-title">{program.title}</h4>
                  <p className="program-description">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h3 className="section-subtitle">Lợi ích khi tham gia</h3>
          <div className="row">
            {benefits.map((benefit, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className={benefit.icon}></i>
                  </div>
                  <h4 className="benefit-title">{benefit.title}</h4>
                  <p className="benefit-description">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <div className="container">
          <h3 className="section-subtitle">Các lớp học</h3>
          {courses.length > 0 ? (
            <div className="row">
              {courses.map((course) => (
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
                      <div className="course-level">
                        <span className="level-badge">
                          {getCourseLevelLabel(course.level)}
                        </span>
                      </div>
                      <h3 className="course-title">{course.title}</h3>
                      {course.description && (
                        <p className="course-description">
                          {course.description.length > 100
                            ? `${course.description.substring(0, 100)}...`
                            : course.description}
                        </p>
                      )}
                      <div className="course-info">
                        {course.coach_id && coaches.has(course.coach_id) && (
                          <div className="info-item">
                            <i className="ti ti-user"></i>
                            <span>
                              HLV: {coaches.get(course.coach_id)?.name}
                            </span>
                          </div>
                        )}
                        {course.branch && (
                          <div className="info-item">
                            <i className="ti ti-map-pin"></i>
                            <span>{course.branch.name}</span>
                          </div>
                        )}
                        <div className="info-item">
                          <i className="ti ti-users"></i>
                          <span>{course.current_students || 0} học viên</span>
                        </div>
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
              <p className="text-muted">Chưa có lớp học nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* Branches Section */}
      {!clubsLoading && clubsOverview && (
        <section className="branches-section">
          <div className="container">
            <h3 className="section-subtitle">Cơ sở và chi nhánh</h3>

            {/* Cơ sở chính - Full width */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="branch-card main-branch">
                  <div className="branch-header">
                    <div className="branch-title-wrapper">
                      <i className="ti ti-building"></i>
                      <h4 className="branch-title">
                        {clubsOverview.club.name}
                      </h4>
                    </div>
                    <span className="badge bg-primary">Cơ sở chính</span>
                  </div>
                  <div className="branch-body">
                    {clubsOverview.club.description && (
                      <p className="branch-description">
                        {clubsOverview.club.description}
                      </p>
                    )}
                    <div className="branch-details">
                      {clubsOverview.club.address && (
                        <div className="branch-detail-item">
                          <i className="ti ti-map-pin"></i>
                          <span>{clubsOverview.club.address}</span>
                        </div>
                      )}
                      {clubsOverview.club.phone && (
                        <div className="branch-detail-item">
                          <i className="ti ti-phone"></i>
                          <span>{clubsOverview.club.phone}</span>
                        </div>
                      )}
                      {clubsOverview.club.email && (
                        <div className="branch-detail-item">
                          <i className="ti ti-mail"></i>
                          <span>{clubsOverview.club.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="branch-stats">
                      <div className="stat-item">
                        <span className="stat-value">
                          {clubsOverview.stats.activeBranches}
                        </span>
                        <span className="stat-label">Chi nhánh</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">
                          {clubsOverview.stats.activeCourses}
                        </span>
                        <span className="stat-label">Lớp học</span>
                      </div>
                    </div>

                    {/* Lịch tập cho cơ sở chính */}
                    {(() => {
                      const clubSchedules = getBranchSchedulesGrouped(
                        undefined,
                        clubsOverview.club.id
                      );
                      return clubSchedules.length > 0 ? (
                        <div className="branch-schedule mt-4">
                          <h5 className="mb-3">
                            <i className="ti ti-calendar me-2"></i>
                            Lịch tập
                          </h5>
                          <div className="schedule-list">
                            {clubSchedules.map((dayGroup, idx) => (
                              <div key={idx} className="schedule-day-group mb-3">
                                <div className="schedule-day-title fw-bold mb-2">
                                  {dayGroup.day}
                                </div>
                                <div className="schedule-items">
                                  {dayGroup.schedules.map((schedule, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="schedule-item d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded"
                                    >
                                      <div className="schedule-time fw-semibold">
                                        {formatTimeRange(
                                          schedule.start_time,
                                          schedule.end_time
                                        )}
                                      </div>
                                      <div className="schedule-location text-muted small">
                                        {schedule.location ||
                                          schedule.branch?.name ||
                                          ""}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Các chi nhánh - Grid */}
            {clubsOverview.branches.length > 0 && (
              <div className="row">
                {clubsOverview.branches.map((branch) => (
                  <div key={branch.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="branch-card">
                      <div className="branch-header">
                        <div className="branch-title-wrapper">
                          <i className="ti ti-building-community"></i>
                          <h4 className="branch-title">{branch.name}</h4>
                        </div>
                        {branch.is_active ? (
                          <span className="badge bg-success">Hoạt động</span>
                        ) : (
                          <span className="badge bg-secondary">Tạm ngưng</span>
                        )}
                      </div>
                      <div className="branch-body">
                        <div className="branch-details">
                          {branch.address && (
                            <div className="branch-detail-item">
                              <i className="ti ti-map-pin"></i>
                              <span>{branch.address}</span>
                            </div>
                          )}
                          {branch.phone && (
                            <div className="branch-detail-item">
                              <i className="ti ti-phone"></i>
                              <span>{branch.phone}</span>
                            </div>
                          )}
                          {branch.email && (
                            <div className="branch-detail-item">
                              <i className="ti ti-mail"></i>
                              <span>{branch.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Lịch tập cho chi nhánh */}
                        {(() => {
                          const branchSchedules = getBranchSchedulesGrouped(
                            branch.id,
                            undefined
                          );
                          return branchSchedules.length > 0 ? (
                            <div className="branch-schedule mt-3">
                              <h6 className="mb-2">
                                <i className="ti ti-calendar me-2"></i>
                                Lịch tập
                              </h6>
                              <div className="schedule-list">
                                {branchSchedules.map((dayGroup, idx) => (
                                  <div
                                    key={idx}
                                    className="schedule-day-group mb-2"
                                  >
                                    <div className="schedule-day-title fw-bold small mb-1">
                                      {dayGroup.day}
                                    </div>
                                    <div className="schedule-items">
                                      {dayGroup.schedules.map(
                                        (schedule, sIdx) => (
                                          <div
                                            key={sIdx}
                                            className="schedule-item d-flex justify-content-between align-items-center p-1 mb-1 bg-light rounded small"
                                          >
                                            <span className="schedule-time fw-semibold">
                                              {formatTimeRange(
                                                schedule.start_time,
                                                schedule.end_time
                                              )}
                                            </span>
                                            {schedule.location && (
                                              <span className="schedule-location text-muted">
                                                {schedule.location}
                                              </span>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}

                        <Link
                          href={`/cau-lac-bo?branch=${branch.id}`}
                          className="btn btn-outline-primary btn-sm mt-3 w-100"
                        >
                          Xem lớp học tại đây
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
