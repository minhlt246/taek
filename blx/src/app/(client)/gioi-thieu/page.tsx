"use client";

import React from "react";
import PageHeader from "@/components/ui/crm/PageHeader";
import "@/styles/scss/gioi-thieu.scss";

export default function GioiThieuPage() {
  return (
    <div className="gioi-thieu-page">
      <PageHeader
        title="Về chúng tôi"
        description="Xây dựng tương lai tươi sáng với Taekwondo"
      />

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="about-content">
                <h2 className="about-section-title mb-4">Lịch sử câu lạc bộ</h2>
                <p className="about-text">
                  Câu lạc bộ Taekwondo của chúng tôi được thành lập vào năm 2010
                  với sứ mệnh đào tạo và phát triển võ thuật Taekwondo cho mọi
                  lứa tuổi. Với hơn 10 năm kinh nghiệm, chúng tôi đã đào tạo
                  hàng nghìn học viên từ cơ bản đến chuyên nghiệp.
                </p>
                <p className="about-text">
                  Chúng tôi tự hào có đội ngũ huấn luyện viên giàu kinh nghiệm,
                  được đào tạo bài bản và có chứng chỉ quốc tế. Phương pháp
                  giảng dạy hiện đại, kết hợp giữa lý thuyết và thực hành, giúp
                  học viên phát triển toàn diện cả về thể chất và tinh thần.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image">
                <img
                  src="/client/images/blogs/blog-1.jpg"
                  alt="Câu lạc bộ Taekwondo"
                  onError={(e) => {
                    e.currentTarget.src = "/client/images/logo.png";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="achievement-card">
                <div className="achievement-icon">
                  <i className="ti ti-users"></i>
                </div>
                <div className="achievement-number">1000+</div>
                <div className="achievement-label">Học viên</div>
              </div>
            </div>
            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="achievement-card">
                <div className="achievement-icon">
                  <i className="ti ti-award"></i>
                </div>
                <div className="achievement-number">50+</div>
                <div className="achievement-label">Giải thưởng</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="achievement-card">
                <div className="achievement-icon">
                  <i className="ti ti-calendar"></i>
                </div>
                <div className="achievement-number">10+</div>
                <div className="achievement-label">Năm kinh nghiệm</div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="achievement-card">
                <div className="achievement-icon">
                  <i className="ti ti-trophy"></i>
                </div>
                <div className="achievement-number">200+</div>
                <div className="achievement-label">Huy chương</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="mission-card">
                <h3 className="mission-title">Sứ mệnh</h3>
                <p className="mission-description">
                  Chúng tôi cam kết cung cấp chương trình đào tạo Taekwondo chất
                  lượng cao, giúp học viên phát triển toàn diện về thể chất,
                  tinh thần và kỹ năng tự vệ. Chúng tôi tin rằng Taekwondo không
                  chỉ là môn võ thuật mà còn là cách sống, giúp rèn luyện tính
                  kỷ luật, sự tự tin và tinh thần võ đạo.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="vision-card">
                <h3 className="vision-title">Tầm nhìn</h3>
                <p className="vision-description">
                  Trở thành câu lạc bộ Taekwondo hàng đầu, nơi mọi người có thể
                  học tập và phát triển niềm đam mê võ thuật. Chúng tôi mong
                  muốn tạo ra một cộng đồng vững mạnh, nơi mọi thành viên đều
                  được tôn trọng, hỗ trợ và khuyến khích phát huy hết tiềm năng
                  của mình.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
