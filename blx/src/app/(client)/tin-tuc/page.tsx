"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/crm/PageHeader";
import {
  newsApi,
  News,
  getNewsTypeLabel,
  formatNewsDate,
  parseNewsImages,
} from "@/services/api/news";

export default function TinTucPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [newsList, setNewsList] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "event", label: "Sự kiện" },
    { id: "achievement", label: "Thành tích" },
    { id: "news", label: "Tin tức" },
    { id: "announcement", label: "Thông báo" },
  ];

  /**
   * Fetch news data from API
   */
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const allNews = await newsApi.getAll();

        if (allNews.length > 0) {
          // Set first news as featured
          setFeaturedNews(allNews[0]);
          // Set remaining news as list
          setNewsList(allNews.slice(1));
        } else {
          setNewsList([]);
          setFeaturedNews(null);
        }
      } catch (err) {
        console.error("Error loading news data:", err);
        setError("Không thể tải dữ liệu tin tức. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  /**
   * Filter news by type
   */
  const getNewsType = (news: News): string => {
    const slug = news.slug?.toLowerCase() || "";
    const title = news.title?.toLowerCase() || "";

    if (slug.includes("su-kien") || title.includes("sự kiện")) {
      return "event";
    }
    if (slug.includes("thanh-tich") || title.includes("thành tích")) {
      return "achievement";
    }
    if (slug.includes("thong-bao") || title.includes("thông báo")) {
      return "announcement";
    }
    return "news";
  };

  const filteredNews =
    activeFilter === "all"
      ? newsList
      : newsList.filter((news) => getNewsType(news) === activeFilter);

  if (loading) {
    return (
      <div className="tin-tuc-page">
        <PageHeader
          title="Tin Tức & Sự Kiện"
          description="Cập nhật các hoạt động, thành tích và tin tức mới nhất từ câu lạc bộ"
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
      <div className="tin-tuc-page">
        <PageHeader
          title="Tin Tức & Sự Kiện"
          description="Cập nhật các hoạt động, thành tích và tin tức mới nhất từ câu lạc bộ"
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
    <div className="tin-tuc-page">
      {/* Page Header */}
      <PageHeader
        title="Tin Tức & Sự Kiện"
        description="Cập nhật các hoạt động, thành tích và tin tức mới nhất từ câu lạc bộ"
      />

      {/* Filter Bar */}
      <section className="news-filter-section">
        <div className="container">
          <div className="news-filter-bar">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`news-filter-btn ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="news-content-section">
        <div className="container">
          <div className="row">
            {/* Featured Section - Left */}
            {featuredNews && (
              <div className="col-lg-5 mb-4 mb-lg-0">
                <div className="news-featured-section">
                  <h3 className="news-featured-title">NỔI BẬT</h3>
                  <Link
                    href={`/tin-tuc/${featuredNews.id}`}
                    className="news-featured-card-link"
                  >
                    <div className="news-featured-card">
                      <div className="news-featured-image">
                        {featuredNews.featured_image_url ? (
                          <img
                            src={featuredNews.featured_image_url}
                            alt={featuredNews.title}
                            className="news-featured-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <i className="ti ti-trophy"></i>
                      </div>
                      <div className="news-featured-content">
                        <div className="news-featured-meta">
                          <span className="news-featured-tag">
                            {getNewsTypeLabel(
                              featuredNews.slug,
                              featuredNews.title
                            )}
                          </span>
                          <span className="news-featured-date">
                            <i className="ti ti-calendar"></i>
                            {formatNewsDate(
                              featuredNews.published_at ||
                                featuredNews.created_at
                            )}
                          </span>
                        </div>
                        <h4 className="news-featured-card-title">
                          {featuredNews.title}
                        </h4>
                        <p className="news-featured-card-description">
                          {featuredNews.excerpt ||
                            featuredNews.content?.substring(0, 200) ||
                            ""}
                          {featuredNews.content &&
                          featuredNews.content.length > 200
                            ? "..."
                            : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* News List - Right */}
            <div className={featuredNews ? "col-lg-7" : "col-lg-12"}>
              <div className="news-list-section">
                {filteredNews.length > 0 ? (
                  filteredNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`/tin-tuc/${news.id}`}
                      className="news-item-card-link"
                    >
                      <div className="news-item-card">
                        <div className="news-item-meta">
                          <span className="news-item-tag">
                            {getNewsTypeLabel(news.slug, news.title)}
                          </span>
                          <span className="news-item-date">
                            <i className="ti ti-calendar"></i>
                            {formatNewsDate(
                              news.published_at || news.created_at
                            )}
                          </span>
                        </div>
                        <h4 className="news-item-title">{news.title}</h4>
                        <p className="news-item-description">
                          {news.excerpt ||
                            news.content?.substring(0, 150) ||
                            ""}
                          {news.content && news.content.length > 150
                            ? "..."
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">
                      {activeFilter === "all"
                        ? "Chưa có tin tức nào."
                        : `Chưa có tin tức thuộc loại "${
                            filters.find((f) => f.id === activeFilter)?.label
                          }".`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
