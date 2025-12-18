"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { usersApi } from "@/services/api/users";
import { beltLevelsApi } from "@/services/api/belt-levels";
import { poomsaeApi } from "@/services/api/poomsae";
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
    order_sequence?: number;
  };
  bai_quyen?: {
    id: number;
    tenBaiQuyenVietnamese?: string;
    tenBaiQuyenEnglish?: string;
    tenBaiQuyenKorean?: string;
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
  const [beltLevels, setBeltLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingVoSinh, setEditingVoSinh] = useState<VoSinh | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);
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
   * Fetch võ sinh data from API with pagination
   * Lấy raw data từ backend để có đầy đủ thông tin
   */
  const fetchVoSinh = async (page: number = pagination.page) => {
    setLoading(true);
    try {
      // Fetch users với pagination và belt_levels để map cấp đai
      const [usersResponse, beltLevelsData] = await Promise.all([
        usersApi.getAll(page, pagination.limit),
        beltLevelsApi.getAll(),
      ]);

      // Handle paginated response
      const paginatedData = usersResponse as {
        docs: VoSinh[];
        totalDocs: number;
        limit: number;
        page: number;
        totalPages: number;
      };

      const data: VoSinh[] = Array.isArray(paginatedData.docs)
        ? paginatedData.docs
        : [];

      // Update pagination state
      setPagination({
        page: paginatedData.page || page,
        limit: paginatedData.limit || pagination.limit,
        totalDocs: paginatedData.totalDocs || 0,
        totalPages: paginatedData.totalPages || 0,
      });

      // Store belt levels for form selection
      if (Array.isArray(beltLevelsData)) {
        setBeltLevels(beltLevelsData);
      }

      // Tạo map belt_levels để map vào users
      const beltLevelMap = new Map();
      if (Array.isArray(beltLevelsData)) {
        beltLevelsData.forEach((belt) => {
          beltLevelMap.set(belt.id, belt);
        });
      }

      // Backend đã trả về belt_level, nhưng vẫn có fallback nếu không có
      const usersWithBeltLevel = data.map((user) => {
        // Nếu backend đã trả về belt_level, bổ sung order_sequence nếu thiếu
        if (user.belt_level) {
          // Nếu thiếu order_sequence, lấy từ beltLevelMap
          if (!user.belt_level.order_sequence && user.cap_dai_id) {
            const beltLevel = beltLevelMap.get(user.cap_dai_id);
            if (beltLevel && beltLevel.order_sequence) {
              return {
                ...user,
                belt_level: {
                  ...user.belt_level,
                  order_sequence: beltLevel.order_sequence,
                },
              };
            }
          }
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
                order_sequence: beltLevel.order_sequence,
              },
            };
          }
        }
        return user;
      });

      setVoSinh(usersWithBeltLevel);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setVoSinh([]);
      setPagination({
        page: 1,
        limit: 25,
        totalDocs: 0,
        totalPages: 0,
      });
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
    if (!colorName) return "#000";

    const colorMap: Record<string, string> = {
      White: "#000", // Black text on white background
      Orange: "#ff8c00",
      Violet: "#8b00ff",
      Purple: "#8b00ff",
      Yellow: "#ff8c00", // Dark orange for better contrast
      Green: "#198754",
      Blue: "#0d6efd",
      Red: "#dc3545",
      "Red-Black": "#fff", // Changed to white text for lighter background
      Black: "#fff", // Changed to white text for lighter background
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

    // If color is a hex code and is dark, use white text
    if (colorName.startsWith("#")) {
      const hex = colorName.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      // If color is dark (brightness < 128), use white text
      if (brightness < 128) {
        return "#fff";
      }
    }

    // Default to black for unknown colors
    return "#000";
  };

  // Helper function to get belt level background color
  const getBeltLevelBgColor = (colorName?: string): string => {
    if (!colorName) return "transparent";

    const bgColorMap: Record<string, string> = {
      White: "#f8f9fa", // Light gray background
      Orange: "#fff3cd",
      Violet: "#e7d5ff",
      Purple: "#e7d5ff",
      Yellow: "#fff3cd",
      Green: "#d1e7dd",
      Blue: "#cfe2ff",
      Red: "#f8d7da",
      "Red-Black": "#6c757d", // Changed from dark to lighter gray for better visibility
      Black: "#6c757d", // Changed from dark to lighter gray for better visibility
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

    // If color is a hex code and is dark, use lighter background
    if (colorName.startsWith("#")) {
      const hex = colorName.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      // If color is dark (brightness < 128), use lighter background
      if (brightness < 128) {
        return "#6c757d"; // Light gray instead of dark
      }
    }

    return "transparent";
  };

  const filteredVoSinh = voSinh
    .filter((voSinh) => {
      const matchesSearch =
        voSinh.ho_va_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voSinh.ma_hoi_vien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voSinh.ma_clb.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (voSinh.email &&
          voSinh.email.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sắp xếp theo cấp đai (order_sequence), từ cao xuống thấp (cấp 10 -> cấp 1 -> đẳng 1 -> đẳng 10)
      // Lấy order_sequence từ belt_level, nếu không có thì dùng cap_dai_id làm fallback
      const orderA = a.belt_level?.order_sequence ?? a.cap_dai_id ?? 999;
      const orderB = b.belt_level?.order_sequence ?? b.cap_dai_id ?? 999;

      // Sắp xếp tăng dần (cấp 10 = order_sequence nhỏ nhất sẽ lên đầu)
      // Nếu order_sequence bằng nhau, sắp xếp theo ID
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.id - b.id;
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
              <div className="btn-group">
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
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setShowImportModal(true);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Import Excel
                </button>
              </div>
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
                            backgroundColor: getBeltLevelBgColor(
                              user.belt_level.color
                            ),
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "500",
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

          {/* Pagination */}
          {pagination.totalDocs > pagination.limit && (
            <div className="pagination-section mt-4">
              <nav aria-label="Users pagination">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="pagination-info">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDocs
                    )}{" "}
                    trong tổng số {pagination.totalDocs} võ sinh
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => fetchVoSinh(pagination.page - 1)}
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
                      onClick={() => fetchVoSinh(pagination.page + 1)}
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

      {/* Modal for Import Excel */}
      {showImportModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Import võ sinh từ Excel</h5>
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
                  <label className="form-label">Chọn file Excel</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImportFile(file);
                        setImportResult(null);
                      }
                    }}
                    disabled={importing}
                  />
                  <small className="form-text text-muted">
                    Hỗ trợ định dạng: .xlsx, .xls, .xlsm
                  </small>
                </div>

                <div className="alert alert-info">
                  <strong>Định dạng file Excel:</strong>
                  <br />
                  Dòng đầu tiên là tiêu đề với các cột:
                  <ul className="mb-0 mt-2">
                    <li>
                      <strong>Bắt buộc:</strong> Mã hội viên
                    </li>
                    <li>
                      <strong>Khuyến nghị:</strong> Mã CLB, Cấp đai dự thi, Số
                      điện thoại
                    </li>
                    <li>
                      <strong>Tùy chọn:</strong> Họ và tên, Email, Ngày sinh,
                      Giới tính, Mã đơn vị, Quyền số, Địa chỉ, Tên người liên hệ
                      khẩn cấp, SĐT liên hệ khẩn cấp
                    </li>
                  </ul>
                  <small className="text-muted">
                    <strong>Lưu ý:</strong> Email sẽ được tự động tạo từ mã hội
                    viên nếu không được cung cấp.
                  </small>
                </div>

                {importResult && (
                  <div
                    className={`alert ${
                      importResult.failed === 0
                        ? "alert-success"
                        : "alert-warning"
                    }`}
                  >
                    <strong>Kết quả import:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Thành công: {importResult.imported}</li>
                      <li>Thất bại: {importResult.failed}</li>
                    </ul>
                    {importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <strong>Chi tiết lỗi:</strong>
                        <ul
                          className="mb-0 mt-2"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {importResult.errors.map((error, index) => (
                            <li key={index} className="text-danger small">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {importing && (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang import...</span>
                    </div>
                    <p className="mt-2">Đang xử lý file Excel...</p>
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
                  disabled={importing}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={async () => {
                    if (!importFile) {
                      alert("Vui lòng chọn file Excel");
                      return;
                    }

                    setImporting(true);
                    setImportResult(null);

                    try {
                      const result = await usersApi.importExcel(importFile);
                      setImportResult({
                        imported: result.data.imported,
                        failed: result.data.failed,
                        errors: result.data.errors,
                      });

                      // Refresh data if import successful
                      if (result.data.imported > 0) {
                        await fetchVoSinh();
                      }
                    } catch (error: any) {
                      console.error("Error importing Excel:", error);
                      const errorMessage =
                        error?.response?.data?.message ||
                        error?.message ||
                        "Lỗi khi import file Excel";
                      alert(errorMessage);
                      setImportResult({
                        imported: 0,
                        failed: 1,
                        errors: [errorMessage],
                      });
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={importing || !importFile}
                >
                  {importing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang import...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload mr-2"></i>
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <label className="form-label">Cấp đai</label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxHeight: "300px",
                            overflowY: "auto",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          {beltLevels
                            .sort(
                              (a, b) =>
                                (a.order_sequence || 0) -
                                (b.order_sequence || 0)
                            )
                            .map((beltLevel) => {
                              // Determine if color is dark
                              const isDarkColor = (color: string): boolean => {
                                if (!color || !color.startsWith("#"))
                                  return false;
                                try {
                                  const hex = color.replace("#", "");
                                  const r = parseInt(hex.substr(0, 2), 16);
                                  const g = parseInt(hex.substr(2, 2), 16);
                                  const b = parseInt(hex.substr(4, 2), 16);
                                  const brightness =
                                    (r * 299 + g * 587 + b * 114) / 1000;
                                  return brightness < 128;
                                } catch {
                                  return false;
                                }
                              };

                              const isDark = isDarkColor(beltLevel.color || "");
                              const isSelected =
                                formData.cap_dai_id === beltLevel.id;

                              // For dark colors (like Black, Red-Black), use lighter background
                              const bgColor = isDark
                                ? "#6c757d" // Light gray for dark belt colors (sáng hơn màu đen)
                                : beltLevel.color || "#f8f9fa";

                              const textColor = isDark ? "#fff" : "#000";

                              return (
                                <button
                                  key={beltLevel.id}
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      cap_dai_id: beltLevel.id,
                                    })
                                  }
                                  style={{
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: isSelected
                                      ? "2px solid #007bff"
                                      : "1px solid #ddd",
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    fontWeight: isSelected ? "600" : "500",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s",
                                    boxShadow: isSelected
                                      ? "0 2px 4px rgba(0,0,0,0.2)"
                                      : "none",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.backgroundColor =
                                        isDark ? "#868e96" : "#e9ecef";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.backgroundColor =
                                        bgColor;
                                    }
                                  }}
                                >
                                  {beltLevel.name}
                                </button>
                              );
                            })}
                        </div>
                        {beltLevels.length === 0 && (
                          <small className="text-muted">
                            Đang tải danh sách cấp đai...
                          </small>
                        )}
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
