"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/scss/langding.scss";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // Validate phone (Vietnamese phone format)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    const cleanPhone = formData.phone.replace(/\s+/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      toast.error(
        "Số điện thoại không hợp lệ (VD: 0344712604 hoặc +84344712604)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Tin nhắn đã được gửi thành công!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi gửi tin nhắn");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Thêm class vào body để scope styles
    document.body.classList.add("landing-page");

    // Hide loader after component mounts and page is ready
    const hideLoader = () => {
      const loader = document.getElementById("loader");
      if (loader) {
        loader.classList.add("hidden");
      }
    };

    // Hide loader after a delay to ensure smooth transition
    const loaderTimeout = setTimeout(() => {
      hideLoader();
    }, 1500);

    // Ensure DOM is ready and script can access elements
    // The script will auto-initialize when loaded
    const handleScriptReady = () => {
      // Force a small delay to ensure all DOM elements are rendered
      setTimeout(() => {
        // Check if carousel needs initialization
        const carousel = document.getElementById("carousel");
        if (carousel && carousel.children.length === 0) {
          // If carousel is empty, script might not have run yet
          // Trigger a custom event to re-check
          window.dispatchEvent(new Event("landingPageReady"));
        }
      }, 200);
    };

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      handleScriptReady();
    } else {
      document.addEventListener("DOMContentLoaded", handleScriptReady);
    }

    // Also listen for window load event as fallback
    const handleWindowLoad = () => {
      hideLoader();
    };
    window.addEventListener("load", handleWindowLoad);

    // Cleanup
    return () => {
      // Xóa class khỏi body khi component unmount
      document.body.classList.remove("landing-page");
      clearTimeout(loaderTimeout);
      window.removeEventListener("load", handleWindowLoad);
      if (document.readyState !== "loading") {
        document.removeEventListener("DOMContentLoaded", handleScriptReady);
      }
    };
  }, []);

  return (
    <div className="landing-page">
      {/* Loading Screen */}
      <div className="loader" id="loader">
        <div className="loader-content">
          <div className="loader-prism">
            <div className="prism-face"></div>
            <div className="prism-face"></div>
            <div className="prism-face"></div>
          </div>
          <div
            style={{
              color: "var(--accent-purple)",
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "3px",
            }}
          >
            Đang tải...
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="header-langding" id="header">
        <nav className="nav-container">
          <Link href="#home" className="logo">
            <div className="logo-icon">
              <Image
                className="logo-prism"
                src="/client/images/logo.png"
                alt="logo"
                width={50}
                height={50}
              />
            </div>
            <span className="logo-text">
              <span className="prism">TAEKWONDO</span>
            </span>
          </Link>

          <ul className="nav-menu" id="navMenu">
            <li>
              <Link href="#home" className="nav-link active">
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link href="#about" className="nav-link">
                Giới Thiệu
              </Link>
            </li>
            <li>
              <Link href="#stats" className="nav-link">
                Thành Tích
              </Link>
            </li>
            <li>
              <Link href="#skills" className="nav-link">
                Kỹ Năng
              </Link>
            </li>
            <li>
              <Link href="#contact" className="nav-link">
                Liên Hệ
              </Link>
            </li>
          </ul>

          <div className="menu-toggle" id="menuToggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      {/* Hero Section with 3D Carousel */}
      <section className="hero" id="home">
        <div className="carousel-container">
          <div className="carousel" id="carousel">
            {/* Carousel items will be generated by JavaScript */}
          </div>

          <div className="carousel-controls">
            <button className="carousel-btn" id="prevBtn">
              ‹
            </button>
            <button className="carousel-btn" id="nextBtn">
              ›
            </button>
          </div>

          <div className="carousel-indicators" id="indicators">
            {/* Indicators will be generated by JavaScript */}
          </div>
        </div>
      </section>

      {/* NEW: Prism Philosophy Section (About) */}
      <section className="philosophy-section" id="about">
        <div className="philosophy-container">
          <div className="prism-line"></div>

          <h2 className="philosophy-headline">
            Võ Đạo Taekwondo
            <br />
            Rèn Luyện Thân Tâm
          </h2>

          <p className="philosophy-subheading">
            Taekwondo không chỉ là môn võ thuật, mà còn là nghệ thuật rèn luyện
            tinh thần, thể chất và ý chí. Chúng tôi cam kết đào tạo những võ
            sinh xuất sắc với tinh thần võ đạo cao thượng, kỹ thuật tinh xảo và
            tinh thần kỷ luật nghiêm ngặt.
          </p>

          <div className="philosophy-pillars container">
            <div className="row g-4">
              <div className="col-lg-4 col-12">
                <div className="pillar">
                  <div className="pillar-icon">🥋</div>
                  <h3 className="pillar-title">Kỷ Luật</h3>
                  <p className="pillar-description">
                    Kỷ luật là nền tảng của võ đạo. Chúng tôi rèn luyện học viên
                    với tinh thần kỷ luật cao, tôn trọng thầy cô, đồng môn và
                    tuân thủ các nguyên tắc võ đạo truyền thống của Taekwondo.
                  </p>
                </div>
              </div>

              <div className="col-lg-4 col-12">
                <div className="pillar">
                  <div className="pillar-icon">⚡</div>
                  <h3 className="pillar-title">Kỹ Thuật</h3>
                  <p className="pillar-description">
                    Mỗi đòn đá, mỗi thế tấn đều được hướng dẫn tỉ mỉ và chính
                    xác. Chúng tôi đảm bảo học viên nắm vững từng kỹ thuật cơ
                    bản đến nâng cao, từ quyền pháp đến đối kháng, với sự hướng
                    dẫn tận tình từ các huấn luyện viên giàu kinh nghiệm.
                  </p>
                </div>
              </div>

              <div className="col-lg-4 col-12">
                <div className="pillar">
                  <div className="pillar-icon">🌟</div>
                  <h3 className="pillar-title">Phát Triển</h3>
                  <p className="pillar-description">
                    Taekwondo là hành trình phát triển không ngừng. Từ đai trắng
                    đến đai đen, mỗi cấp độ là một bước tiến mới trong việc rèn
                    luyện thể chất, tinh thần và ý chí. Chúng tôi đồng hành cùng
                    bạn trên con đường này.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="philosophy-particles" id="particles">
            {/* Particles will be generated by JavaScript */}
          </div>
        </div>
      </section>

      {/* Stats Section with Content */}
      <section className="stats-section" id="stats">
        <div className="section-header">
          <h2 className="section-title">Thành Tích</h2>
          <p className="section-subtitle">Thành tích và giải thưởng</p>
        </div>

        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3  col-12">
              <div className="stat-card">
                <div className="stat-icon">🚀</div>
                <div className="stat-number" data-target="1500">
                  0
                </div>
                <div className="stat-label">Dự Thi</div>
                <p className="stat-description">
                  Tham gia các giải đấu Taekwondo trong nước và quốc tế, thể
                  hiện tinh thần thi đấu cao thượng và kỹ thuật xuất sắc.
                </p>
              </div>
            </div>

            <div className="col-lg-3  col-12">
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-number" data-target="990">
                  0
                </div>
                <div className="stat-label">Học Viên Hài Lòng %</div>
                <p className="stat-description">
                  Đảm bảo chất lượng đào tạo với phương pháp giảng dạy chuyên
                  nghiệp, tận tâm và hiệu quả, mang lại sự hài lòng cao cho học
                  viên và phụ huynh.
                </p>
              </div>
            </div>

            <div className="col-lg-3  col-12">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-number" data-target="250">
                  0
                </div>
                <div className="stat-label">Giải Thưởng</div>
                <p className="stat-description">
                  Đạt được nhiều thành tích cao trong các giải đấu Taekwondo,
                  được công nhận bởi các tổ chức võ thuật uy tín trong và ngoài
                  nước.
                </p>
              </div>
            </div>

            <div className="col-lg-3  col-12">
              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-number" data-target="5000">
                  0
                </div>
                <div className="stat-label">Giờ Tập Luyện</div>
                <p className="stat-description">
                  Tổng số giờ tập luyện chăm chỉ và nghiêm túc của tất cả học
                  viên, thể hiện sự cống hiến và đam mê với môn võ Taekwondo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Skills Section - Kỹ Năng */}
      <section className="skills-section" id="skills">
        <div className="skills-container">
          <div className="section-header">
            <h2 className="section-title">Kỹ Năng</h2>
            <p className="section-subtitle">
              Khả năng đối kháng, quyền pháp và biểu diễn
            </p>
          </div>

          <div className="skill-categories">
            <div className="category-tab active" data-category="all">
              All Skills
            </div>
            <div className="category-tab" data-category="Đối Kháng">
              Đối Kháng
            </div>
            <div className="category-tab" data-category="Quyền Pháp">
              Quyền Pháp
            </div>
            <div className="category-tab" data-category="Biểu Diễn">
              Biểu Diễn
            </div>
          </div>

          <div className="skills-hexagon-grid" id="skillsGrid">
            {/* Hexagonal skill items will be generated by JavaScript */}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <h2 className="section-title">Liên Hệ Với Chúng Tôi</h2>
          <p className="section-subtitle">
            Bạn muốn bắt đầu hành trình Taekwondo? Hãy liên hệ với chúng tôi
            ngay hôm nay!
          </p>
        </div>

        <div className="contact-container ">
          <div className="contact-info">
            <a
              href="https://www.google.com/maps/search/?api=1&query=11.402583799999995,106.82868589919738"
              target="_blank"
              rel="noopener noreferrer"
              className="info-item"
            >
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h4>Địa Chỉ</h4>
                <p>Công An Xã Tân Lập</p>
              </div>
            </a>

            <a href="mailto:info@taekwondoacademy.vn" className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h4>Email</h4>
                <p>info@taekwondoacademy.vn</p>
              </div>
            </a>

            <a href="tel:+84344712604" className="info-item">
              <div className="info-icon">📱</div>
              <div className="info-text">
                <h4>Điện Thoại</h4>
                <p>+84344712604</p>
              </div>
            </a>

            <Link href="#contact" className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-text">
                <h4>Đăng Ký Học</h4>
                <p>Đăng ký lớp học thử miễn phí</p>
              </div>
            </Link>
          </div>

          <form
            className="contact-form"
            id="contactForm"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="name">Họ và Tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số Điện Thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="0344712604 hoặc +84344712604"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Tin Nhắn</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                rows={5}
              ></textarea>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi Tin Nhắn"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Link href="#home" className="logo">
                <div className="logo-icon">
                  <Image
                    className="logo-prism"
                    src="/client/images/logo.png"
                    alt="logo"
                    width={50}
                    height={50}
                  />
                </div>
                <span className="logo-text">
                  <span className="prism">TAEKWONDO</span>
                </span>
              </Link>
            </div>
            <p className="footer-description">
              Rèn luyện thể chất, tinh thần và ý chí thông qua võ đạo Taekwondo.
              Nơi đào tạo những võ sinh xuất sắc với tinh thần võ đạo cao
              thượng.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/profile.php?id=100083353561674&locale=vi_VN"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                fb
              </a>
              <a
                href="https://www.tiktok.com/@dongphutae1"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                t
              </a>
              <a
                href="#"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                ig
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Chương Trình</h4>
            <div className="footer-links">
              <Link href="#skills">Đối Kháng</Link>
              <Link href="#skills">Quyền Pháp</Link>
              <Link href="#skills">Biểu Diễn</Link>
              <Link href="#stats">Thi Đấu</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Về Chúng Tôi</h4>
            <div className="footer-links">
              <Link href="#about">Giới Thiệu</Link>
              <Link href="#stats">Thành Tích</Link>
              <Link href="#contact">Liên Hệ</Link>
              <Link href="#skills">Kỹ Năng</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Thông Tin</h4>
            <div className="footer-links">
              <Link href="#contact">Lịch Học</Link>
              <Link href="#contact">Đăng Ký</Link>
              <Link href="#stats">Giải Thưởng</Link>
              <Link href="#contact">Hỗ Trợ</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © 2026 Taekwondo Academy. All rights reserved.
          </div>
          <div className="footer-credits">Designed by MinhDevTeam</div>
        </div>
      </footer>

      {/* Load landing page JavaScript */}
      <Script
        src="/client/js/langding.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Script loaded, ensure initialization runs
          if (typeof window !== "undefined") {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
              console.log("Landing page script loaded");
            }, 100);
          }
        }}
      />

      {/* Toast Notification */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
