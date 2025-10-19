"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface Coach {
  id: number;
  coach_code: string;
  name: string;
  email?: string;
  phone?: string;
  role: "head_coach" | "main_manager" | "assistant_manager" | "assistant";
  experience_years?: number;
  specialization?: string;
  is_active: boolean;
  created_at: string;
}

export default function CoachesPage() {
  const { account } = useAccountStore();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<
    "all" | "head_coach" | "main_manager" | "assistant_manager" | "assistant"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    coach_code: "",
    name: "",
    email: "",
    phone: "",
    role: "assistant" as
      | "head_coach"
      | "main_manager"
      | "assistant_manager"
      | "assistant",
    experience_years: 0,
    specialization: "",
    is_active: true,
  });

  useEffect(() => {
    // Lấy danh sách huấn luyện viên từ API
    const fetchCoaches = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/coaches');
        // setCoaches(response.data);
        setCoaches([]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách huấn luyện viên:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.coach_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coach.email &&
        coach.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || coach.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "head_coach":
        return "bg-danger";
      case "main_manager":
        return "bg-warning";
      case "assistant_manager":
        return "bg-info";
      case "assistant":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "head_coach":
        return "Huấn luyện viên trưởng";
      case "main_manager":
        return "Quản lý chính";
      case "assistant_manager":
        return "Quản lý phụ";
      case "assistant":
        return "Trợ giảng";
      default:
        return role;
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      coach_code: coach.coach_code,
      name: coach.name,
      email: coach.email || "",
      phone: coach.phone || "",
      role: coach.role,
      experience_years: coach.experience_years || 0,
      specialization: coach.specialization || "",
      is_active: coach.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoach) {
        // Update existing coach
        setCoaches(
          coaches.map((coach) =>
            coach.id === editingCoach.id
              ? { ...coach, ...formData, updated_at: new Date().toISOString() }
              : coach
          )
        );
      } else {
        // Create new coach
        const newCoach = {
          id: Math.max(...coaches.map((c) => c.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setCoaches([...coaches, newCoach]);
      }
      setShowModal(false);
      setEditingCoach(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu huấn luyện viên:", error);
      alert("Lỗi khi lưu huấn luyện viên. Vui lòng thử lại.");
    }
  };

  const resetForm = () => {
    setFormData({
      coach_code: "",
      name: "",
      email: "",
      phone: "",
      role: "assistant",
      experience_years: 0,
      specialization: "",
      is_active: true,
    });
    setEditingCoach(null);
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
    <div className="admin-page">
      <div className="page-header">
        <h2>Quản lý huấn luyện viên</h2>
        <p>Quản lý tất cả huấn luyện viên và giảng viên</p>
      </div>

      {/* Filters and Actions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="m-0 font-weight-bold text-primary">
                Danh sách huấn luyện viên
              </h6>
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <i className="fas fa-plus mr-2"></i>
                Thêm huấn luyện viên mới
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm huấn luyện viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) =>
                  setFilterRole(
                    e.target.value as
                      | "all"
                      | "head_coach"
                      | "main_manager"
                      | "assistant_manager"
                      | "assistant"
                  )
                }
              >
                <option value="all">Tất cả vai trò</option>
                <option value="head_coach">Huấn luyện viên trưởng</option>
                <option value="main_manager">Quản lý chính</option>
                <option value="assistant_manager">Quản lý phụ</option>
                <option value="assistant">Trợ giảng</option>
              </select>
            </div>
          </div>

          {/* Coaches Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Kinh nghiệm</th>
                  <th>Chuyên môn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoaches.map((coach) => (
                  <tr key={coach.id}>
                    <td>{coach.id}</td>
                    <td>{coach.coach_code}</td>
                    <td>{coach.name}</td>
                    <td>{coach.email || "-"}</td>
                    <td>{coach.phone || "-"}</td>
                    <td>
                      <span
                        className={`badge ${getRoleBadgeClass(coach.role)}`}
                      >
                        {getRoleDisplayName(coach.role)}
                      </span>
                    </td>
                    <td>
                      {coach.experience_years
                        ? `${coach.experience_years} năm`
                        : "-"}
                    </td>
                    <td>{coach.specialization || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          coach.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {coach.is_active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(coach)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoaches.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                Không tìm thấy huấn luyện viên nào phù hợp với tiêu chí tìm
                kiếm.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Edit Coach */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCoach
                    ? "Chỉnh sửa huấn luyện viên"
                    : "Thêm huấn luyện viên mới"}
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
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Mã huấn luyện viên</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.coach_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coach_code: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tên</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Vai trò</label>
                        <select
                          className="form-select"
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as any,
                            })
                          }
                          required
                        >
                          <option value="assistant">Trợ giảng</option>
                          <option value="assistant_manager">Quản lý phụ</option>
                          <option value="main_manager">Quản lý chính</option>
                          <option value="head_coach">
                            Huấn luyện viên trưởng
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Kinh nghiệm (năm)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.experience_years}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience_years: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Chuyên môn</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialization: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label">Hoạt động</label>
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
                    {editingCoach ? "Cập nhật" : "Tạo mới"}
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
