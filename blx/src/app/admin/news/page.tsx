"use client";

import { useState, useEffect } from "react";
import { newsApi } from "@/services/api/news";

interface News {
  id: number;
  title: string;
  content: string;
  summary: string;
  author: string;
  category: "announcement" | "event" | "achievement" | "general" | "sports";
  status: "draft" | "published" | "archived";
  featured: boolean;
  imageUrl?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    author: "",
    category: "general" as
      | "announcement"
      | "event"
      | "achievement"
      | "general"
      | "sports",
    status: "draft" as "draft" | "published" | "archived",
    featured: false,
    imageUrl: "",
    tags: "",
  });

  // Fetch tin tức với pagination
  const fetchNews = async (page: number = pagination.page) => {
    setLoading(true);
    try {
      const response = await newsApi.getAllAdmin(page, pagination.limit);

      // Handle paginated response
      if (response && typeof response === "object" && "docs" in response) {
        setNews(response.docs);
        setPagination({
          page: response.page || page,
          limit: response.limit || pagination.limit,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
        });
      } else {
        // Fallback for array response
        setNews(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tin tức:", error);
      setNews([]);
      setPagination({
        page: 1,
        limit: 25,
        totalDocs: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "announcement":
        return "bg-primary";
      case "event":
        return "bg-success";
      case "achievement":
        return "bg-warning";
      case "general":
        return "bg-info";
      case "sports":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "announcement":
        return "Thông báo";
      case "event":
        return "Sự kiện";
      case "achievement":
        return "Thành tích";
      case "general":
        return "Chung";
      case "sports":
        return "Thể thao";
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success";
      case "draft":
        return "bg-warning";
      case "archived":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "published":
        return "Đã xuất bản";
      case "draft":
        return "Bản nháp";
      case "archived":
        return "Đã lưu trữ";
      default:
        return status;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        // Cập nhật tin tức hiện có
        await newsApi.update(editingNews.id, formData);
        // Cập nhật state local
        setNews(
          news.map((newsItem) =>
            newsItem.id === editingNews.id
              ? {
                  ...newsItem,
                  title: formData.title,
                  content: formData.content,
                  summary: formData.summary,
                  author: formData.author,
                  category: formData.category,
                  status: formData.status,
                  featured: formData.featured,
                  imageUrl: formData.imageUrl,
                  tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                  updatedAt: new Date().toISOString(),
                }
              : newsItem
          )
        );
      } else {
        // Tạo tin tức mới
        const newNews = await newsApi.create(formData);
        // Thêm vào state local
        setNews([
          ...news,
          {
            ...newNews,
            tags: formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingNews(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu tin tức:", error);
      alert("Lỗi khi lưu tin tức. Vui lòng thử lại.");
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      author: newsItem.author,
      category: newsItem.category,
      status: newsItem.status,
      featured: newsItem.featured,
      imageUrl: newsItem.imageUrl || "",
      tags: newsItem.tags.join(", "),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await newsApi.delete(id);
        // Xóa khỏi state local
        setNews(news.filter((newsItem) => newsItem.id !== id));
        alert("Xóa bài viết thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa tin tức:", error);
        alert("Lỗi khi xóa tin tức. Vui lòng thử lại.");
      }
    }
  };

  const handlePublish = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xuất bản bài viết này?")) {
      try {
        await newsApi.publish(id);
        // Cập nhật state local
        setNews(
          news.map((newsItem) =>
            newsItem.id === id
              ? {
                  ...newsItem,
                  status: "published" as const,
                  publishedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : newsItem
          )
        );
        alert("Xuất bản bài viết thành công!");
      } catch (error) {
        console.error("Lỗi khi xuất bản tin tức:", error);
        alert("Lỗi khi xuất bản bài viết. Vui lòng thử lại.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      author: "",
      category: "general" as const,
      status: "draft" as const,
      featured: false,
      imageUrl: "",
      tags: "",
    });
    setEditingNews(null);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm bài viết mới
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Nổi bật</th>
                  <th>Ngày xuất bản</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {news.map((newsItem) => (
                  <tr key={newsItem.id}>
                    <td>{newsItem.id}</td>
                    <td>
                      <div>
                        <strong>{newsItem.title}</strong>
                        <br />
                        <small className="text-muted">{newsItem.summary}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getCategoryColor(
                          newsItem.category
                        )}`}
                      >
                        {getCategoryDisplayName(newsItem.category)}
                      </span>
                    </td>
                    <td>{newsItem.author}</td>
                    <td>
                      <span
                        className={`badge ${getStatusColor(newsItem.status)}`}
                      >
                        {getStatusDisplayName(newsItem.status)}
                      </span>
                    </td>
                    <td>
                      {newsItem.featured ? (
                        <i className="fas fa-star text-warning"></i>
                      ) : (
                        <i className="far fa-star text-muted"></i>
                      )}
                    </td>
                    <td>
                      {newsItem.publishedAt
                        ? new Date(newsItem.publishedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "-"}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(newsItem)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {newsItem.status === "draft" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handlePublish(newsItem.id)}
                            title="Xuất bản"
                          >
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(newsItem.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalDocs > pagination.limit && (
            <div className="pagination-section mt-4">
              <nav aria-label="News pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-info">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDocs
                    )}{" "}
                    trong tổng số {pagination.totalDocs} tin tức
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => fetchNews(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      <i className="fas fa-chevron-left me-1"></i>
                      Trước
                    </button>
                    <span className="pagination-current">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchNews(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="btn btn-sm btn-outline-primary ms-2"
                    >
                      Sau
                      <i className="fas fa-chevron-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Modal cho Thêm/Chỉnh sửa Tin tức */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingNews ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Tiêu đề</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Danh mục</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value as
                                | "announcement"
                                | "event"
                                | "achievement"
                                | "general"
                                | "sports",
                            })
                          }
                          required
                        >
                          <option value="general">Chung</option>
                          <option value="announcement">Thông báo</option>
                          <option value="event">Sự kiện</option>
                          <option value="achievement">Thành tích</option>
                          <option value="sports">Thể thao</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tóm tắt</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="Tóm tắt ngắn gọn về bài viết..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nội dung</label>
                    <textarea
                      className="form-control"
                      rows={8}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Nội dung đầy đủ của bài viết..."
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tác giả</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.author}
                          onChange={(e) =>
                            setFormData({ ...formData, author: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          URL hình ảnh (tùy chọn)
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              imageUrl: e.target.value,
                            })
                          }
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Thẻ</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          placeholder="thẻ1, thẻ2, thẻ3"
                        />
                        <div className="form-text">
                          Phân cách các thẻ bằng dấu phẩy
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Trạng thái</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as
                                | "draft"
                                | "published"
                                | "archived",
                            })
                          }
                        >
                          <option value="draft">Bản nháp</option>
                          <option value="published">Đã xuất bản</option>
                          <option value="archived">Đã lưu trữ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label" htmlFor="featured">
                        Bài viết nổi bật
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNews ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
