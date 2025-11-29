"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/crm/PageHeader";
import "@/styles/scss/lich-tap.scss";
import { schedulesApi, ScheduleGroup } from "@/services/api/schedules";

export default function LichTapPage() {
  const [schedule, setSchedule] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch schedules data from API
   */
  useEffect(() => {
    const fetchSchedulesData = async () => {
      try {
        setLoading(true);
        setError(null);

        const schedulesData = await schedulesApi.getAll();

        console.log("[LichTapPage] Schedules data:", schedulesData);
        setSchedule(schedulesData);
      } catch (err) {
        console.error("Error loading schedules data:", err);
        setError("Không thể tải dữ liệu lịch tập. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedulesData();
  }, []);

  if (loading) {
    return (
      <div className="lich-tap-page">
        <PageHeader
          title="Lịch tập"
          description="Thời gian biểu và địa điểm tập luyện"
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
      <div className="lich-tap-page">
        <PageHeader
          title="Lịch tập"
          description="Thời gian biểu và địa điểm tập luyện"
        />
        <div className="container py-5">
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lich-tap-page">
      {/* Page Header */}
      <PageHeader
        title="Lịch tập"
        description="Thời gian biểu và địa điểm tập luyện"
      />

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="container">
          {schedule.length > 0 ? (
            <>
              <div className="row">
                {schedule.map((scheduleItem, index) => (
                  <div key={index} className="col-lg-6 mb-4">
                    <div className="schedule-card">
                      <div className="schedule-header">
                        <div>
                          <div className="day-name">{scheduleItem.day}</div>
                          <div className="day-date">{scheduleItem.date}</div>
                        </div>
                      </div>
                      <div className="schedule-items">
                        {scheduleItem.classes.map((classItem, classIndex) => (
                          <div key={classIndex} className="schedule-item">
                            <div className="time">{classItem.time}</div>
                            <div className="class-info">
                              <div className="class-name">{classItem.name}</div>
                              <div className="class-level">
                                {classItem.level}
                              </div>
                            </div>
                            <div className="instructor">
                              {classItem.instructor}
                            </div>
                            {classItem.location && (
                              <div className="class-location text-muted small mt-1">
                                <i className="ti ti-map-pin"></i>{" "}
                                {classItem.location}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location Card */}
              <div className="row">
                <div className="col-lg-8 mx-auto">
                  <div className="location-card">
                    <h3 className="location-title">Địa điểm tập luyện</h3>
                    <div className="location-info">
                      <i className="ti ti-map-pin"></i>
                      <span>
                        Vui lòng liên hệ để biết thêm thông tin về địa điểm cụ
                        thể
                      </span>
                    </div>
                    <div className="location-info">
                      <i className="ti ti-phone"></i>
                      <span>Hotline: Liên hệ để biết số điện thoại</span>
                    </div>
                    <div className="location-info">
                      <i className="ti ti-clock"></i>
                      <span>Giờ làm việc: Theo lịch tập bên trên</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="text-center py-5">
                  <p className="text-muted">
                    Chưa có lịch tập nào được cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
