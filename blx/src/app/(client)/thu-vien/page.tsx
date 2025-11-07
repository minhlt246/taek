"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/crm/PageHeader";
import { galleryApi, GalleryImage, GalleryVideo } from "@/services/api/gallery";

export default function ThuVienPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "training" | "competition" | "events"
  >("all");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "training", label: "Tập luyện" },
    { id: "competition", label: "Thi đấu" },
    { id: "events", label: "Sự kiện" },
  ];

  /**
   * Fetch gallery data from API
   */
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [imagesData, videosData] = await Promise.all([
          galleryApi.getImages(),
          galleryApi.getVideos(),
        ]);

        console.log("[ThuVienPage] Images data:", imagesData);
        console.log("[ThuVienPage] Videos data:", videosData);

        setImages(imagesData);
        setVideos(videosData);
      } catch (err) {
        console.error("Error loading gallery data:", err);
        setError("Không thể tải dữ liệu thư viện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  const filteredImages =
    activeFilter === "all"
      ? images
      : images.filter((img) => img.category === activeFilter);

  if (loading) {
    return (
      <div className="thu-vien-page">
        <PageHeader
          title="Thư viện"
          description="Kho ảnh và video của câu lạc bộ"
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
      <div className="thu-vien-page">
        <PageHeader
          title="Thư viện"
          description="Kho ảnh và video của câu lạc bộ"
        />
        <div className="container py-5">
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thu-vien-page">
      {/* Page Header */}
      <PageHeader
        title="Thư viện"
        description="Kho ảnh và video của câu lạc bộ"
      />

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          {/* Gallery Filters */}
          <div className="gallery-filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() =>
                  setActiveFilter(
                    filter.id as "all" | "training" | "competition" | "events"
                  )
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {filteredImages.length > 0 ? (
            <div className="gallery-grid">
              {filteredImages.map((image) => (
                <div key={image.id} className="gallery-item">
                  <img
                    src={image.src}
                    alt={image.badge}
                    className="gallery-image"
                    onError={(e) => {
                      e.currentTarget.src = "/styles/images/logo.png";
                    }}
                  />
                  <div className="gallery-overlay">
                    <i className="ti ti-zoom-in"></i>
                  </div>
                  <div className="gallery-badge">{image.badge}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">Chưa có ảnh nào trong danh mục này.</p>
            </div>
          )}

          {/* Video Section */}
          {videos.length > 0 && (
            <div className="video-section">
              <h3 className="video-section-title text-center mb-4">
                Video nổi bật
              </h3>
              <div className="video-grid">
                {videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="video-thumbnail"
                      onError={(e) => {
                        e.currentTarget.src = "/styles/images/logo.png";
                      }}
                    />
                    <div className="video-play-button">
                      <i className="ti ti-player-play"></i>
                    </div>
                    <div className="video-title">{video.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
