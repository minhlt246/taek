"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { usersApi } from "@/services/api/users";
import { beltLevelsApi } from "@/services/api/belt-levels";
import http from "@/services/http";

interface VoSinh {
  id: number;
  ho_va_ten: string;
  ngay_thang_nam_sinh: string;
  ma_hoi_vien: string;
  ma_clb?: string | null;
  ma_don_vi?: string | null;
  quyen_so: number;
  cap_dai_id: number;
  belt_level?: {
    id: number;
    name: string;
    color?: string;
  };
  gioi_tinh: "Nam" | "Nữ";
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  active_status: boolean;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const { account } = useAccountStore();
  const [voSinh, setVoSinh] = useState<VoSinh[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVoSinh, setEditingVoSinh] = useState<VoSinh | null>(null);
  const [formData, setFormData] = useState({
    ho_va_ten: "",
    ngay_thang_nam_sinh: "",
    ma_hoi_vien: "",
    ma_clb: "",
    ma_don_vi: "",
    quyen_so: 1,
    cap_dai_id: 1,
    gioi_tinh: "Nam" as "Nam" | "Nữ",
    email: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    active_status: true,
  });

  /**
   * Fetch võ sinh data from API
   * Lấy raw data từ backend để có đầy đủ thông tin
   */
  const fetchVoSinh = async () => {
    setLoading(true);
    try {
      // Fetch users và belt_levels để map cấp đai
      const [usersResponse, beltLevelsData] = await Promise.all([
        http.get<VoSinh[]>("/users"),
        beltLevelsApi.getAll(),
      ]);

      const data: VoSinh[] = Array.isArray(usersResponse.data) ? usersResponse.data : [];

      // Tạo map belt_levels để map vào users
      const beltLevelMap = new Map();
      if (Array.isArray(beltLevelsData)) {
        beltLevelsData.forEach((belt) => {
          beltLevelMap.set(belt.id, belt);
        });
      }

      // Backend đã trả về belt_level, nhưng vẫn có fallback nếu không có
      const usersWithBeltLevel = data.map((user) => {
        // Nếu backend đã trả về belt_level, sử dụng nó
        if (user.belt_level) {
          return user;
        }
        // Fallback: Map belt_level từ beltLevelMap nếu có cap_dai_id nhưng chưa có belt_level
        if (user.cap_dai_id) {
          const beltLevel = beltLevelMap.get(user.cap_dai_id);
          if (beltLevel) {
            return {
              ...user,
              belt_level: {
                id: beltLevel.id,
                name: beltLevel.name,
                color: beltLevel.color,
              },
            };
          }
        }
        return user;
      });

      setVoSinh(usersWithBeltLevel);
    } catch (error) {
      console.error("Lỗi khi tải danh sách võ sinh:", error);
      setVoSinh([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoSinh();
  }, []);

  // Helper function to get belt level color with proper contrast
  const getBeltLevelColor = (colorName?: string): string => {
    if (!colorName) return '#000';
    
    const colorMap: Record<string, string> = {
      'White': '#000', // Black text on white background
      'Orange': '#ff8c00',
      'Violet': '#8b00ff',
      'Purple': '#8b00ff',
      'Yellow': '#ff8c00', // Dark orange for better contrast
      'Green': '#198754',
      'Blue': '#0d6efd',
      'Red': '#dc3545',
      'Red-Black': '#000',
      'Black': '#000',
    };
    
    // Try exact match first
    if (colorMap[colorName]) {
      return colorMap[colorName];
    }
    
    // Try case-insensitive match
    const lowerColor = colorName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (key.toLowerCase() === lowerColor) {
        return value;
      }
    }
    
    // Default to black for unknown colors
    return '#000';
  };

  // Helper function to get belt level background color
  const getBeltLevelBgColor = (colorName?: string): string => {
    if (!colorName) return 'transparent';
    
    const bgColorMap: Record<string, string> = {
      'White': '#f8f9fa', // Light gray background
      'Orange': '#fff3cd',
      'Violet': '#e7d5ff',
      'Purple': '#e7d5ff',
      'Yellow': '#fff3cd',
      'Green': '#d1e7dd',
      'Blue': '#cfe2ff',
      'Red': '#f8d7da',
      'Red-Black': '#212529',
      'Black': '#212529',
    };
    
    // Try exact match first
    if (bgColorMap[colorName]) {
      return bgColorMap[colorName];
    }
    
    // Try case-insensitive match
    const lowerColor = colorName.toLowerCase();
    for (const [key, value] of Object.entries(bgColorMap)) {
      if (key.toLowerCase() === lowerColor) {
        return value;
      }
    }
    
    return 'transparent';
  };

  const filteredVoSinh = voSinh.filter((voSinh) => {
    const matchesSearch =
      voSinh.ho_va_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voSinh.ma_hoi_vien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voSinh.ma_clb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (voSinh.email &&
        voSinh.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleEdit = (voSinh: VoSinh) => {
    setEditingVoSinh(voSinh);
    setFormData({
      ho_va_ten: voSinh.ho_va_ten,
      ngay_thang_nam_sinh: voSinh.ngay_thang_nam_sinh,
      ma_hoi_vien: voSinh.ma_hoi_vien,
      ma_clb: voSinh.ma_clb,
      ma_don_vi: voSinh.ma_don_vi,
      quyen_so: voSinh.quyen_so,
      cap_dai_id: voSinh.cap_dai_id,
      gioi_tinh: voSinh.gioi_tinh,
      email: voSinh.email || "",
      phone: voSinh.phone || "",
      address: voSinh.address || "",
      emergency_contact_name: voSinh.emergency_contact_name || "",
      emergency_contact_phone: voSinh.emergency_contact_phone || "",
      active_status: voSinh.active_status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up form data: remove empty strings and convert 0 to undefined for optional fields
      const cleanData: any = {
        ho_va_ten: formData.ho_va_ten.trim(),
        email: formData.email.trim() || undefined,
        ngay_thang_nam_sinh: formData.ngay_thang_nam_sinh || undefined,
        gioi_tinh: formData.gioi_tinh || undefined,
        ma_hoi_vien: formData.ma_hoi_vien.trim() || undefined,
        ma_clb: formData.ma_clb.trim() || undefined,
        ma_don_vi: formData.ma_don_vi.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        emergency_contact_name:
          formData.emergency_contact_name.trim() || undefined,
        emergency_contact_phone:
          formData.emergency_contact_phone.trim() || undefined,
        quyen_so: formData.quyen_so || undefined,
        cap_dai_id: formData.cap_dai_id || undefined,
        active_status: formData.active_status,
      };

      // Remove undefined values
      Object.keys(cleanData).forEach((key) => {
        if (
          cleanData[key] === undefined ||
          cleanData[key] === null ||
          cleanData[key] === ""
        ) {
          delete cleanData[key];
        }
      });

      if (editingVoSinh) {
        // Update existing võ sinh
        const updateResponse = await usersApi.update(
          editingVoSinh.id,
          cleanData
        );
        console.log("[UsersPage] Update response:", updateResponse);
        alert("Cập nhật võ sinh thành công!");
      } else {
        // Create new võ sinh - email is required for create
        if (!cleanData.email) {
          alert("Email là bắt buộc khi tạo mới võ sinh!");
          return;
        }
        const createResponse = await usersApi.create(cleanData);
        console.log("[UsersPage] Create response:", createResponse);
        alert("Tạo võ sinh mới thành công!");
      }

      // Refresh data
      await fetchVoSinh();

      setShowModal(false);
      setEditingVoSinh(null);
      resetForm();
    } catch (error: any) {
      console.error("Lỗi khi lưu võ sinh:", error);
      let errorMessage = "Lỗi khi lưu võ sinh. Vui lòng thử lại.";

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
    if (!confirm("Bạn có chắc chắn muốn xóa võ sinh này?")) {
      return;
    }

    try {
      await usersApi.delete(id);
      alert("Xóa võ sinh thành công!");

      // Refresh data
      await fetchVoSinh();
    } catch (error: any) {
      console.error("Lỗi khi xóa võ sinh:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi xóa võ sinh. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      ho_va_ten: "",
      ngay_thang_nam_sinh: "",
      ma_hoi_vien: "",
      ma_clb: "",
      ma_don_vi: "",
      quyen_so: 1,
      cap_dai_id: 1,
      gioi_tinh: "Nam",
      email: "",
      phone: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      active_status: true,
    });
    setEditingVoSinh(null);
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
                Danh sách võ sinh
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
                Thêm võ sinh mới
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
                  placeholder="Tìm kiếm võ sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và tên</th>
                  <th>Ngày sinh</th>
                  <th>Mã đơn vị</th>
                  <th>Mã CLB</th>
                  <th>Mã HV</th>
                  <th>Cấp đai</th>
                  <th>Quyền</th>
                  <th>Ngày đăng ký</th>
                  <th>SĐT</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoSinh.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.ho_va_ten}</td>
                    <td>
                      {new Date(user.ngay_thang_nam_sinh).toLocaleDateString()}
                    </td>
                    <td>
                      {(() => {
                        const maDonVi = user.ma_don_vi;
                        // Xử lý các trường hợp: null, undefined, "null", "", hoặc string rỗng
                        if (
                          maDonVi &&
                          typeof maDonVi === "string" &&
                          maDonVi.trim() &&
                          maDonVi.toLowerCase() !== "null"
                        ) {
                          return (
                            <span style={{ color: "#0dcaf0" }}>{maDonVi}</span>
                          );
                        }
                        return <span className="text-muted">Chưa có</span>;
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const maClb = user.ma_clb;
                        // Xử lý các trường hợp: null, undefined, "null", "", hoặc string rỗng
                        if (
                          maClb &&
                          typeof maClb === "string" &&
                          maClb.trim() &&
                          maClb.toLowerCase() !== "null"
                        ) {
                          return (
                            <span style={{ color: "#ffc107" }}>{maClb}</span>
                          );
                        }
                        return <span className="text-muted">Chưa có</span>;
                      })()}
                    </td>
                    <td>
                      {user.ma_hoi_vien && user.ma_hoi_vien.trim() ? (
                        <span style={{ color: "#0d6efd" }}>
                          {user.ma_hoi_vien}
                        </span>
                      ) : (
                        <span className="text-muted">Chưa có</span>
                      )}
                    </td>
                    <td>
                      {user.belt_level && user.belt_level.name ? (
                        <span
                          style={{
                            color: getBeltLevelColor(user.belt_level.color),
                            backgroundColor: getBeltLevelBgColor(user.belt_level.color),
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: '500',
                          }}
                        >
                          {user.belt_level.name}
                        </span>
                      ) : user.cap_dai_id ? (
                        <span style={{ color: "#198754" }}>
                          Đai {user.cap_dai_id}
                        </span>
                      ) : (
                        <span className="text-muted">Chưa có</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: "#6c757d" }}>
                        Quyền {user.quyen_so}
                      </span>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Chưa có"}
                    </td>
                    <td>
                      {user.phone && user.phone.trim() ? user.phone : "Chưa có"}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user.id)}
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

          {filteredVoSinh.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                Không tìm thấy võ sinh nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Edit User */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingVoSinh ? "Chỉnh sửa võ sinh" : "Thêm võ sinh mới"}
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
                        <label className="form-label">Tên</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ho_va_ten}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ho_va_ten: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
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
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Ngày tháng năm sinh
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.ngay_thang_nam_sinh}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ngay_thang_nam_sinh: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Giới tính</label>
                        <select
                          className="form-select"
                          value={formData.gioi_tinh}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gioi_tinh: e.target.value as "Nam" | "Nữ",
                            })
                          }
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Mã hội viên</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ma_hoi_vien}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ma_hoi_vien: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Mã CLB</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ma_clb}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ma_clb: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Mã đơn vị</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ma_don_vi}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ma_don_vi: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Quyền số</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.quyen_so}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quyen_so: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cấp đai ID</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.cap_dai_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cap_dai_id: parseInt(e.target.value) || 1,
                            })
                          }
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Địa chỉ</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Số điện thoại</label>
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
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Tên người liên hệ khẩn cấp
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.emergency_contact_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergency_contact_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Số điện thoại liên hệ khẩn cấp
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.emergency_contact_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.active_status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            active_status: e.target.checked,
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
                    {editingVoSinh ? "Cập nhật" : "Tạo mới"}
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
