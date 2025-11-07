"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import {
  clubsApi,
  Club as ApiClub,
  Branch as ApiBranch,
} from "@/services/api/clubs";
import { branchesApi } from "@/services/api/branches";

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

  /**
   * Lấy lại danh sách clubs từ API với đầy đủ branches
   * Gọi getOverview cho mỗi club để đảm bảo lấy hết tất cả chi nhánh
   */
  const refetchClubs = async () => {
    try {
      // Lấy danh sách tất cả clubs
      const clubsList = await clubsApi.getAll();

      // Lấy đầy đủ thông tin (bao gồm branches) cho mỗi club
      const clubsWithBranches = await Promise.all(
        clubsList.map(async (apiClub: ApiClub) => {
          try {
            // Gọi getOverview để lấy đầy đủ branches
            const overview = await clubsApi.getOverview(apiClub.id);

            // Map dữ liệu từ API về format của page
            const mappedBranches: Branch[] = (overview?.branches || []).map(
              (apiBranch: any) => {
                // Lấy tên manager từ relations (nếu có)
                // Backend load relations: ['managers', 'managers.manager']
                const managerName =
                  apiBranch?.managers?.[0]?.manager?.full_name ||
                  apiBranch?.managers?.[0]?.manager?.name ||
                  apiBranch?.managers?.[0]?.manager?.username ||
                  "Chưa có quản lý";

                return {
                  id: apiBranch.id,
                  name: apiBranch.name,
                  address: apiBranch.address || "",
                  phone: apiBranch.phone || "",
                  email: apiBranch.email || "",
                  manager: managerName,
                  status: apiBranch.is_active ? "active" : "inactive",
                  created_at: apiBranch.created_at
                    ? new Date(apiBranch.created_at).toISOString()
                    : new Date().toISOString(),
                };
              }
            );

            return {
              id: apiClub.id,
              name: apiClub.name,
              address: apiClub.address || "",
              phone: apiClub.phone || "",
              email: apiClub.email || "",
              description: apiClub.description || "",
              is_active: true, // Mặc định true nếu không có field
              created_at: apiClub.created_at
                ? new Date(apiClub.created_at).toISOString()
                : new Date().toISOString(),
              branches: mappedBranches,
            };
          } catch (error) {
            console.error(
              `Lỗi khi lấy thông tin chi tiết cho club ${apiClub.id}:`,
              error
            );
            // Trả về club không có branches nếu lỗi
            return {
              id: apiClub.id,
              name: apiClub.name,
              address: apiClub.address || "",
              phone: apiClub.phone || "",
              email: apiClub.email || "",
              description: apiClub.description || "",
              is_active: true,
              created_at: apiClub.created_at
                ? new Date(apiClub.created_at).toISOString()
                : new Date().toISOString(),
              branches: [],
            };
          }
        })
      );

      setClubs(clubsWithBranches);
    } catch (error) {
      console.error("Lỗi khi tải danh sách câu lạc bộ:", error);
      throw error;
    }
  };

  useEffect(() => {
    /**
     * Lấy danh sách câu lạc bộ và chi nhánh từ API khi component mount
     */
    const fetchClubs = async () => {
      setLoading(true);
      try {
        await refetchClubs();
      } catch (error) {
        alert("Không thể tải danh sách câu lạc bộ. Vui lòng thử lại sau.");
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
        await clubsApi.update(editingClub.id, {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
        });
      } else {
        // Create new club
        await clubsApi.create({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
        });
      }

      // Reload lại dữ liệu từ API
      await refetchClubs();

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
      if (!selectedClubId) {
        alert("Vui lòng chọn câu lạc bộ.");
        return;
      }

      if (editingBranch) {
        // Update existing branch
        await branchesApi.update(editingBranch.id, {
          name: branchFormData.name,
          address: branchFormData.address,
          phone: branchFormData.phone,
          email: branchFormData.email,
          is_active: branchFormData.status === "active",
        });
      } else {
        // Create new branch
        await branchesApi.create({
          club_id: selectedClubId,
          name: branchFormData.name,
          address: branchFormData.address,
          phone: branchFormData.phone,
          email: branchFormData.email,
          is_active: branchFormData.status === "active",
        });
      }

      // Reload lại dữ liệu từ API để lấy đầy đủ branches
      await refetchClubs();

      setShowBranchModal(false);
      resetBranchForm();
    } catch (error) {
      console.error("Lỗi khi lưu chi nhánh:", error);
      alert("Lỗi khi lưu chi nhánh. Vui lòng thử lại.");
    }
  };

  const handleDeleteBranch = async (branchId: number, clubId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) {
      try {
        await branchesApi.delete(branchId);
        // Reload lại dữ liệu từ API để đảm bảo đồng bộ
        await refetchClubs();
      } catch (error) {
        console.error("Lỗi khi xóa chi nhánh:", error);
        alert("Lỗi khi xóa chi nhánh. Vui lòng thử lại.");
      }
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
