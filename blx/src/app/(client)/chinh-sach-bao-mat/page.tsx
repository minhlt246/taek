"use client";

import React from "react";
import PageHeader from "@/components/ui/crm/PageHeader";

export default function ChinhSachBaoMatPage() {
  return (
    <div className="chinh-sach-bao-mat-page">
      {/* Page Header */}
      <PageHeader
        title="Chính sách bảo mật"
        description="Cam kết bảo vệ thông tin cá nhân của học viên"
      />

      {/* Content Section */}
      <section className="policy-content-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="policy-content-card">
                <div className="policy-section">
                  <h2 className="policy-section-title">1. Giới thiệu</h2>
                  <p className="policy-text">
                    Câu lạc bộ Taekwondo Đồng Phú ("chúng tôi", "câu lạc bộ")
                    cam kết bảo vệ quyền riêng tư và thông tin cá nhân của tất
                    cả học viên, phụ huynh và người sử dụng dịch vụ của chúng
                    tôi. Chính sách bảo mật này mô tả cách chúng tôi thu thập,
                    sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng
                    website và dịch vụ của câu lạc bộ.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    2. Thông tin chúng tôi thu thập
                  </h2>
                  <h3 className="policy-subtitle">2.1. Thông tin cá nhân</h3>
                  <ul className="policy-list">
                    <li>Họ và tên</li>
                    <li>Ngày sinh, giới tính</li>
                    <li>Số điện thoại, email</li>
                    <li>Địa chỉ liên hệ</li>
                    <li>Thông tin phụ huynh (đối với học viên dưới 18 tuổi)</li>
                    <li>Ảnh đại diện (nếu cung cấp)</li>
                  </ul>

                  <h3 className="policy-subtitle">
                    2.2. Thông tin đăng ký khóa học
                  </h3>
                  <ul className="policy-list">
                    <li>Khóa học đã đăng ký</li>
                    <li>Lịch học đã chọn</li>
                    <li>Thông tin thanh toán học phí</li>
                    <li>Lịch sử tham gia lớp học</li>
                  </ul>

                  <h3 className="policy-subtitle">2.3. Thông tin kỹ thuật</h3>
                  <ul className="policy-list">
                    <li>Địa chỉ IP</li>
                    <li>Loại trình duyệt và thiết bị</li>
                    <li>Thông tin truy cập website</li>
                    <li>Cookies và công nghệ tương tự</li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    3. Mục đích sử dụng thông tin
                  </h2>
                  <ul className="policy-list">
                    <li>
                      Xử lý đăng ký khóa học và quản lý thông tin học viên
                    </li>
                    <li>
                      Liên hệ với học viên và phụ huynh về lịch học, sự kiện,
                      thông báo quan trọng
                    </li>
                    <li>Xử lý thanh toán học phí và quản lý tài chính</li>
                    <li>
                      Cải thiện chất lượng dịch vụ và trải nghiệm người dùng
                    </li>
                    <li>
                      Gửi thông tin về khóa học mới, chương trình ưu đãi (với
                      sự đồng ý của bạn)
                    </li>
                    <li>Đảm bảo an ninh và phòng chống gian lận</li>
                    <li>Tuân thủ các yêu cầu pháp lý</li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    4. Bảo vệ thông tin
                  </h2>
                  <p className="policy-text">
                    Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức
                    phù hợp để bảo vệ thông tin của bạn khỏi việc truy cập,
                    sử dụng, tiết lộ, thay đổi hoặc phá hủy trái phép:
                  </p>
                  <ul className="policy-list">
                    <li>
                      Mã hóa dữ liệu nhạy cảm trong quá trình truyền tải
                    </li>
                    <li>
                      Sử dụng hệ thống bảo mật và tường lửa để bảo vệ máy chủ
                    </li>
                    <li>
                      Giới hạn quyền truy cập thông tin chỉ cho nhân viên có
                      thẩm quyền
                    </li>
                    <li>
                      Thường xuyên cập nhật và kiểm tra hệ thống bảo mật
                    </li>
                    <li>
                      Đào tạo nhân viên về bảo mật thông tin và quyền riêng tư
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    5. Chia sẻ thông tin
                  </h2>
                  <p className="policy-text">
                    Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá
                    nhân của bạn cho bên thứ ba, trừ các trường hợp sau:
                  </p>
                  <ul className="policy-list">
                    <li>
                      Với sự đồng ý rõ ràng của bạn trước khi chia sẻ
                    </li>
                    <li>
                      Với các đối tác dịch vụ cần thiết (như dịch vụ thanh toán
                      trực tuyến) để cung cấp dịch vụ cho bạn
                    </li>
                    <li>
                      Khi được yêu cầu bởi cơ quan pháp luật có thẩm quyền
                    </li>
                    <li>
                      Để bảo vệ quyền lợi, tài sản hoặc an toàn của câu lạc bộ,
                      học viên hoặc công chúng
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">6. Quyền của bạn</h2>
                  <p className="policy-text">
                    Bạn có các quyền sau đối với thông tin cá nhân của mình:
                  </p>
                  <ul className="policy-list">
                    <li>
                      Quyền truy cập: Yêu cầu xem thông tin cá nhân mà chúng
                      tôi đang lưu trữ
                    </li>
                    <li>
                      Quyền chỉnh sửa: Yêu cầu cập nhật hoặc sửa đổi thông tin
                      không chính xác
                    </li>
                    <li>
                      Quyền xóa: Yêu cầu xóa thông tin cá nhân (trừ khi pháp
                      luật yêu cầu chúng tôi lưu trữ)
                    </li>
                    <li>
                      Quyền từ chối: Từ chối nhận email marketing hoặc thông tin
                      quảng cáo
                    </li>
                    <li>
                      Quyền rút lại đồng ý: Rút lại sự đồng ý đã cung cấp trước
                      đó
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">7. Cookies</h2>
                  <p className="policy-text">
                    Website của chúng tôi sử dụng cookies để cải thiện trải
                    nghiệm người dùng. Cookies là các tệp nhỏ được lưu trữ trên
                    thiết bị của bạn. Bạn có thể điều chỉnh cài đặt trình duyệt
                    để từ chối cookies, nhưng điều này có thể ảnh hưởng đến một
                    số chức năng của website.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    8. Thời gian lưu trữ thông tin
                  </h2>
                  <p className="policy-text">
                    Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian
                    cần thiết để thực hiện các mục đích đã nêu trong chính sách
                    này, hoặc theo yêu cầu của pháp luật. Sau khi không còn
                    cần thiết, thông tin sẽ được xóa hoặc ẩn danh hóa một cách
                    an toàn.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    9. Thay đổi chính sách
                  </h2>
                  <p className="policy-text">
                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời
                    gian. Mọi thay đổi sẽ được thông báo trên website và có
                    hiệu lực ngay sau khi được đăng tải. Chúng tôi khuyến khích
                    bạn thường xuyên xem lại chính sách này để cập nhật thông
                    tin mới nhất.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">10. Liên hệ</h2>
                  <p className="policy-text">
                    Nếu bạn có bất kỳ câu hỏi, yêu cầu hoặc khiếu nại nào liên
                    quan đến chính sách bảo mật này, vui lòng liên hệ với
                    chúng tôi:
                  </p>
                  <div className="contact-info-box">
                    <p>
                      <strong>Câu lạc bộ Taekwondo Đồng Phú</strong>
                    </p>
                    <p>
                      <i className="ti ti-map-pin"></i> Thôn 9 Xx Đồng Phú Đồng
                      Nai
                    </p>
                    <p>
                      <i className="ti ti-phone"></i>{" "}
                      <a href="tel:+84123456789">+84 123 456 789</a>
                    </p>
                    <p>
                      <i className="ti ti-mail"></i>{" "}
                      <a href="mailto:info@taekwondo.com">
                        info@taekwondo.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="policy-footer">
                  <p className="policy-update-date">
                    <strong>Cập nhật lần cuối:</strong> {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

