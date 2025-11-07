"use client";

import { useState, useEffect } from "react";
import { poomsaeApi } from "@/services/api/poomsae";
import { beltLevelsApi } from "@/services/api/belt-levels";

interface Poomsae {
  id: number;
  tenBaiQuyenVietnamese: string;
  tenBaiQuyenEnglish: string;
  tenBaiQuyenKorean?: string;
  capDo: string;
  moTa?: string;
  soDongTac?: number;
  thoiGianThucHien?: number;
  khoiLuongLyThuyet?: string;
  createdAt: string;
  updatedAt: string;
}

interface BeltLevel {
  id: number;
  name: string;
  color: string;
  orderSequence: number;
}

export default function PoomsaePage() {
  const [poomsaes, setPoomsaes] = useState<Poomsae[]>([]);
  const [beltLevels, setBeltLevels] = useState<BeltLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCapDo, setFilterCapDo] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPoomsae, setEditingPoomsae] = useState<Poomsae | null>(null);
  const [formData, setFormData] = useState({
    tenBaiQuyenVietnamese: "",
    tenBaiQuyenEnglish: "",
    tenBaiQuyenKorean: "",
    capDo: "Cơ bản",
    moTa: "",
    soDongTac: 0,
    thoiGianThucHien: 0,
    khoiLuongLyThuyet: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [poomsaeData, beltLevelData] = await Promise.all([
          poomsaeApi.getAll(),
          beltLevelsApi.getAll(),
        ]);
        setPoomsaes(poomsaeData);
        setBeltLevels(beltLevelData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setPoomsaes([]);
        setBeltLevels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPoomsaes = poomsaes.filter((poomsae) => {
    const matchesSearch =
      poomsae.tenBaiQuyenVietnamese
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      poomsae.tenBaiQuyenEnglish
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (poomsae.tenBaiQuyenKorean &&
        poomsae.tenBaiQuyenKorean
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesCapDo = filterCapDo === "all" || poomsae.capDo === filterCapDo;

    return matchesSearch && matchesCapDo;
  });

  const getCapDoBadgeClass = (capDo: string) => {
    switch (capDo) {
      case "Cơ bản":
        return "bg-success";
      case "Trung cấp":
        return "bg-warning";
      case "Nâng cao":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleEdit = (poomsae: Poomsae) => {
    setEditingPoomsae(poomsae);
    setFormData({
      tenBaiQuyenVietnamese: poomsae.tenBaiQuyenVietnamese,
      tenBaiQuyenEnglish: poomsae.tenBaiQuyenEnglish,
      tenBaiQuyenKorean: poomsae.tenBaiQuyenKorean || "",
      capDo: poomsae.capDo,
      moTa: poomsae.moTa || "",
      soDongTac: poomsae.soDongTac || 0,
      thoiGianThucHien: poomsae.thoiGianThucHien || 0,
      khoiLuongLyThuyet: poomsae.khoiLuongLyThuyet || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPoomsae) {
        await poomsaeApi.update(editingPoomsae.id, formData);
        const updatedPoomsaes = await poomsaeApi.getAll();
        setPoomsaes(updatedPoomsaes);
        alert("Cập nhật bài quyền thành công!");
      } else {
        await poomsaeApi.create(formData);
        const updatedPoomsaes = await poomsaeApi.getAll();
        setPoomsaes(updatedPoomsaes);
        alert("Tạo bài quyền mới thành công!");
      }
      setShowModal(false);
      setEditingPoomsae(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu bài quyền:", error);
      alert("Lỗi khi lưu bài quyền. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài quyền này?")) {
      try {
        await poomsaeApi.delete(id);
        const updatedPoomsaes = await poomsaeApi.getAll();
        setPoomsaes(updatedPoomsaes);
        alert("Xóa bài quyền thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa bài quyền:", error);
        alert("Lỗi khi xóa bài quyền. Vui lòng thử lại.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tenBaiQuyenVietnamese: "",
      tenBaiQuyenEnglish: "",
      tenBaiQuyenKorean: "",
      capDo: "Cơ bản",
      moTa: "",
      soDongTac: 0,
      thoiGianThucHien: 0,
      khoiLuongLyThuyet: "",
    });
    setEditingPoomsae(null);
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
                Danh sách bài quyền
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
                Thêm bài quyền mới
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
                  placeholder="Tìm kiếm bài quyền..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterCapDo}
                onChange={(e) => setFilterCapDo(e.target.value)}
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>
          </div>

          {/* Poomsae Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên tiếng Việt</th>
                  <th>Tên tiếng Anh</th>
                  <th>Tên tiếng Hàn</th>
                  <th>Cấp độ</th>
                  <th>Số động tác</th>
                  <th>Thời gian (s)</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPoomsaes.map((poomsae) => (
                  <tr key={poomsae.id}>
                    <td>{poomsae.id}</td>
                    <td>
                      <strong>{poomsae.tenBaiQuyenVietnamese}</strong>
                      {poomsae.moTa && (
                        <>
                          <br />
                          <small className="text-muted">{poomsae.moTa}</small>
                        </>
                      )}
                    </td>
                    <td>{poomsae.tenBaiQuyenEnglish}</td>
                    <td>{poomsae.tenBaiQuyenKorean || "-"}</td>
                    <td>
                      <span
                        className={`badge ${getCapDoBadgeClass(poomsae.capDo)}`}
                      >
                        {poomsae.capDo}
                      </span>
                    </td>
                    <td>{poomsae.soDongTac || "-"}</td>
                    <td>{poomsae.thoiGianThucHien || "-"}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(poomsae)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(poomsae.id)}
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

          {filteredPoomsaes.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-fist-raised fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                Không tìm thấy bài quyền nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Poomsae */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPoomsae
                    ? "Chỉnh sửa bài quyền"
                    : "Thêm bài quyền mới"}
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
                        <label className="form-label">Tên tiếng Việt</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tenBaiQuyenVietnamese}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tenBaiQuyenVietnamese: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tên tiếng Anh</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tenBaiQuyenEnglish}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tenBaiQuyenEnglish: e.target.value,
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
                        <label className="form-label">Tên tiếng Hàn</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tenBaiQuyenKorean}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tenBaiQuyenKorean: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cấp độ</label>
                        <select
                          className="form-select"
                          value={formData.capDo}
                          onChange={(e) =>
                            setFormData({ ...formData, capDo: e.target.value })
                          }
                          required
                        >
                          <option value="Cơ bản">Cơ bản</option>
                          <option value="Trung cấp">Trung cấp</option>
                          <option value="Nâng cao">Nâng cao</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.moTa}
                      onChange={(e) =>
                        setFormData({ ...formData, moTa: e.target.value })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Số động tác</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.soDongTac}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              soDongTac: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Thời gian (giây)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.thoiGianThucHien}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thoiGianThucHien: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Khối lượng lý thuyết</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.khoiLuongLyThuyet}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          khoiLuongLyThuyet: e.target.value,
                        })
                      }
                    />
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
                    {editingPoomsae ? "Cập nhật" : "Tạo mới"}
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
