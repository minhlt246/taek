"use client";

import React, { useState } from "react";
import PageHeader from "@/components/ui/crm/PageHeader";
import "@/styles/scss/lien-he.scss";

export default function LienHePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Lớp học có phù hợp cho người mới bắt đầu không?",
      answer:
        "Có, chúng tôi có lớp học cơ bản dành riêng cho người mới bắt đầu. Huấn luyện viên sẽ hướng dẫn từng bước một cách chi tiết và an toàn.",
    },
    {
      id: 2,
      question: "Trẻ em từ mấy tuổi có thể tham gia?",
      answer:
        "Trẻ em từ 5 tuổi trở lên có thể tham gia lớp học. Chúng tôi có chương trình đặc biệt dành cho trẻ em với phương pháp vui nhộn và an toàn.",
    },
    {
      id: 3,
      question: "Học phí được thanh toán như thế nào?",
      answer:
        "Học phí được thanh toán theo tháng. Bạn có thể thanh toán bằng tiền mặt, chuyển khoản hoặc thẻ tín dụng. Chúng tôi cũng có các gói học dài hạn với ưu đãi đặc biệt.",
    },
    {
      id: 4,
      question: "Có cần chuẩn bị gì trước khi đến tập không?",
      answer:
        "Bạn chỉ cần mặc quần áo thể thao thoải mái. Chúng tôi sẽ cung cấp võ phục và các dụng cụ cần thiết. Bạn có thể mang theo nước uống và khăn lau.",
    },
    {
      id: 5,
      question: "Có lớp học thử không?",
      answer:
        "Có, chúng tôi có chương trình học thử miễn phí 1 buổi để bạn có thể trải nghiệm và quyết định có phù hợp với mình không.",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const toggleFaq = (id: number) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="lien-he-page">
      {/* Page Header */}
      <PageHeader
        title="Liên hệ"
        description="Chúng tôi luôn sẵn sàng hỗ trợ bạn"
      />

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="row">
            {/* Contact Form */}
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="contact-form-card">
                <h3 className="contact-form-title">Gửi tin nhắn cho chúng tôi</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name">Họ và tên *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-control"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="form-control"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="subject">Chủ đề *</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          className="form-control"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Tin nhắn *</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary submit-btn">
                    Gửi tin nhắn
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4">
              <div className="contact-info-card">
                <h3 className="contact-info-title">Thông tin liên hệ</h3>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="ti ti-map-pin"></i>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-detail-title">Địa chỉ</h4>
                    <p className="contact-detail-text">
                      123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="ti ti-phone"></i>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-detail-title">Điện thoại</h4>
                    <a href="tel:+84123456789">0901 234 567</a>
                    <br />
                    <a href="tel:+84909876543">0909 876 543</a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="ti ti-mail"></i>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-detail-title">Email</h4>
                    <a href="mailto:info@taekwondo.com">
                      info@taekwondo.com
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="ti ti-clock"></i>
                  </div>
                  <div className="contact-details">
                    <h4 className="contact-detail-title">Giờ làm việc</h4>
                    <p className="contact-detail-text">Thứ 2 - Chủ nhật: 6:00 - 21:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3 className="faq-section-title">Câu hỏi thường gặp</h3>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div
                    className={`faq-question ${activeFaq === faq.id ? "active" : ""}`}
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h4 className="faq-question-title">{faq.question}</h4>
                    <i className="ti ti-chevron-down"></i>
                  </div>
                  <div
                    className={`faq-answer ${activeFaq === faq.id ? "active" : ""}`}
                  >
                    <p className="faq-answer-text">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

