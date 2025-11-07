"use client";

import Link from "next/link";
import { useState, useRef } from "react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Column - Text Content */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="hero-tagline">
                <i className="ti ti-user"></i>
                <span>Võ Thuật Truyền Thống</span>
              </div>
              <h1 className="hero-main-heading">
                Khám Phá Nghệ Thuật{" "}
                <span className="hero-highlight">TAEKWONDO</span>
              </h1>
              <p className="hero-description-text">
                Train your body, train your mind. Join us to become the best
                version of yourself through the traditional art of Taekwondo.
              </p>
              <div className="hero-cta-buttons">
                <Link href="/register" className="btn-hero-primary">
                  Bắt đầu ngay
                </Link>
                <Link href="/gioi-thieu" className="btn-hero-secondary">
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            {/* Right Column - Image Placeholder */}
            <div className="col-lg-6">
              <div className="hero-image-placeholder">
                  <img src="/styles/images/logo.png" alt="Hero Image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title">
            <h2 className="section-title-heading">Tại Sao Chọn Chúng Tôi?</h2>
            <p className="section-title-description">
              Khám phá những điểm nổi bật của câu lạc bộ Taekwondo hàng đầu
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="ti ti-user"></i>
                </div>
                <h5 className="feature-card-title">Lớp học đa dạng</h5>
                <p className="feature-card-description">Phù hợp mọi lứa tuổi</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="ti ti-users"></i>
                </div>
                <h5 className="feature-card-title">HLV chuyên nghiệp</h5>
                <p className="feature-card-description">Giàu kinh nghiệm</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon feature-icon-calendar">
                  <i className="ti ti-calendar"></i>
                </div>
                <h5 className="feature-card-title">Lịch tập linh hoạt</h5>
                <p className="feature-card-description">Nhiều khung giờ</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon feature-icon-trophy">
                  <i className="ti ti-trophy"></i>
                </div>
                <h5 className="feature-card-title">Thành tích cao</h5>
                <p className="feature-card-description">Nhiều giải quốc tế</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Taekwondo Section */}
      <section className="explore-taekwondo-section section-padding">
        <div className="container">
          <div className="explore-header">
            <h2 className="explore-title">
              Khám Phá <span className="explore-highlight">Taekwondo</span>
            </h2>
            <p className="explore-subtitle">
              Tìm hiểu về chương trình đào tạo và bắt đầu hành trình võ thuật
              của bạn
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="explore-card">
                <div className="explore-icon-circle explore-icon-blue">
                  <i className="ti ti-school"></i>
                </div>
                <h3 className="explore-card-title">Hệ Thống Đai Cấp</h3>
                <p className="explore-card-description">
                  Tìm hiểu về 6 cấp độ đai từ trắng đến đen và yêu cầu thăng
                  tiến
                </p>
                <Link
                  href="/lop-hoc"
                  className="explore-link explore-link-blue"
                >
                  Xem chi tiết <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="explore-card">
                <div className="explore-icon-circle explore-icon-light-blue">
                  <i className="ti ti-bolt"></i>
                </div>
                <h3 className="explore-card-title">Kỹ Thuật Taekwondo</h3>
                <p className="explore-card-description">
                  Làm chủ các kỹ thuật đá, tay và Poomsae từ cơ bản đến nâng cao
                </p>
                <Link
                  href="/lop-hoc"
                  className="explore-link explore-link-light-blue"
                >
                  Xem chi tiết <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="explore-card">
                <div className="explore-icon-circle explore-icon-green">
                  <i className="ti ti-calendar"></i>
                </div>
                <h3 className="explore-card-title">Lịch Tập Luyện</h3>
                <p className="explore-card-description">
                  Xem lịch học linh hoạt từ sáng đến tối, phù hợp mọi lứa tuổi
                </p>
                <Link
                  href="/lich-tap"
                  className="explore-link explore-link-green"
                >
                  Xem chi tiết <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="explore-card">
                <div className="explore-icon-circle explore-icon-purple">
                  <i className="ti ti-users"></i>
                </div>
                <h3 className="explore-card-title">Huấn Luyện Viên</h3>
                <p className="explore-card-description">
                  Gặp gỡ đội ngũ HLV đai đen với kinh nghiệm thi đấu quốc tế
                </p>
                <Link
                  href="/huan-luyen-vien"
                  className="explore-link explore-link-purple"
                >
                  Xem chi tiết <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="explore-card">
                <div className="explore-icon-circle explore-icon-orange">
                  <i className="ti ti-award"></i>
                </div>
                <h3 className="explore-card-title">Bảng Giá</h3>
                <p className="explore-card-description">
                  Khám phá các gói tập linh hoạt với mức giá hợp lý
                </p>
                <Link
                  href="/lop-hoc"
                  className="explore-link explore-link-orange"
                >
                  Xem chi tiết <i className="ti ti-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="explore-card explore-card-special">
                <div className="explore-icon-circle explore-icon-white">
                  <i className="ti ti-user"></i>
                </div>
                <h3 className="explore-card-title explore-card-title-white">
                  Bắt Đầu Ngay
                </h3>
                <p className="explore-card-description explore-card-description-white">
                  Đăng ký học thử miễn phí và nhận tư vấn từ HLV
                </p>
                <Link href="/register" className="btn-explore-register">
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="training-programs-home-section">
        <div className="container">
          <div className="training-programs-header">
            <div className="training-programs-label">LỚP HỌC NỔI BẬT</div>
            <h2 className="training-programs-title">Chương Trình Đào Tạo</h2>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="training-program-card">
                <div className="training-program-image-placeholder">
                  <img src="/styles/images/children.png" alt="Trẻ Em (5-12 tuổi)" />
                </div>
                <div className="training-program-content">
                  <h3 className="training-program-card-title">
                    Trẻ Em (5-12 tuổi)
                  </h3>
                  <p className="training-program-card-description">
                    Phương pháp giảng dạy phù hợp với từng lứa tuổi, giúp phát
                    triển toàn diện.
                  </p>
                  <Link href="/lop-hoc" className="btn-training-program-detail">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="training-program-card">
                <div className="training-program-image-placeholder">
                  <img src="/styles/images/teen.png" alt="Thiếu Niên (13-17 tuổi)" />
                </div>
                <div className="training-program-content">
                  <h3 className="training-program-card-title">
                    Thiếu Niên (13-17 tuổi)
                  </h3>
                  <p className="training-program-card-description">
                    Phương pháp giảng dạy phù hợp với từng lứa tuổi, giúp phát
                    triển toàn diện.
                  </p>
                  <Link href="/lop-hoc" className="btn-training-program-detail">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="training-program-card">
                <div className="training-program-image-placeholder">
                  <img src="/styles/images/adult.png" alt="Người Lớn (18+)" />
                </div>
                <div className="training-program-content">
                  <h3 className="training-program-card-title">
                    Người Lớn (18+)
                  </h3>
                  <p className="training-program-card-description">
                    Phương pháp giảng dạy phù hợp với từng lứa tuổi, giúp phát
                    triển toàn diện.
                  </p>
                  <Link href="/lop-hoc" className="btn-training-program-detail">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-5">
            <Link href="/lop-hoc" className="btn-training-program-all">
              Xem tất cả lớp học
            </Link>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-stats-section section-padding">
        <div className="container">
          <div className="achievements-header text-center mb-5">
            <h2 className="achievements-title">Thành Tích Của Chúng Tôi</h2>
            <p className="achievements-subtitle">
              Con số ấn tượng sau hơn 15 năm hoạt động
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="achievement-stat-card">
                <div className="achievement-stat-icon">
                  <i className="ti ti-award"></i>
                </div>
                <div className="achievement-stat-number">15+</div>
                <div className="achievement-stat-label">Năm kinh nghiệm</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="achievement-stat-card">
                <div className="achievement-stat-icon">
                  <i className="ti ti-users"></i>
                </div>
                <div className="achievement-stat-number">500+</div>
                <div className="achievement-stat-label">Học viên</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="achievement-stat-card">
                <div className="achievement-stat-icon">
                  <i className="ti ti-star"></i>
                </div>
                <div className="achievement-stat-number">50+</div>
                <div className="achievement-stat-label">Giải thưởng</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="achievement-stat-card">
                <div className="achievement-stat-icon">
                  <i className="ti ti-target"></i>
                </div>
                <div className="achievement-stat-number">15</div>
                <div className="achievement-stat-label">Huấn luyện viên</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section section-padding">
        <div className="container">
          <div className="benefits-header text-center mb-5">
            <div className="benefits-label">LỢI ÍCH</div>
            <h2 className="benefits-title">Tại Sao Nên Tập Taekwondo?</h2>
            <p className="benefits-subtitle">
              Những giá trị mà Taekwondo mang lại cho cuộc sống của bạn
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <i className="ti ti-heart benefit-icon"></i>
                </div>
                <h5 className="benefit-card-title">Sức Khỏe Tốt Hơn</h5>
                <p className="benefit-card-description">
                  Tăng cường thể lực, sức bền và sự dẻo dai của cơ thể
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <i className="ti ti-shield benefit-icon"></i>
                </div>
                <h5 className="benefit-card-title">Kỹ Năng Tự Vệ</h5>
                <p className="benefit-card-description">
                  Học các kỹ thuật tự vệ hiệu quả và thực chiến
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <i className="ti ti-chart-line benefit-icon"></i>
                </div>
                <h5 className="benefit-card-title">Phát Triển Bản Thân</h5>
                <p className="benefit-card-description">
                  Rèn luyện kỷ luật, tự tin và tinh thần kiên cường
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <i className="ti ti-users benefit-icon"></i>
                </div>
                <h5 className="benefit-card-title">Kết Nối Cộng Đồng</h5>
                <p className="benefit-card-description">
                  Gặp gỡ và kết bạn với những người có cùng đam mê
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="news-section section-padding">
        <div className="container">
          <div className="news-header text-center mb-5">
            <div className="news-label">TIN TỨC</div>
            <h2 className="news-title">Hoạt Động Mới Nhất</h2>
            <p className="news-subtitle">
              Cập nhật các hoạt động và sự kiện của câu lạc bộ
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="news-card">
                <div className="news-image-placeholder">
                  <img src="/styles/images/news-1.png" alt="News Image" />
                </div>
                <div className="news-content">
                  <div className="news-date">
                    <i className="ti ti-calendar"></i>
                    15/10/2025
                  </div>
                  <h5 className="news-card-title">Lễ Trao Đai Đen Kỳ 20</h5>
                  <p className="news-card-description">
                    Chúc mừng 12 học viên xuất sắc đạt đai đen trong kỳ thi vừa
                    qua
                  </p>
                  <Link href="#" className="news-read-more">
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="news-card">
                <div className="news-image-placeholder">
                  <img src="/styles/images/news-2.png" alt="News Image" />
                </div>
                <div className="news-content">
                  <div className="news-date">
                    <i className="ti ti-calendar"></i>
                    01/10/2025
                  </div>
                  <h5 className="news-card-title">
                    Giải Vô Địch Quốc Gia 2025
                  </h5>
                  <p className="news-card-description">
                    Đội tuyển CLB đạt 15 huy chương vàng tại giải vô địch quốc
                    gia
                  </p>
                  <Link href="#" className="news-read-more">
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="news-card">
                <div className="news-image-placeholder">
                  <img src="/styles/images/news-3.png" alt="News Image" />
                </div>
                <div className="news-content">
                  <div className="news-date">
                    <i className="ti ti-calendar"></i>
                    20/09/2025
                  </div>
                  <h5 className="news-card-title">Khai Trương Lớp Mới</h5>
                  <p className="news-card-description">
                    Mở thêm lớp sáng T7 dành cho người lớn bận rộn trong tuần
                  </p>
                  <Link href="#" className="news-read-more">
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Experience Section */}
      <section className="video-experience-section section-padding">
        <div className="container">
          <div className="video-experience-header text-center mb-5">
            <h2 className="video-experience-title">Trải Nghiệm Tại CLB</h2>
            <p className="video-experience-subtitle">
              Khám phá không khí tập luyện và thành tích của chúng tôi
            </p>
          </div>
          <div className="video-experience-content">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="video-player"
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                poster="/images/video-poster.jpg" // Optional: thumbnail image
              >
                {/* Thêm video source - có thể dùng một trong các cách sau: */}
                {/* Cách 1: Video từ thư mục public */}
                <source src="/videos/intro-video.mp4" type="video/mp4" />
                {/* Cách 2: Video từ URL khác */}
                {/* <source src="https://example.com/video.mp4" type="video/mp4" /> */}
                {/* Cách 3: Nhiều format để tương thích tốt hơn */}
                {/* <source src="/videos/intro-video.webm" type="video/webm" /> */}
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
              {!isPlaying && (
                <div className="video-overlay" onClick={togglePlay}>
                  <div className="video-play-button">
                    <i className="ti ti-player-play"></i>
                  </div>
                  <div className="video-placeholder-text">
                    <div className="video-placeholder-title-en">
                      [Introduction Video]
                    </div>
                    <div className="video-placeholder-title-vi">
                      Video giới thiệu câu lạc bộ
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <Link href="#" className="btn-video-more">
                Xem thêm video
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <div className="cta-home-container">
            <h3 className="cta-home-title">Sẵn Sàng Bắt Đầu?</h3>
            <p className="cta-home-description">
              Đăng ký ngay hôm nay để nhận buổi học thử miễn phí và trải nghiệm
              phương pháp đào tạo chuyên nghiệp của chúng tôi.
            </p>
            <div className="cta-home-buttons">
              <Link href="/register" className="btn-cta-primary">
                Đăng ký học thử
              </Link>
              <Link href="/gioi-thieu" className="btn-cta-secondary">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
