"use client";

import { useState, useEffect } from "react";
import { newsApi } from "@/services/adminApi";

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

  useEffect(() => {
    // Simulate API call to fetch news
    const fetchNews = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setNews([
          {
            id: 1,
            title: "Spring Tournament 2024 Registration Now Open",
            content:
              "We are excited to announce that registration for our annual Spring Tournament 2024 is now open. This tournament will feature competitions across all belt levels and age groups...",
            summary:
              "Registration for Spring Tournament 2024 is now open for all students.",
            author: "Master Nguyen Van A",
            category: "announcement",
            status: "published",
            featured: true,
            imageUrl: "/images/tournament-2024.jpg",
            tags: ["tournament", "competition", "registration"],
            publishedAt: "2024-02-15",
            createdAt: "2024-02-10",
            updatedAt: "2024-02-15",
          },
          {
            id: 2,
            title: "New Black Belt Achievements",
            content:
              "Congratulations to our students who have successfully achieved their black belt this month. Their dedication and hard work have paid off...",
            summary:
              "Several students have achieved their black belt this month.",
            author: "Master Tran Thi B",
            category: "achievement",
            status: "published",
            featured: false,
            imageUrl: "/images/black-belt-ceremony.jpg",
            tags: ["black belt", "achievement", "graduation"],
            publishedAt: "2024-02-10",
            createdAt: "2024-02-08",
            updatedAt: "2024-02-10",
          },
          {
            id: 3,
            title: "Self-Defense Workshop This Weekend",
            content:
              "Join us this weekend for a special self-defense workshop conducted by Grand Master Le Van C. Learn essential techniques for personal safety...",
            summary:
              "Special self-defense workshop this weekend with Grand Master Le Van C.",
            author: "Club Management",
            category: "event",
            status: "published",
            featured: false,
            imageUrl: "/images/self-defense-workshop.jpg",
            tags: ["workshop", "self-defense", "safety"],
            publishedAt: "2024-02-12",
            createdAt: "2024-02-05",
            updatedAt: "2024-02-12",
          },
          {
            id: 4,
            title: "Club Anniversary Celebration Success",
            content:
              "Our 10th anniversary celebration was a huge success! Thank you to all students, parents, and instructors who made this event memorable...",
            summary:
              "Successful 10th anniversary celebration with great participation.",
            author: "Club Management",
            category: "general",
            status: "published",
            featured: true,
            imageUrl: "/images/anniversary-celebration.jpg",
            tags: ["anniversary", "celebration", "success"],
            publishedAt: "2024-02-01",
            createdAt: "2024-01-30",
            updatedAt: "2024-02-01",
          },
          {
            id: 5,
            title: "New Training Schedule for March",
            content:
              "We are updating our training schedule for March to better accommodate our growing student base. Please check the new schedule...",
            summary: "Updated training schedule for March is now available.",
            author: "Master Pham Thi D",
            category: "announcement",
            status: "draft",
            featured: false,
            tags: ["schedule", "training", "march"],
            createdAt: "2024-02-14",
            updatedAt: "2024-02-14",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        // Update existing news
        await newsApi.update(editingNews.id, formData);
        // Update local state
        setNews(
          news.map((newsItem) =>
            newsItem.id === editingNews.id
              ? {
                  ...newsItem,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : newsItem
          )
        );
      } else {
        // Create new news
        const newNews = await newsApi.create(formData);
        // Add to local state
        setNews([
          ...news,
          {
            ...newNews,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingNews(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save news:", error);
      alert("Failed to save news. Please try again.");
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
    if (confirm("Are you sure you want to delete this news article?")) {
      try {
        await newsApi.delete(id);
        // Remove from local state
        setNews(news.filter((newsItem) => newsItem.id !== id));
        alert("News article deleted successfully!");
      } catch (error) {
        console.error("Failed to delete news:", error);
        alert("Failed to delete news. Please try again.");
      }
    }
  };

  const handlePublish = async (id: number) => {
    if (confirm("Are you sure you want to publish this article?")) {
      try {
        await newsApi.publish(id);
        // Update local state
        setNews(
          news.map((newsItem) =>
            newsItem.id === id
              ? {
                  ...newsItem,
                  status: "published",
                  publishedAt: new Date().toISOString(),
                }
              : newsItem
          )
        );
        alert("Article published successfully!");
      } catch (error) {
        console.error("Failed to publish news:", error);
        alert("Failed to publish article. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      author: "",
      category: "general",
      status: "draft",
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
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="page-header">
        <h2>News Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Article
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Published</th>
                  <th>Actions</th>
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
                        {newsItem.category}
                      </span>
                    </td>
                    <td>{newsItem.author}</td>
                    <td>
                      <span
                        className={`badge ${getStatusColor(newsItem.status)}`}
                      >
                        {newsItem.status}
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
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {newsItem.status === "draft" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handlePublish(newsItem.id)}
                            title="Publish"
                          >
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(newsItem.id)}
                          title="Delete"
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
        </div>
      </div>

      {/* Modal for Add/Edit News */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingNews ? "Edit News Article" : "Add New News Article"}
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
                        <label className="form-label">Title</label>
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
                        <label className="form-label">Category</label>
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
                          <option value="general">General</option>
                          <option value="announcement">Announcement</option>
                          <option value="event">Event</option>
                          <option value="achievement">Achievement</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Summary</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="Brief summary of the article..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows={8}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Full article content..."
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Author</label>
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
                          Image URL (optional)
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
                        <label className="form-label">Tags</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          placeholder="tag1, tag2, tag3"
                        />
                        <div className="form-text">
                          Separate tags with commas
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
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
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
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
                        Featured Article
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNews ? "Update" : "Create"}
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
