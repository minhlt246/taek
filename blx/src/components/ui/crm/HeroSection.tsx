"use client";

import React from "react";
import Link from "next/link";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Nâng cao kỹ năng Taekwondo của bạn",
  subtitle = "Tham gia cùng chúng tôi để trải nghiệm đào tạo chuyên nghiệp với đội ngũ huấn luyện viên giàu kinh nghiệm",
  primaryButtonText = "Đăng ký ngay",
  primaryButtonLink = "/register",
  secondaryButtonText = "Tìm hiểu thêm",
  secondaryButtonLink = "/about",
}) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-description">{subtitle}</p>
          <div className="hero-buttons">
            <Link href={primaryButtonLink} className="btn btn-light btn-lg">
              {primaryButtonText}
            </Link>
            <Link
              href={secondaryButtonLink}
              className="btn btn-outline-light btn-lg"
            >
              {secondaryButtonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

