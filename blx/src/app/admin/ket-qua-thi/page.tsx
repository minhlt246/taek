"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { ketQuaThiApi, KetQuaThi } from "@/services/api/ket-qua-thi";
import { useToast } from "@/utils/toast";

export default function KetQuaThiPage() {
  const { account } = useAccountStore();
  const [ketQuaThi, setKetQuaThi] = useState<KetQuaThi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKetQua, setFilterKetQua] = useState<string>("all"); // "all" | "Đạt" | "Không đạt" | "Chưa có kết quả"
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingKetQuaThi, setEditingKetQuaThi] = useState<KetQuaThi | null>(
    null
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    test_id: undefined as number | undefined,
    ma_clb: "",
    user_id: undefined as number | undefined,
    ma_hoi_vien: "",
    cap_dai_du_thi_id: undefined as number | undefined,
    so_thi: "",
    ho_va_ten: "",
    gioi_tinh: "Nam" as "Nam" | "Nữ",
    ngay_thang_nam_sinh: "",
    ky_thuat_tan_can_ban: undefined as number | undefined,
    nguyen_tac_phat_luc: undefined as number | undefined,
    can_ban_tay: undefined as number | undefined,
    ky_thuat_chan: undefined as number | undefined,
    can_ban_tu_ve: undefined as number | undefined,
    bai_quyen: undefined as number | undefined,
    phan_the_bai_quyen: undefined as number | undefined,
    song_dau: undefined as number | undefined,
    the_luc: undefined as number | undefined,
    ket_qua: "Chưa có kết quả" as "Đạt" | "Không đạt" | "Chưa có kết quả",
    ghi_chu: "",
  });

  // Fetch kết quả thi với pagination
  const fetchKetQuaThi = async (page: number = pagination.page) => {
    setLoading(true);
    try {
      const response = await ketQuaThiApi.getAll({
        page,
        limit: pagination.limit,
      });

      // Handle paginated response
      if (response && typeof response === "object" && "docs" in response) {
        setKetQuaThi(response.docs);
        setPagination({
          page: response.page || page,
          limit: response.limit || pagination.limit,
          totalDocs: response.totalDocs || 0,
          totalPages: response.totalPages || 0,
        });
      } else {
        // Fallback for array response
        setKetQuaThi(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Error fetching ket qua thi:", error);
      useToast.error("Không thể tải danh sách kết quả thi");
      setKetQuaThi([]);
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
    fetchKetQuaThi();
  }, []);

  // Filter kết quả
  const filteredKetQuaThi = ketQuaThi.filter((result) => {
    const matchesSearch =
      (result.ho_va_ten || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (result.ma_hoi_vien || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (result.ma_clb || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKetQua =
      filterKetQua === "all" || result.ket_qua === filterKetQua;

    return matchesSearch && matchesKetQua;
  });

  const handleEdit = (result: KetQuaThi) => {
    setEditingKetQuaThi(result);
    setFormData({
      test_id: result.test_id,
      ma_clb: result.ma_clb || "",
      user_id: result.user_id,
      ma_hoi_vien: result.ma_hoi_vien || "",
      cap_dai_du_thi_id: result.cap_dai_du_thi_id,
      so_thi: result.so_thi || "",
      ho_va_ten: result.ho_va_ten || "",
      gioi_tinh: result.gioi_tinh || "Nam",
      ngay_thang_nam_sinh: result.ngay_thang_nam_sinh
        ? result.ngay_thang_nam_sinh.split("T")[0]
        : "",
      ky_thuat_tan_can_ban: result.ky_thuat_tan_can_ban,
      nguyen_tac_phat_luc: result.nguyen_tac_phat_luc,
      can_ban_tay: result.can_ban_tay,
      ky_thuat_chan: result.ky_thuat_chan,
      can_ban_tu_ve: result.can_ban_tu_ve,
      bai_quyen: result.bai_quyen,
      phan_the_bai_quyen: result.phan_the_bai_quyen,
      song_dau: result.song_dau,
      the_luc: result.the_luc,
      ket_qua: result.ket_qua || "Chưa có kết quả",
      ghi_chu: result.ghi_chu || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanData: any = {};
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value !== undefined && value !== null && value !== "") {
          cleanData[key] = value;
        }
      });

      if (editingKetQuaThi) {
        await ketQuaThiApi.update(editingKetQuaThi.id, cleanData);
        useToast.success("Cập nhật kết quả thi thành công!");
      } else {
        await ketQuaThiApi.create(cleanData);
        useToast.success("Tạo kết quả thi thành công!");
      }

      await fetchKetQuaThi();
      setShowModal(false);
      setEditingKetQuaThi(null);
      resetForm();
    } catch (error: any) {
      console.error("Error saving ket qua thi:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi lưu kết quả thi. Vui lòng thử lại.";
      useToast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kết quả thi này?")) {
      return;
    }

    try {
      await ketQuaThiApi.delete(id);
      useToast.success("Xóa kết quả thi thành công!");
      await fetchKetQuaThi();
    } catch (error: any) {
      console.error("Error deleting ket qua thi:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi xóa kết quả thi. Vui lòng thử lại.";
      useToast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      test_id: undefined,
      ma_clb: "",
      user_id: undefined,
      ma_hoi_vien: "",
      cap_dai_du_thi_id: undefined,
      so_thi: "",
      ho_va_ten: "",
      gioi_tinh: "Nam",
      ngay_thang_nam_sinh: "",
      ky_thuat_tan_can_ban: undefined,
      nguyen_tac_phat_luc: undefined,
      can_ban_tay: undefined,
      ky_thuat_chan: undefined,
      can_ban_tu_ve: undefined,
      bai_quyen: undefined,
      phan_the_bai_quyen: undefined,
      song_dau: undefined,
      the_luc: undefined,
      ket_qua: "Chưa có kết quả",
      ghi_chu: "",
    });
    setEditingKetQuaThi(null);
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      useToast.error("Vui lòng chọn file Excel");
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const result = await ketQuaThiApi.importExcel(importFile);

      if (result.success) {
        setImportResult({
          imported: result.imported,
          failed: result.failed,
          errors: result.errors || [],
        });
        useToast.success(`Import thành công ${result.imported} bản ghi`);

        // Reset file input
        const fileInput = document.getElementById(
          "excelFileKetQuaThi"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setImportFile(null);

        // Refresh data
        await fetchKetQuaThi();
      } else {
        useToast.error(result.message || "Import thất bại");
      }
    } catch (error: any) {
      console.error("Error importing Excel:", error);
      useToast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi import file"
      );
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to safely format number with toFixed
  const formatScore = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "-";
    return num.toFixed(1);
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
      {/* Header */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="m-0 font-weight-bold text-primary">
                Quản lý Kết quả thi
              </h6>
            </div>
            <div className="col-auto">
              <div className="btn-group">
                <button
                  className="btn btn-success"
                  onClick={() => setShowImportModal(true)}
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Import Excel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Thêm kết quả thi mới
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên, mã hội viên, mã CLB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterKetQua}
                onChange={(e) => setFilterKetQua(e.target.value)}
              >
                <option value="all">Tất cả kết quả</option>
                <option value="Đạt">Đạt</option>
                <option value="Không đạt">Không đạt</option>
                <option value="Chưa có kết quả">Chưa có kết quả</option>
              </select>
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => fetchKetQuaThi(pagination.page)}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Làm mới
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã HV</th>
                  <th>Họ và tên</th>
                  <th>Mã CLB</th>
                  <th>Cấp đai dự thi</th>
                  <th>Kỹ thuật tấn</th>
                  <th>Căn bản tay</th>
                  <th>Kỹ thuật chân</th>
                  <th>Bài quyền</th>
                  <th>Song đấu</th>
                  <th>Thể lực</th>
                  <th>Kết quả</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredKetQuaThi.map((result) => (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>
                      <span className="badge bg-info">
                        {result.ma_hoi_vien || "N/A"}
                      </span>
                    </td>
                    <td>
                      {result.ho_va_ten || result.user?.ho_va_ten || "N/A"}
                    </td>
                    <td>
                      {result.ma_clb ? (
                        <span className="badge bg-warning">
                          {result.ma_clb}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {result.cap_dai_du_thi?.name ||
                        (result.cap_dai_du_thi_id
                          ? `Đai ${result.cap_dai_du_thi_id}`
                          : "N/A")}
                    </td>
                    <td>{formatScore(result.ky_thuat_tan_can_ban)}</td>
                    <td>{formatScore(result.can_ban_tay)}</td>
                    <td>{formatScore(result.ky_thuat_chan)}</td>
                    <td>{formatScore(result.bai_quyen)}</td>
                    <td>{formatScore(result.song_dau)}</td>
                    <td>{formatScore(result.the_luc)}</td>
                    <td>
                      <span
                        className={`badge ${
                          result.ket_qua === "Đạt"
                            ? "bg-success"
                            : result.ket_qua === "Không đạt"
                              ? "bg-danger"
                              : "bg-secondary"
                        }`}
                      >
                        {result.ket_qua || "Chưa có kết quả"}
                      </span>
                    </td>
                    <td>{formatDate(result.created_at)}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(result)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(result.id)}
                          title="Xóa"
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

          {filteredKetQuaThi.length === 0 && (
            <div className="text-center py-4">
              <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                Không tìm thấy kết quả thi nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalDocs > pagination.limit && (
            <div className="pagination-section mt-4">
              <nav aria-label="Kết quả thi pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-info">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDocs
                    )}{" "}
                    trong tổng số {pagination.totalDocs} kết quả thi
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => fetchKetQuaThi(pagination.page - 1)}
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
                      onClick={() => fetchKetQuaThi(pagination.page + 1)}
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

      {/* Modal for Edit/Create */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingKetQuaThi
                    ? "Chỉnh sửa kết quả thi"
                    : "Thêm kết quả thi mới"}
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
                            setFormData({ ...formData, ma_clb: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
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
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cấp đai dự thi ID</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.cap_dai_du_thi_id || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cap_dai_du_thi_id: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Điểm số */}
                  <h6 className="mt-3 mb-3">Điểm số các phần thi</h6>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Kỹ thuật tấn căn bản
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.ky_thuat_tan_can_ban || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ky_thuat_tan_can_ban: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">
                          Nguyên tắc phát lực
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.nguyen_tac_phat_luc || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nguyen_tac_phat_luc: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Căn bản tay</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.can_ban_tay || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              can_ban_tay: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Kỹ thuật chân</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.ky_thuat_chan || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ky_thuat_chan: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Căn bản tự vệ</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.can_ban_tu_ve || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              can_ban_tu_ve: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Bài quyền</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.bai_quyen || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bai_quyen: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Phân thế bài quyền</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.phan_the_bai_quyen || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phan_the_bai_quyen: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Song đấu</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.song_dau || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              song_dau: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Thể lực</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-control"
                          value={formData.the_luc || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              the_luc: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Kết quả</label>
                        <select
                          className="form-select"
                          value={formData.ket_qua}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ket_qua: e.target.value as
                                | "Đạt"
                                | "Không đạt"
                                | "Chưa có kết quả",
                            })
                          }
                        >
                          <option value="Chưa có kết quả">
                            Chưa có kết quả
                          </option>
                          <option value="Đạt">Đạt</option>
                          <option value="Không đạt">Không đạt</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ghi chú</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.ghi_chu}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ghi_chu: e.target.value,
                            })
                          }
                        />
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
                    {editingKetQuaThi ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Import Kết Quả Thi Từ Excel</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="excelFileKetQuaThi" className="form-label">
                    Chọn file Excel (.xlsx, .xls)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="excelFileKetQuaThi"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                        setImportResult(null);
                      }
                    }}
                  />
                  <small className="form-text text-muted">
                    File Excel cần có các cột: KỲ THI, MÃ CLB, MÃ HỘI VIÊN, CẤP
                    ĐẠI DỰ THI, SỐ THI, HỌ VÀ TÊN, GIỚI TÍNH, NTNS, KỸ THUẬT TẤN
                    CĂN BẢN, NGUYÊN TẮC PHÁT LỰC, CĂN BẢN TAY, KỸ THUẬT CHÂN,
                    CĂN BẢN TỰ VỆ, BÀI QUYỀN, PHÂN THẾ BÀI QUYỀN, SONG ĐẤU, THỂ
                    LỰC, KẾT QUẢ, GHI CHÚ
                  </small>
                </div>

                {importFile && (
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>File đã chọn:</strong> {importFile.name}
                    </p>
                    <p className="text-muted mb-0">
                      Kích thước: {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                {importResult && (
                  <div
                    className={`alert ${
                      importResult.failed > 0
                        ? "alert-warning"
                        : "alert-success"
                    }`}
                  >
                    <h6 className="alert-heading">Kết quả import:</h6>
                    <p className="mb-1">
                      <strong>Thành công:</strong> {importResult.imported} bản
                      ghi
                    </p>
                    <p className="mb-1">
                      <strong>Thất bại:</strong> {importResult.failed} bản ghi
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <strong>Lỗi chi tiết:</strong>
                        <ul
                          className="mb-0 mt-2"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {importResult.errors
                            .slice(0, 20)
                            .map((error, index) => (
                              <li key={index} className="small">
                                {error}
                              </li>
                            ))}
                          {importResult.errors.length > 20 && (
                            <li className="small text-muted">
                              ... và {importResult.errors.length - 20} lỗi khác
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImportExcel}
                  disabled={!importFile || importing}
                >
                  {importing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang import...
                    </>
                  ) : (
                    "Import Dữ Liệu"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
