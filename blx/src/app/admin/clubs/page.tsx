"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface Club {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export default function ClubsPage() {
  const { account } = useAccountStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    // Lấy danh sách câu lạc bộ từ API
    const fetchClubs = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/clubs');
        // setClubs(response.data);
        setClubs([]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách câu lạc bộ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      address: club.address,
      phone: club.phone,
      email: club.email,
      description: club.description || "",
      is_active: club.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClub) {
        // Update existing club
        setClubs(
          clubs.map((club) =>
            club.id === editingClub.id
              ? { ...club, ...formData, updated_at: new Date().toISOString() }
              : club
          )
        );
      } else {
        // Create new club
        const newClub = {
          id: Math.max(...clubs.map((c) => c.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setClubs([...clubs, newClub]);
      }
      setShowModal(false);
      setEditingClub(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu câu lạc bộ:", error);
      alert("Lỗi khi lưu câu lạc bộ. Vui lòng thử lại.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      description: "",
      is_active: true,
    });
    setEditingClub(null);
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
        <h2>Quản lý câu lạc bộ</h2>
        <p>Quản lý tất cả câu lạc bộ Taekwondo</p>
      </div>

      {/* Filters and Actions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="m-0 font-weight-bold text-primary">
                Danh sách câu lạc bộ
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
                Thêm câu lạc bộ mới
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
                  placeholder="Tìm kiếm câu lạc bộ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Clubs Grid */}
          <div className="row">
            {filteredClubs.map((club) => (
              <div key={club.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title">{club.name}</h5>
                      <span
                        className={`badge ${
                          club.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {club.is_active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>

                    <div className="club-info">
                      <p className="card-text">
                        <i className="fas fa-map-marker-alt text-muted me-2"></i>
                        {club.address}
                      </p>
                      <p className="card-text">
                        <i className="fas fa-phone text-muted me-2"></i>
                        {club.phone}
                      </p>
                      <p className="card-text">
                        <i className="fas fa-envelope text-muted me-2"></i>
                        {club.email}
                      </p>
                      {club.description && (
                        <p className="card-text text-muted">
                          <small>{club.description}</small>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="card-footer bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Tạo: {new Date(club.created_at).toLocaleDateString()}
                      </small>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(club)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-building fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                Không tìm thấy câu lạc bộ nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Edit Club */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClub ? "Chỉnh sửa câu lạc bộ" : "Thêm câu lạc bộ mới"}
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
                  <div className="mb-3">
                    <label className="form-label">Tên câu lạc bộ</label>
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
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
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
                    {editingClub ? "Cập nhật" : "Tạo mới"}
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
