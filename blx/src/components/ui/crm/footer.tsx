"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="client-footer" id="client-footer">
      <div className="footer-main">
        <div className="container">
          <div className="row">
            {/* About Section */}
            <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <div className="footer-widget">
                <h5 className="footer-title">Về chúng tôi</h5>
                <p className="footer-text">
                  Câu lạc bộ Taekwondo hàng đầu, chuyên đào tạo võ thuật với đội
                  ngũ huấn luyện viên chuyên nghiệp và giàu kinh nghiệm.
                </p>
                <div className="footer-social">
                  <a
                    href="#"
                    className="social-link"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ti ti-brand-facebook"></i>
                  </a>
                  <a
                    href="#"
                    className="social-link"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ti ti-brand-instagram"></i>
                  </a>
                  <a
                    href="#"
                    className="social-link"
                    aria-label="YouTube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ti ti-brand-youtube"></i>
                  </a>
                  <a
                    href="#"
                    className="social-link"
                    aria-label="Zalo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ti ti-brand-zalo"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
              <div className="footer-widget">
                <h5 className="footer-title">Liên kết nhanh</h5>
                <ul className="footer-links">
                  <li>
                    <Link href="/gioi-thieu">Giới thiệu</Link>
                  </li>
                  <li>
                    <Link href="/lop-hoc">Khóa học</Link>
                  </li>
                  <li>
                    <Link href="/huan-luyen-vien">Huấn luyện viên</Link>
                  </li>
                  <li>
                    <Link href="/su-kien">Sự kiện</Link>
                  </li>
                  <li>
                    <Link href="/tin-tuc">Tin tức</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Support */}
            <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
              <div className="footer-widget">
                <h5 className="footer-title">Hỗ trợ</h5>
                <ul className="footer-links">
                  <li>
                    <Link href="/lien-he">Liên hệ</Link>
                  </li>
                  <li>
                    <Link href="/faq">Câu hỏi thường gặp</Link>
                  </li>
                  <li>
                    <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
                  </li>
                  <li>
                    <Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Liên hệ</h5>
                <ul className="footer-contact">
                  <li>
                    <i className="ti ti-map-pin"></i>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Thôn+9+Xã+Đồng+Phú+Tỉnh+Đồng+Nai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-address-link"
                    >
                      Thôn 9 Xã Đồng Phú Tỉnh Đồng Nai
                    </a>
                  </li>
                  <li>
                    <i className="ti ti-phone"></i>
                    <a href="tel:+84123456789">+84 123 456 789</a>
                  </li>
                  <li>
                    <i className="ti ti-mail"></i>
                    <a href="mailto:info@taekwondo.com">info@taekwondo.com</a>
                  </li>
                  <li>
                    <i className="ti ti-clock"></i>
                    <span>Thứ 2 - Chủ nhật: 6:00 - 21:00</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright">
                &copy; {currentYear} Taekwondo Đồng Phú. Tất cả quyền được bảo
                lưu.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="powered-by">
                Được phát triển bởi{" "}
                <a href="#" className="link-primary">
                  Minh-Dev Team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
