"use client";

import React from "react";
import PageHeader from "@/components/ui/crm/PageHeader";

export default function DieuKhoanSuDungPage() {
  return (
    <div className="dieu-khoan-su-dung-page">
      {/* Page Header */}
      <PageHeader
        title="Điều khoản sử dụng"
        description="Quy định và điều kiện sử dụng dịch vụ của câu lạc bộ"
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
                    Chào mừng bạn đến với website của Câu lạc bộ Taekwondo Đồng
                    Phú. Bằng việc truy cập và sử dụng website này, bạn đồng ý
                    tuân thủ các điều khoản và điều kiện sử dụng được nêu trong
                    tài liệu này. Nếu bạn không đồng ý với bất kỳ điều khoản
                    nào, vui lòng không sử dụng website của chúng tôi.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    2. Định nghĩa và giải thích
                  </h2>
                  <ul className="policy-list">
                    <li>
                      <strong>"Câu lạc bộ"</strong> hoặc <strong>"Chúng tôi"</strong>{" "}
                      đề cập đến Câu lạc bộ Taekwondo Đồng Phú
                    </li>
                    <li>
                      <strong>"Học viên"</strong> hoặc <strong>"Bạn"</strong>{" "}
                      đề cập đến người sử dụng website và dịch vụ của câu lạc
                      bộ
                    </li>
                    <li>
                      <strong>"Website"</strong> đề cập đến trang web chính
                      thức của câu lạc bộ
                    </li>
                    <li>
                      <strong>"Dịch vụ"</strong> bao gồm các khóa học Taekwondo,
                      sự kiện, hoạt động và các dịch vụ khác do câu lạc bộ cung
                      cấp
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    3. Điều kiện đăng ký và sử dụng dịch vụ
                  </h2>
                  <h3 className="policy-subtitle">3.1. Độ tuổi</h3>
                  <ul className="policy-list">
                    <li>
                      Học viên từ 5 tuổi trở lên có thể tham gia các khóa học
                    </li>
                    <li>
                      Học viên dưới 18 tuổi cần có sự đồng ý và giám sát của
                      phụ huynh hoặc người giám hộ
                    </li>
                    <li>
                      Phụ huynh hoặc người giám hộ chịu trách nhiệm về việc đăng
                      ký và thanh toán học phí cho học viên dưới 18 tuổi
                    </li>
                  </ul>

                  <h3 className="policy-subtitle">3.2. Đăng ký khóa học</h3>
                  <ul className="policy-list">
                    <li>
                      Việc đăng ký khóa học phải được thực hiện thông qua website
                      hoặc trực tiếp tại câu lạc bộ
                    </li>
                    <li>
                      Đăng ký chỉ được xác nhận sau khi thanh toán học phí đầy
                      đủ
                    </li>
                    <li>
                      Câu lạc bộ có quyền từ chối đăng ký nếu khóa học đã đầy
                      hoặc không phù hợp với học viên
                    </li>
                    <li>
                      Học viên cần cung cấp thông tin chính xác và đầy đủ khi
                      đăng ký
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    4. Thanh toán và hoàn tiền
                  </h2>
                  <h3 className="policy-subtitle">4.1. Học phí</h3>
                  <ul className="policy-list">
                    <li>
                      Học phí được thanh toán theo tháng hoặc theo gói khóa học
                    </li>
                    <li>
                      Mức học phí có thể thay đổi và sẽ được thông báo trước
                      khi áp dụng
                    </li>
                    <li>
                      Học phí đã thanh toán không được hoàn lại trừ các trường
                      hợp đặc biệt được quy định
                    </li>
                  </ul>

                  <h3 className="policy-subtitle">4.2. Chính sách hoàn tiền</h3>
                  <ul className="policy-list">
                    <li>
                      Hoàn tiền 100% nếu học viên hủy đăng ký trước ngày khai
                      giảng 7 ngày
                    </li>
                    <li>
                      Hoàn tiền 50% nếu học viên hủy đăng ký trong vòng 7 ngày
                      trước ngày khai giảng
                    </li>
                    <li>
                      Không hoàn tiền sau khi khóa học đã bắt đầu, trừ trường
                      hợp có lý do chính đáng (bệnh tật, tai nạn) và được câu
                      lạc bộ xem xét
                    </li>
                    <li>
                      Thời gian xử lý hoàn tiền: 7-14 ngày làm việc kể từ ngày
                      được chấp thuận
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    5. Quy định trong lớp học
                  </h2>
                  <ul className="policy-list">
                    <li>
                      Học viên phải mặc võ phục đúng quy định khi tham gia lớp
                      học
                    </li>
                    <li>
                      Tôn trọng huấn luyện viên, nhân viên và các học viên khác
                    </li>
                    <li>
                      Không được sử dụng bạo lực hoặc có hành vi không phù hợp
                      trong lớp học
                    </li>
                    <li>
                      Tuân thủ các quy định về an toàn và kỷ luật của câu lạc bộ
                    </li>
                    <li>
                      Đến lớp đúng giờ. Nếu vắng mặt, cần thông báo trước cho
                      câu lạc bộ
                    </li>
                    <li>
                      Không được tự ý rời khỏi lớp học trong giờ học mà không
                      có sự cho phép
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    6. Quyền và trách nhiệm của học viên
                  </h2>
                  <h3 className="policy-subtitle">6.1. Quyền của học viên</h3>
                  <ul className="policy-list">
                    <li>
                      Được tham gia đầy đủ các buổi học theo lịch đã đăng ký
                    </li>
                    <li>
                      Được hướng dẫn và hỗ trợ bởi đội ngũ huấn luyện viên chuyên
                      nghiệp
                    </li>
                    <li>
                      Được tham gia các sự kiện và hoạt động của câu lạc bộ
                    </li>
                    <li>
                      Được yêu cầu giải đáp thắc mắc về khóa học và dịch vụ
                    </li>
                  </ul>

                  <h3 className="policy-subtitle">
                    6.2. Trách nhiệm của học viên
                  </h3>
                  <ul className="policy-list">
                    <li>
                      Thanh toán học phí đầy đủ và đúng hạn
                    </li>
                    <li>
                      Tham gia lớp học đầy đủ và tích cực
                    </li>
                    <li>
                      Tuân thủ các quy định và nội quy của câu lạc bộ
                    </li>
                    <li>
                      Bảo quản tài sản và cơ sở vật chất của câu lạc bộ
                    </li>
                    <li>
                      Thông báo kịp thời về các vấn đề sức khỏe có thể ảnh hưởng
                      đến việc tập luyện
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    7. Quyền và trách nhiệm của câu lạc bộ
                  </h2>
                  <h3 className="policy-subtitle">7.1. Quyền của câu lạc bộ</h3>
                  <ul className="policy-list">
                    <li>
                      Từ chối hoặc chấm dứt dịch vụ đối với học viên vi phạm
                      quy định
                    </li>
                    <li>
                      Thay đổi lịch học, huấn luyện viên hoặc nội dung khóa học
                      khi cần thiết (sẽ thông báo trước)
                    </li>
                    <li>
                      Sử dụng hình ảnh, video của học viên trong các hoạt động
                      quảng bá (với sự đồng ý)
                    </li>
                  </ul>

                  <h3 className="policy-subtitle">
                    7.2. Trách nhiệm của câu lạc bộ
                  </h3>
                  <ul className="policy-list">
                    <li>
                      Cung cấp dịch vụ đào tạo chất lượng với đội ngũ huấn luyện
                      viên chuyên nghiệp
                    </li>
                    <li>
                      Đảm bảo an toàn cho học viên trong quá trình tập luyện
                    </li>
                    <li>
                      Cung cấp cơ sở vật chất và trang thiết bị đầy đủ, an toàn
                    </li>
                    <li>
                      Thông báo kịp thời về các thay đổi liên quan đến khóa học
                    </li>
                    <li>
                      Bảo mật thông tin cá nhân của học viên theo chính sách
                      bảo mật
                    </li>
                  </ul>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    8. Miễn trừ trách nhiệm
                  </h2>
                  <p className="policy-text">
                    Taekwondo là môn võ thuật có tính chất thể thao và có thể
                    có rủi ro về chấn thương. Học viên tham gia tập luyện với
                    sự hiểu biết và chấp nhận các rủi ro này. Câu lạc bộ sẽ
                    thực hiện các biện pháp an toàn hợp lý, nhưng không chịu
                    trách nhiệm cho các chấn thương xảy ra trong quá trình tập
                    luyện, trừ trường hợp do lỗi cố ý hoặc sơ suất nghiêm trọng
                    của câu lạc bộ.
                  </p>
                  <p className="policy-text">
                    Học viên hoặc phụ huynh cần ký cam kết về sức khỏe và chấp
                    nhận rủi ro trước khi tham gia khóa học.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    9. Sở hữu trí tuệ
                  </h2>
                  <p className="policy-text">
                    Tất cả nội dung trên website, bao gồm văn bản, hình ảnh,
                    logo, video, và các tài liệu khác, đều thuộc quyền sở hữu
                    của Câu lạc bộ Taekwondo Đồng Phú hoặc được cấp phép sử
                    dụng. Bạn không được sao chép, phân phối, hoặc sử dụng các
                    nội dung này cho mục đích thương mại mà không có sự cho phép
                    bằng văn bản của câu lạc bộ.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    10. Chấm dứt dịch vụ
                  </h2>
                  <p className="policy-text">
                    Câu lạc bộ có quyền chấm dứt hoặc tạm ngừng dịch vụ đối với
                    học viên vi phạm các điều khoản này, có hành vi không phù
                    hợp, hoặc gây ảnh hưởng đến hoạt động của câu lạc bộ. Trong
                    trường hợp này, học viên sẽ không được hoàn lại học phí cho
                    phần còn lại của khóa học.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    11. Giải quyết tranh chấp
                  </h2>
                  <p className="policy-text">
                    Mọi tranh chấp phát sinh từ việc sử dụng dịch vụ sẽ được
                    giải quyết thông qua thương lượng. Nếu không thể thương
                    lượng, tranh chấp sẽ được giải quyết tại Tòa án có thẩm
                    quyền tại Đồng Nai, Việt Nam, theo pháp luật Việt Nam.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">
                    12. Thay đổi điều khoản
                  </h2>
                  <p className="policy-text">
                    Câu lạc bộ có quyền cập nhật, sửa đổi các điều khoản này
                    bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi
                    được đăng tải trên website. Việc bạn tiếp tục sử dụng dịch
                    vụ sau khi có thay đổi được coi là bạn đã chấp nhận các điều
                    khoản mới.
                  </p>
                </div>

                <div className="policy-section">
                  <h2 className="policy-section-title">13. Liên hệ</h2>
                  <p className="policy-text">
                    Nếu bạn có bất kỳ câu hỏi nào về các điều khoản sử dụng này,
                    vui lòng liên hệ với chúng tôi:
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

