"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/crm/PageHeader";

export default function TinTucDetailPage() {
  const params = useParams();
  const newsId = params?.id as string;

  // Mock data - Trong thực tế sẽ fetch từ API dựa trên newsId
  const newsDetail = {
    id: newsId,
    type: "achievement",
    typeLabel: "Thành tích",
    date: "15/10/2025",
    title: "Lễ Trao Đai Đen Kỳ 20 - Chúc Mừng 12 Võ Sinh Xuất Sắc",
    description:
      "Trong không khí trang trọng và đầy xúc động, câu lạc bộ Taekwondo đã tổ chức lễ trao đai đen kỳ thứ 20 cho 12 võ sinh xuất sắc. Đây là kết quả của hành trình rèn luyện không ngừng, sự kiên trì và nỗ lực vượt bậc của các võ sinh trong suốt thời gian qua.",
    image: "/client/images/news/featured-1.jpg",
    content: `
      <p>Trong không khí trang trọng và đầy xúc động, câu lạc bộ Taekwondo đã tổ chức lễ trao đai đen kỳ thứ 20 cho 12 võ sinh xuất sắc. Đây là kết quả của hành trình rèn luyện không ngừng, sự kiên trì và nỗ lực vượt bậc của các võ sinh trong suốt thời gian qua.</p>
      
      <p>Buổi lễ được diễn ra tại sân tập chính của câu lạc bộ với sự tham dự của đông đảo phụ huynh, học viên và các huấn luyện viên. Trong buổi lễ, các võ sinh đã thể hiện những kỹ thuật nâng cao, chứng minh năng lực và sự xứng đáng của mình để nhận đai đen.</p>
      
      <h3>Danh sách 12 võ sinh nhận đai đen:</h3>
      <ul>
        <li>Nguyễn Văn A - Đai Đen 1 Đằng</li>
        <li>Trần Thị B - Đai Đen 1 Đằng</li>
        <li>Lê Văn C - Đai Đen 1 Đằng</li>
        <li>Phạm Thị D - Đai Đen 1 Đằng</li>
        <li>Hoàng Văn E - Đai Đen 1 Đằng</li>
        <li>Võ Thị F - Đai Đen 1 Đằng</li>
        <li>Đặng Văn G - Đai Đen 1 Đằng</li>
        <li>Bùi Thị H - Đai Đen 1 Đằng</li>
        <li>Ngô Văn I - Đai Đen 1 Đằng</li>
        <li>Đinh Thị K - Đai Đen 1 Đằng</li>
        <li>Lý Văn L - Đai Đen 1 Đằng</li>
        <li>Mai Thị M - Đai Đen 1 Đằng</li>
      </ul>
      
      <p>Huấn luyện viên trưởng Nguyễn Văn A đã phát biểu: "Tôi rất tự hào về các võ sinh này. Họ đã thể hiện sự kiên trì, nỗ lực và đam mê trong suốt quá trình rèn luyện. Đai đen không chỉ là một cấp độ kỹ thuật mà còn là biểu tượng của sự trưởng thành, kỷ luật và tinh thần võ đạo."</p>
      
      <p>Các võ sinh nhận đai đen đã cam kết sẽ tiếp tục phấn đấu, không ngừng học hỏi và phát triển kỹ năng của mình. Họ cũng sẽ là những tấm gương cho các học viên khác trong câu lạc bộ.</p>
      
      <p>Buổi lễ kết thúc trong niềm vui và tự hào của toàn thể câu lạc bộ. Chúc mừng 12 võ sinh đã đạt được cột mốc quan trọng trong hành trình Taekwondo của mình!</p>
    `,
    relatedNews: [
      {
        id: 3,
        type: "achievement",
        typeLabel: "Thành tích",
        date: "10/10/2025",
        title: "Võ sinh đạt HCV Giải Vô địch Quốc gia 2025",
        description:
          "Câu lạc bộ tự hào công bố thành tích xuất sắc của võ sinh Nguyễn Văn A đạt Huy chương Vàng tại Giải Vô địch Taekwondo Quốc gia 2025.",
      },
      {
        id: 4,
        type: "news",
        typeLabel: "Tin tức",
        date: "05/10/2025",
        title: "Khai giảng lớp học mới - Tháng 10/2025",
        description:
          "Câu lạc bộ thông báo khai giảng các lớp học mới cho tháng 10/2025, phù hợp với mọi lứa tuổi và trình độ.",
      },
      {
        id: 5,
        type: "announcement",
        typeLabel: "Thông báo",
        date: "01/10/2025",
        title: "Thông báo lịch nghỉ lễ Quốc khánh",
        description:
          "Câu lạc bộ thông báo lịch nghỉ lễ Quốc khánh 2/9. Các lớp học sẽ được điều chỉnh phù hợp.",
      },
    ],
  };

  return (
    <div className="tin-tuc-detail-page">
      {/* Page Header */}
      <PageHeader
        title="Tin Tức & Sự Kiện"
        description="Cập nhật các hoạt động, thành tích và tin tức mới nhất từ câu lạc bộ"
      />

      {/* Breadcrumb */}
      <section className="news-detail-breadcrumb">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/tin-tuc">Tin tức</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {newsDetail.title}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="news-detail-content">
        <div className="container">
          <div className="row">
            {/* Main Article */}
            <div className="col-lg-8 mb-4 mb-lg-0">
              <article className="news-detail-article">
                {/* Article Header */}
                <div className="news-detail-header">
                  <div className="news-detail-meta">
                    <span className="news-detail-tag">{newsDetail.typeLabel}</span>
                    <span className="news-detail-date">
                      <i className="ti ti-calendar"></i>
                      {newsDetail.date}
                    </span>
                  </div>
                  <h1 className="news-detail-title">{newsDetail.title}</h1>
                  <p className="news-detail-excerpt">{newsDetail.description}</p>
                </div>

                {/* Article Image */}
                <div className="news-detail-image">
                  <div className="news-detail-image-placeholder">
                    <i className="ti ti-photo"></i>
                    <span>Hình ảnh bài viết</span>
                  </div>
                </div>

                {/* Article Content */}
                <div
                  className="news-detail-body"
                  dangerouslySetInnerHTML={{ __html: newsDetail.content }}
                />

                {/* Article Footer */}
                <div className="news-detail-footer">
                  <div className="news-detail-share">
                    <span className="share-label">Chia sẻ:</span>
                    <div className="share-buttons">
                      <button className="share-btn" title="Facebook">
                        <i className="ti ti-brand-facebook"></i>
                      </button>
                      <button className="share-btn" title="Twitter">
                        <i className="ti ti-brand-twitter"></i>
                      </button>
                      <button className="share-btn" title="Copy Link">
                        <i className="ti ti-link"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <aside className="news-detail-sidebar">
                {/* Related News */}
                <div className="sidebar-section">
                  <h3 className="sidebar-title">Tin liên quan</h3>
                  <div className="related-news-list">
                    {newsDetail.relatedNews.map((news) => (
                      <Link
                        key={news.id}
                        href={`/tin-tuc/${news.id}`}
                        className="related-news-item"
                      >
                        <div className="related-news-meta">
                          <span className="related-news-tag">{news.typeLabel}</span>
                          <span className="related-news-date">
                            <i className="ti ti-calendar"></i>
                            {news.date}
                          </span>
                        </div>
                        <h4 className="related-news-title">{news.title}</h4>
                        <p className="related-news-description">
                          {news.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Back to List */}
                <div className="sidebar-section">
                  <Link href="/tin-tuc" className="btn btn-outline-primary w-100">
                    <i className="ti ti-arrow-left me-2"></i>
                    Quay lại danh sách
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

