"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive";
  created_at: string;
}

interface Club {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  branches?: Branch[];
}

export default function ClubsPage() {
  const { account } = useAccountStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [expandedClub, setExpandedClub] = useState<number | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    is_active: true,
  });
  const [branchFormData, setBranchFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    // Lấy danh sách câu lạc bộ từ API
    const fetchClubs = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/clubs');
        // setClubs(response.data);

        // Mock data với chi nhánh
        setClubs([
          {
            id: 1,
            name: "CLB Đồng Phú",
            address: "Đồng Phú, Bình Phước",
            phone: "0123456789",
            email: "dongphu@taekwondo.com",
            description: "CLB Taekwondo Đồng Phú - Thầy Tiến HLV trưởng",
            is_active: true,
            created_at: "2024-01-01T00:00:00Z",
            branches: [
              {
                id: 1,
                name: "CLB Giáo Xứ Tân Lập",
                address: "Giáo Xứ Tân Lập, Đồng Phú",
                phone: "0123456781",
                email: "gxtn@dongphu.com",
                manager: "Thầy Tân",
                status: "active",
                created_at: "2024-01-01T00:00:00Z",
              },
              {
                id: 2,
                name: "CLB Tiểu Học Tân Lập",
                address: "Trường Tiểu Học Tân Lập, Đồng Phú",
                phone: "0123456782",
                email: "thtn@dongphu.com",
                manager: "Thầy Tân",
                status: "active",
                created_at: "2024-01-01T00:00:00Z",
              },
              {
                id: 3,
                name: "CLB Tiểu Học Tân Tiến",
                address: "Trường Tiểu Học Tân Tiến, Đồng Phú",
                phone: "0123456783",
                email: "thtt@dongphu.com",
                manager: "Thầy Tân",
                status: "active",
                created_at: "2024-01-01T00:00:00Z",
              },
            ],
          },
        ]);
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

  const resetBranchForm = () => {
    setBranchFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      status: "active",
    });
    setEditingBranch(null);
    setSelectedClubId(null);
  };

  const handleAddBranch = (clubId: number) => {
    setSelectedClubId(clubId);
    resetBranchForm();
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch: Branch, clubId: number) => {
    setEditingBranch(branch);
    setSelectedClubId(clubId);
    setBranchFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
    });
    setShowBranchModal(true);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClubId) {
        const club = clubs.find((c) => c.id === selectedClubId);
        if (club) {
          if (editingBranch) {
            // Update existing branch
            const updatedBranches =
              club.branches?.map((branch) =>
                branch.id === editingBranch.id
                  ? {
                      ...branch,
                      ...branchFormData,
                      updated_at: new Date().toISOString(),
                    }
                  : branch
              ) || [];

            setClubs(
              clubs.map((c) =>
                c.id === selectedClubId
                  ? { ...c, branches: updatedBranches }
                  : c
              )
            );
          } else {
            // Create new branch
            const newBranch: Branch = {
              id: Math.max(...(club.branches?.map((b) => b.id) || [0])) + 1,
              ...branchFormData,
              created_at: new Date().toISOString(),
            };

            setClubs(
              clubs.map((c) =>
                c.id === selectedClubId
                  ? { ...c, branches: [...(c.branches || []), newBranch] }
                  : c
              )
            );
          }
        }
      }
      setShowBranchModal(false);
      resetBranchForm();
    } catch (error) {
      console.error("Lỗi khi lưu chi nhánh:", error);
      alert("Lỗi khi lưu chi nhánh. Vui lòng thử lại.");
    }
  };

  const handleDeleteBranch = (branchId: number, clubId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) {
      setClubs(
        clubs.map((c) =>
          c.id === clubId
            ? {
                ...c,
                branches: c.branches?.filter((b) => b.id !== branchId) || [],
              }
            : c
        )
      );
    }
  };

  const toggleExpanded = (clubId: number) => {
    setExpandedClub(expandedClub === clubId ? null : clubId);
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
        <h2>Quản lý câu lạc bộ & chi nhánh</h2>
        <p>Quản lý tất cả câu lạc bộ Taekwondo và các chi nhánh của chúng</p>
      </div>

      {/* Filters and Actions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="m-0 font-weight-bold text-primary">
                Danh sách câu lạc bộ & chi nhánh
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

          {/* Clubs List with Branches */}
          <div className="row">
            {filteredClubs.map((club) => (
              <div key={club.id} className="col-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <h5 className="mb-0 me-3">{club.name}</h5>
                        <span
                          className={`badge ${
                            club.is_active ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {club.is_active ? "Hoạt động" : "Không hoạt động"}
                        </span>
                        <span className="badge bg-info ms-2">
                          {club.branches?.length || 0} chi nhánh
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(club)}
                        >
                          <i className="fas fa-edit"></i> Sửa CLB
                        </button>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleAddBranch(club.id)}
                        >
                          <i className="fas fa-plus"></i> Thêm chi nhánh
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleExpanded(club.id)}
                        >
                          <i
                            className={`fas fa-chevron-${
                              expandedClub === club.id ? "up" : "down"
                            }`}
                          ></i>
                          {expandedClub === club.id
                            ? "Thu gọn"
                            : "Xem chi nhánh"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="club-info">
                          <p className="mb-2">
                            <i className="fas fa-map-marker-alt text-muted me-2"></i>
                            <strong>Địa chỉ:</strong> {club.address}
                          </p>
                          <p className="mb-2">
                            <i className="fas fa-phone text-muted me-2"></i>
                            <strong>Điện thoại:</strong> {club.phone}
                          </p>
                          <p className="mb-2">
                            <i className="fas fa-envelope text-muted me-2"></i>
                            <strong>Email:</strong> {club.email}
                          </p>
                          {club.description && (
                            <p className="mb-0 text-muted">
                              <strong>Mô tả:</strong> {club.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-end">
                          <small className="text-muted">
                            Tạo:{" "}
                            {new Date(club.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Branches Section */}
                    {expandedClub === club.id && (
                      <div className="mt-4">
                        <hr />
                        <h6 className="mb-3">
                          <i className="fas fa-map-marker-alt me-2"></i>
                          Chi nhánh ({club.branches?.length || 0})
                        </h6>

                        {club.branches && club.branches.length > 0 ? (
                          <div className="row">
                            {club.branches.map((branch) => (
                              <div
                                key={branch.id}
                                className="col-md-6 col-lg-4 mb-3"
                              >
                                <div className="card border-left-info">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <h6 className="card-title mb-0">
                                        {branch.name}
                                      </h6>
                                      <span
                                        className={`badge ${
                                          branch.status === "active"
                                            ? "bg-success"
                                            : "bg-secondary"
                                        }`}
                                      >
                                        {branch.status === "active"
                                          ? "Hoạt động"
                                          : "Không hoạt động"}
                                      </span>
                                    </div>

                                    <div className="branch-info">
                                      <p className="mb-1">
                                        <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                        <small>{branch.address}</small>
                                      </p>
                                      <p className="mb-1">
                                        <i className="fas fa-phone text-muted me-1"></i>
                                        <small>{branch.phone}</small>
                                      </p>
                                      <p className="mb-1">
                                        <i className="fas fa-envelope text-muted me-1"></i>
                                        <small>{branch.email}</small>
                                      </p>
                                      <p className="mb-2">
                                        <i className="fas fa-user-tie text-muted me-1"></i>
                                        <small>
                                          <strong>Quản lý:</strong>{" "}
                                          {branch.manager}
                                        </small>
                                      </p>
                                    </div>

                                    <div className="d-flex justify-content-end">
                                      <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() =>
                                          handleEditBranch(branch, club.id)
                                        }
                                        title="Chỉnh sửa"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                          handleDeleteBranch(branch.id, club.id)
                                        }
                                        title="Xóa"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <i className="fas fa-map-marker-alt fa-2x text-muted mb-2"></i>
                            <p className="text-muted mb-0">
                              Chưa có chi nhánh nào
                            </p>
                            <button
                              className="btn btn-sm btn-primary mt-2"
                              onClick={() => handleAddBranch(club.id)}
                            >
                              <i className="fas fa-plus me-1"></i>
                              Thêm chi nhánh đầu tiên
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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

      {/* Modal for Add/Edit Branch */}
      {showBranchModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBranch ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowBranchModal(false);
                    resetBranchForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleBranchSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tên chi nhánh</label>
                    <input
                      type="text"
                      className="form-control"
                      value={branchFormData.name}
                      onChange={(e) =>
                        setBranchFormData({
                          ...branchFormData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={branchFormData.address}
                      onChange={(e) =>
                        setBranchFormData({
                          ...branchFormData,
                          address: e.target.value,
                        })
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
                          value={branchFormData.phone}
                          onChange={(e) =>
                            setBranchFormData({
                              ...branchFormData,
                              phone: e.target.value,
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
                          value={branchFormData.email}
                          onChange={(e) =>
                            setBranchFormData({
                              ...branchFormData,
                              email: e.target.value,
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
                        <label className="form-label">Quản lý</label>
                        <input
                          type="text"
                          className="form-control"
                          value={branchFormData.manager}
                          onChange={(e) =>
                            setBranchFormData({
                              ...branchFormData,
                              manager: e.target.value,
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
                          value={branchFormData.status}
                          onChange={(e) =>
                            setBranchFormData({
                              ...branchFormData,
                              status: e.target.value as "active" | "inactive",
                            })
                          }
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
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
                      setShowBranchModal(false);
                      resetBranchForm();
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBranch ? "Cập nhật" : "Tạo mới"}
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
