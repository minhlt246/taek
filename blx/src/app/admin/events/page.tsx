"use client";

import { useState, useEffect } from "react";
import { eventsApi } from "@/services/api/events";

interface Event {
  id: number;
  title: string;
  description: string;
  type: "tournament" | "seminar" | "graduation" | "social" | "other";
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationFee: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizer: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "tournament" as
      | "tournament"
      | "seminar"
      | "graduation"
      | "social"
      | "other",
    location: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    maxParticipants: 50,
    registrationFee: 0,
    status: "upcoming" as "upcoming" | "ongoing" | "completed" | "cancelled",
    organizer: "",
  });

  // Fetch sự kiện với pagination
  const fetchEvents = async (page: number = pagination.page) => {
    setLoading(true);
    try {
      const response = await eventsApi.getAll(page, pagination.limit);

      // Handle paginated response
      if (response && typeof response === "object" && "docs" in response) {
        setEvents(response.docs);
        setPagination({
          page: response.page || page,
          limit: response.limit || pagination.limit,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
        });
      } else {
        // Fallback for array response
        setEvents(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự kiện:", error);
      setEvents([]);
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
    fetchEvents();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return eventDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tournament":
        return "bg-danger";
      case "seminar":
        return "bg-info";
      case "graduation":
        return "bg-success";
      case "social":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-primary";
      case "ongoing":
        return "bg-success";
      case "completed":
        return "bg-secondary";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Cập nhật sự kiện hiện có
        await eventsApi.update(editingEvent.id, formData);
        // Cập nhật state local
        setEvents(
          events.map((event) =>
            event.id === editingEvent.id
              ? { ...event, ...formData, updatedAt: new Date().toISOString() }
              : event
          )
        );
      } else {
        // Tạo sự kiện mới
        const newEvent = await eventsApi.create(formData);
        // Thêm vào state local
        setEvents([
          ...events,
          {
            ...newEvent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      alert("Lỗi khi lưu sự kiện. Vui lòng thử lại.");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      maxParticipants: event.maxParticipants,
      registrationFee: event.registrationFee,
      status: event.status,
      organizer: event.organizer,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await eventsApi.delete(id);
        // Xóa khỏi state local
        setEvents(events.filter((event) => event.id !== id));
        alert("Xóa sự kiện thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        alert("Lỗi khi xóa sự kiện. Vui lòng thử lại.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "tournament",
      location: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      maxParticipants: 50,
      registrationFee: 0,
      status: "upcoming",
      organizer: "",
    });
    setEditingEvent(null);
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
    <div className="events-page">
      <div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm sự kiện mới
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
                  <th>Loại</th>
                  <th>Địa điểm</th>
                  <th>Ngày & Giờ</th>
                  <th>Người tham gia</th>
                  <th>Phí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>
                      <div>
                        <strong>{event.title}</strong>
                        <br />
                        <small className="text-muted">
                          {event.description}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td>{event.location}</td>
                    <td>
                      <div>
                        <strong>
                          {formatDateTime(event.startDate, event.startTime)}
                        </strong>
                        {event.endDate !== event.startDate && (
                          <>
                            <br />
                            <small>
                              to {formatDateTime(event.endDate, event.endTime)}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      {event.currentParticipants}/{event.maxParticipants}
                      <div className="progress mt-1" style={{ height: "5px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              (event.currentParticipants /
                                event.maxParticipants) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td>
                      {event.registrationFee > 0
                        ? formatCurrency(event.registrationFee)
                        : "Free"}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(event)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(event.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalDocs > pagination.limit && (
            <div className="pagination-section mt-4">
              <nav aria-label="Events pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-info">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDocs
                    )}{" "}
                    trong tổng số {pagination.totalDocs} sự kiện
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => fetchEvents(pagination.page - 1)}
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
                      onClick={() => fetchEvents(pagination.page + 1)}
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

      {/* Modal cho Thêm/Chỉnh sửa Sự kiện */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEvent ? "Chỉnh sửa sự kiện" : "Thêm sự kiện mới"}
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
                        <label className="form-label">Tiêu đề sự kiện</label>
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
                        <label className="form-label">Loại sự kiện</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as
                                | "tournament"
                                | "seminar"
                                | "graduation"
                                | "social"
                                | "other",
                            })
                          }
                          required
                        >
                          <option value="tournament">Giải đấu</option>
                          <option value="seminar">Hội thảo</option>
                          <option value="graduation">Lễ tốt nghiệp</option>
                          <option value="social">Xã hội</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa điểm</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ngày bắt đầu</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ngày kết thúc</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giờ bắt đầu</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giờ kết thúc</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Số người tham gia tối đa
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxParticipants: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phí đăng ký (VND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.registrationFee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              registrationFee: parseInt(e.target.value),
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Organizer</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.organizer}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organizer: e.target.value,
                            })
                          }
                          required
                        />
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
                                | "upcoming"
                                | "ongoing"
                                | "completed"
                                | "cancelled",
                            })
                          }
                        >
                          <option value="upcoming">Sắp tới</option>
                          <option value="ongoing">Đang diễn ra</option>
                          <option value="completed">Đã hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
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
                    {editingEvent ? "Cập nhật" : "Tạo mới"}
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
