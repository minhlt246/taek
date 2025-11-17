"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import { coachesApi, Coach } from "@/services/api/coaches";
import { COACH_STANDARDS } from "@/constants/coach-standards";

export default function HuanLuyenVienPage() {
  const [headCoach, setHeadCoach] = useState<Coach | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch coaches data from API
   */
  useEffect(() => {
    const fetchCoachesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch head coach and all coaches in parallel
        const [headCoachData, coachesData] = await Promise.all([
          coachesApi.getHeadCoach(),
          coachesApi.getAll(),
        ]);


        setHeadCoach(headCoachData);

        // Filter out head coach from coaches list if exists
        const filteredCoaches = headCoachData
          ? coachesData.filter((coach) => coach.id !== headCoachData.id)
          : coachesData;

        setCoaches(filteredCoaches);
      } catch (err) {
        console.error("Error loading coaches data:", err);
        setError(
          "Không thể tải dữ liệu huấn luyện viên. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCoachesData();
  }, []);

  if (loading) {
    return (
      <div className="huan-luyen-vien-page">
        <PageHeader
          label="ĐỘI NGŨ"
          title="Huấn Luyện Viên"
          description="Đội ngũ huấn luyện viên giàu kinh nghiệm, tận tâm và chuyên nghiệp"
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
      <div className="huan-luyen-vien-page">
        <PageHeader
          label="ĐỘI NGŨ"
          title="Huấn Luyện Viên"
          description="Đội ngũ huấn luyện viên giàu kinh nghiệm, tận tâm và chuyên nghiệp"
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
    <div className="huan-luyen-vien-page">
      {/* Page Header */}
      <PageHeader
        label="ĐỘI NGŨ"
        title="Huấn Luyện Viên"
        description="Đội ngũ huấn luyện viên giàu kinh nghiệm, tận tâm và chuyên nghiệp"
      />

      {/* Head Coach Section */}
      {headCoach && (
        <section className="head-coach-section my-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-4 mb-lg-0">
                <div className="head-coach-photo">
                  <img
                    src={headCoach.image || "/client/images/users/user-40.jpg"}
                    alt={headCoach.name}
                    className="head-coach-image"
                    onError={(e) => {
                      // Fallback về ảnh mặc định nếu ảnh không load được
                      e.currentTarget.src = "/client/images/users/user-40.jpg";
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <h2 className="head-coach-name">{headCoach.name}</h2>
                <p className="head-coach-title">{headCoach.title}</p>
                <div className="head-coach-credentials">
                  {headCoach.belt && (
                    <div className="credential-item">
                      <i className="ti ti-award"></i>
                      <span>{headCoach.belt}</span>
                    </div>
                  )}
                  {headCoach.experience && (
                    <div className="credential-item">
                      <i className="ti ti-calendar"></i>
                      <span>{headCoach.experience}</span>
                    </div>
                  )}
                </div>
                {headCoach.bio && (
                  <p className="head-coach-bio">{headCoach.bio}</p>
                )}
                {headCoach.achievements &&
                  headCoach.achievements.length > 0 && (
                    <div className="head-coach-achievements">
                      <h4 className="achievement-title">Thành tích nổi bật:</h4>
                      <ul className="achievements-list">
                        {headCoach.achievements.map((achievement, index) => (
                          <li key={index} className="achievement-item">
                            <i className="ti ti-star"></i>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coaches Grid Section */}
      <section className="coaches-grid-section my-5 ">
        <div className="container">
          <div className="section-header text-center my-5 ">
            <div className="section-label">ĐỘI NGŨ</div>
            <h2 className="section-title mb-0">Huấn Luyện Viên</h2>
            <p className="section-description">
              Đội ngũ huấn luyện viên giàu kinh nghiệm, tận tâm và chuyên nghiệp
            </p>
          </div>
          <div className="row">
            {coaches.length > 0 ? (
              coaches.map((coach) => {
                return (
                  <div key={coach.id} className="col-lg-3 col-md-6 mb-4">
                    <div className="coach-card-grid border border-2 rounded p-2">
                      <div className="coach-image-placeholder">
                        <img
                          src={coach.image || "/client/images/users/user-40.jpg"}
                          alt={coach.name}
                          className="coach-image"
                          onError={(e) => {
                            // Fallback về ảnh mặc định nếu ảnh không load được
                            e.currentTarget.src = "/client/images/users/user-40.jpg";
                          }}
                        />
                      </div>
                      <div className="coach-info-grid p-2 border-top">
                        <h3 className="coach-name">{coach.name}</h3>
                        <p className="coach-title">{coach.title}</p>
                        <div className="coach-credentials">
                          {coach.belt && (
                            <div className="credential-item">
                              <i className="ti ti-award"></i>
                              <span>{coach.belt}</span>
                            </div>
                          )}
                          {coach.experience && (
                            <div className="credential-item">
                              <i className="ti ti-calendar"></i>
                              <span>{coach.experience}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <p className="text-muted">Chưa có dữ liệu huấn luyện viên.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Standards Section */}
      <section className="standards-section my-5">
        <div className="container">
          <h2 className="section-title">Tiêu Chuẩn Huấn Luyện Viên</h2>
          <p className="section-subtitle">
            Tất cả HLV của chúng tôi đều đáp ứng các tiêu chuẩn cao nhất
          </p>
          <div className="row">
            {COACH_STANDARDS.map((standard, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="standard-card">
                  <div className="standard-icon">
                    <i className={standard.icon}></i>
                  </div>
                  <h4 className="standard-title">{standard.title}</h4>
                  <p className="standard-description">{standard.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Team CTA Section */}
      <section className="meet-team-section mb-5">
        <div className="container">
          <div className="meet-team-card">
            <h3 className="meet-team-title">Gặp Gỡ Đội Ngũ Của Chúng Tôi</h3>
            <p className="meet-team-description">
              Đến thăm câu lạc bộ để gặp trực tiếp các HLV và tìm hiểu thêm về
              phương pháp đào tạo
            </p>
            <Link href="/lien-he" className="btn btn-primary btn-schedule">
              Đặt lịch tham quan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
