"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { coachesApi, CoachResponse } from "@/services/api/coaches";
import { clubsApi } from "@/services/api/clubs";
import { beltLevelsApi } from "@/services/api/belt-levels";
import http from "@/services/http";

// Sử dụng CoachResponse từ API service thay vì interface local
type Coach = CoachResponse;

export default function CoachesPage() {
  const { account } = useAccountStore();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [clubs, setClubs] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    coach_code: "",
    name: "",
    email: "",
    phone: "",
    role: "admin" as "admin" | "owner",
    belt_level_id: "",
    experience_years: "",
    bio: "",
    is_active: true,
    club_id: 0,
    branch_id: 0,
  });

  /**
   * Fetch coaches and clubs data from API
   * Lấy dữ liệu raw từ backend để có đầy đủ relations (club, belt_level)
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      // Load clubs, coaches và belt_levels data
      const [clubsData, coachesResponse, beltLevelsData] = await Promise.all([
        clubsApi.getAll(),
        http.get<CoachResponse[]>("/coaches"),
        beltLevelsApi.getAll(),
      ]);

      setClubs(Array.isArray(clubsData) ? clubsData : []);

      // Backend trả về array trực tiếp
      const coachesData: CoachResponse[] = Array.isArray(coachesResponse.data)
        ? coachesResponse.data
        : [];

      // Tạo map belt_levels để map vào coaches
      const beltLevelMap = new Map();
      if (Array.isArray(beltLevelsData)) {
        beltLevelsData.forEach((belt) => {
          beltLevelMap.set(belt.id, belt);
        });
      }

      // Map belt_level vào coaches nếu có belt_level_id
      const coachesWithBeltLevel = coachesData.map((coach) => {
        if (coach.belt_level_id && !coach.belt_level) {
          const beltLevel = beltLevelMap.get(coach.belt_level_id);
          if (beltLevel) {
            return {
              ...coach,
              belt_level: {
                id: beltLevel.id,
                name: beltLevel.name,
                color: beltLevel.color,
              },
            };
          }
        }
        return coach;
      });

      setCoaches(coachesWithBeltLevel);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setCoaches([]);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCoaches = coaches.filter((coach) => {
    const coachName = coach.ho_va_ten || coach.name || "";
    const coachCode = coach.ma_hoi_vien || (coach as any).coach_code || "";
    const matchesSearch =
      (coachName &&
        coachName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coachCode &&
        coachCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.email &&
        coach.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.club?.name &&
        coach.club.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Helper function để lấy màu text cho vai trò (không có background)
  const getRoleTextColor = (role: string): string => {
    switch (role) {
      case "owner":
        return "#dc3545"; // danger red
      case "admin":
        return "#0dcaf0"; // info cyan
      default:
        return "#6c757d"; // secondary gray
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "Chủ sở hữu";
      case "admin":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      coach_code: coach.ma_hoi_vien || (coach as any).coach_code || "",
      name: coach.ho_va_ten || coach.name || "",
      email: coach.email || "",
      phone: coach.phone || "",
      role:
        coach.role === "owner" || coach.role === "admin" ? coach.role : "admin",
      belt_level_id: coach.belt_level_id ? String(coach.belt_level_id) : "",
      experience_years: coach.experience_years
        ? String(coach.experience_years)
        : "",
      bio: coach.bio || "",
      is_active: coach.is_active !== false, // Mặc định true nếu undefined
      club_id: coach.club_id || 0,
      branch_id: coach.branch_id || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up form data: remove empty strings and convert 0 to undefined for optional fields
      // Map frontend fields to backend fields: coach_code -> ma_hoi_vien, name -> ho_va_ten
      const cleanData: any = {
        ho_va_ten: formData.name.trim(),
        ma_hoi_vien: formData.coach_code.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role || undefined,
        bio: formData.bio.trim() || undefined,
        club_id: formData.club_id || undefined,
        branch_id: formData.branch_id || undefined,
        is_active: formData.is_active,
      };

      // Parse belt_level_id from string to number if provided
      if (formData.belt_level_id && formData.belt_level_id.trim() !== "") {
        const beltLevelId = parseInt(formData.belt_level_id.trim());
        if (!isNaN(beltLevelId) && beltLevelId > 0) {
          cleanData.belt_level_id = beltLevelId;
        }
      }

      // Parse experience_years from string to number if provided
      if (
        formData.experience_years &&
        formData.experience_years.trim() !== ""
      ) {
        const experienceYears = parseInt(formData.experience_years.trim());
        if (!isNaN(experienceYears) && experienceYears >= 0) {
          cleanData.experience_years = experienceYears;
        }
      }

      // Remove undefined, null, empty string, or 0 values for optional fields
      Object.keys(cleanData).forEach((key) => {
        if (
          cleanData[key] === undefined ||
          cleanData[key] === null ||
          cleanData[key] === ""
        ) {
          delete cleanData[key];
        }
        // Remove 0 values for optional number fields
        if (
          (key === "club_id" || key === "branch_id") &&
          cleanData[key] === 0
        ) {
          delete cleanData[key];
        }
      });

      if (editingCoach) {
        const updateResponse = await coachesApi.update(
          editingCoach.id,
          cleanData
        );
        console.log("[CoachesPage] Update response:", updateResponse);
        alert("Cập nhật huấn luyện viên thành công!");
      } else {
        const createResponse = await coachesApi.create(cleanData);
        console.log("[CoachesPage] Create response:", createResponse);
        alert("Tạo huấn luyện viên mới thành công!");
      }

      // Refresh data
      await fetchData();

      setShowModal(false);
      setEditingCoach(null);
      resetForm();
    } catch (error: any) {
      console.error("Lỗi khi lưu huấn luyện viên:", error);
      let errorMessage = "Lỗi khi lưu huấn luyện viên. Vui lòng thử lại.";

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa huấn luyện viên này?")) {
      return;
    }

    try {
      await coachesApi.delete(id);
      alert("Xóa huấn luyện viên thành công!");

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error("Lỗi khi xóa huấn luyện viên:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi xóa huấn luyện viên. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      coach_code: "",
      name: "",
      email: "",
      phone: "",
      role: "admin",
      belt_level_id: "",
      experience_years: "",
      bio: "",
      is_active: true,
      club_id: 0,
      branch_id: 0,
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
                  placeholder="Tìm kiếm HLV hoặc CLB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                  <th>CLB</th>
                  <th>Vai trò</th>
                  <th>Cấp đai</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoaches.map((coach) => {
                  // Debug: Log từng coach để kiểm tra
                  if (process.env.NODE_ENV === "development") {
                    console.log("[CoachesPage] Rendering coach:", {
                      id: coach.id,
                      name: coach.name,
                      coach_code: coach.coach_code,
                      club: coach.club,
                      belt_level: coach.belt_level,
                    });
                  }

                  return (
                    <tr key={coach.id}>
                      <td>{coach.id}</td>
                      <td>
                        {(coach.ma_hoi_vien || (coach as any).coach_code) &&
                        (
                          coach.ma_hoi_vien || (coach as any).coach_code
                        ).trim() ? (
                          <span style={{ color: "#6c757d" }}>
                            {coach.ma_hoi_vien || (coach as any).coach_code}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <strong>
                          {coach.ho_va_ten ||
                            coach.name ||
                            (coach as any).full_name ||
                            (coach as any).username ||
                            `HLV #${coach.id}`}
                        </strong>
                      </td>
                      <td>{coach.email || "-"}</td>
                      <td>{coach.phone || "-"}</td>
                      <td>
                        {coach.ma_clb && coach.ma_clb.trim() ? (
                          <span style={{ color: "#ffc107" }}>
                            {coach.ma_clb}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            color: getRoleTextColor(coach.role || "admin"),
                          }}
                        >
                          {getRoleDisplayName(coach.role || "admin")}
                        </span>
                      </td>
                      <td>
                        {coach.belt_level && coach.belt_level.name ? (
                          <span
                            style={{ color: coach.belt_level.color || "#000" }}
                          >
                            {coach.belt_level.name}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              coach.is_active !== false
                                ? "#198754" // success green
                                : "#ffc107", // warning yellow
                          }}
                        >
                          {coach.is_active !== false
                            ? "Hoạt động"
                            : "Không hoạt động"}
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
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(coach.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                              role: e.target.value as "admin" | "owner",
                            })
                          }
                          required
                        >
                          <option value="admin">Quản trị viên</option>
                          <option value="owner">Chủ sở hữu</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cấp đai</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.belt_level_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              belt_level_id: e.target.value,
                            })
                          }
                          placeholder="Nhập cấp đai"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Kinh nghiệm</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.experience_years}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience_years: e.target.value,
                            })
                          }
                          placeholder="Nhập số năm kinh nghiệm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tiểu sử</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bio: e.target.value,
                        })
                      }
                      placeholder="Mô tả về huấn luyện viên..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Câu lạc bộ</label>
                    <select
                      className="form-select"
                      value={formData.club_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          club_id: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Chọn CLB</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
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
