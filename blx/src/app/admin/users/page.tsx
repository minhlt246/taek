"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface VoSinh {
  id: number;
  ho_va_ten: string;
  ngay_thang_nam_sinh: string;
  ma_hoi_vien: string;
  ma_clb: string;
  ma_don_vi: string;
  quyen_so: number;
  cap_dai_id: number;
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
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "student">(
    "all"
  );
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

  useEffect(() => {
    // Lấy danh sách võ sinh từ API
    const fetchVoSinh = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/vo-sinh');
        // setVoSinh(response.data);
        setVoSinh([]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách võ sinh:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoSinh();
  }, []);

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
      if (editingVoSinh) {
        // Update existing võ sinh
        setVoSinh(
          voSinh.map((voSinh) =>
            voSinh.id === editingVoSinh.id
              ? { ...voSinh, ...formData, updated_at: new Date().toISOString() }
              : voSinh
          )
        );
      } else {
        // Create new võ sinh
        const newVoSinh = {
          id: Math.max(...voSinh.map((v) => v.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setVoSinh([...voSinh, newVoSinh]);
      }
      setShowModal(false);
      setEditingVoSinh(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu võ sinh:", error);
      alert("Lỗi khi lưu võ sinh. Vui lòng thử lại.");
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
      <div className="page-header">
        <h2>Quản lý võ sinh</h2>
        <p>Quản lý tất cả võ sinh trong hệ thống</p>
      </div>

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
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) =>
                  setFilterRole(e.target.value as "all" | "admin" | "student")
                }
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="student">Học viên</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Mã học viên</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-danger" : "bg-primary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{user.student_code || "-"}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {user.is_active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(user)}
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

          {filteredUsers.length === 0 && (
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
                  {editingUser ? "Chỉnh sửa võ sinh" : "Thêm võ sinh mới"}
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
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
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
                        <label className="form-label">Vai trò</label>
                        <select
                          className="form-select"
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as "admin" | "student",
                            })
                          }
                          required
                        >
                          <option value="student">Học viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Mã học viên</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.student_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              student_code: e.target.value,
                            })
                          }
                          disabled={formData.role === "admin"}
                        />
                      </div>
                    </div>
                  </div>
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
                    {editingUser ? "Cập nhật" : "Tạo mới"}
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
