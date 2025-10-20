"use client";

import { useState, useEffect } from "react";
import { beltLevelsApi } from "@/services/adminApi";

interface BeltLevel {
  id: number;
  name: string;
  color: string;
  order_sequence: number;
  description: string;
  required_poomsae_code?: string;
  required_poomsae_name?: string;
  created_at: string;
  updated_at: string;
}


export default function BeltLevelsPage() {
  const [beltLevels, setBeltLevels] = useState<BeltLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBeltLevel, setEditingBeltLevel] = useState<BeltLevel | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    description: "",
    order_sequence: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Đang tải danh sách cấp đai...");
        const beltLevelData = await beltLevelsApi.getAll();
        console.log("Dữ liệu cấp đai từ API:", beltLevelData);
        setBeltLevels(beltLevelData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        // Tạm thời sử dụng dữ liệu mẫu khi API không hoạt động
        const sampleData = [
          {
            id: 1,
            name: "Cấp 8",
            color: "White",
            description: "Đai trắng cấp 8",
            order_sequence: 1,
            required_poomsae_code: "TG1",
            required_poomsae_name: "Thái cực 1 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Cấp 7",
            color: "Yellow",
            description: "Đai vàng cấp 7",
            order_sequence: 2,
            required_poomsae_code: "TG2",
            required_poomsae_name: "Thái cực 2 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            name: "Cấp 6",
            color: "Green",
            description: "Đai xanh lá cấp 6",
            order_sequence: 3,
            required_poomsae_code: "TG3",
            required_poomsae_name: "Thái cực 3 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 4,
            name: "Cấp 5",
            color: "Blue",
            description: "Đai xanh dương cấp 5",
            order_sequence: 4,
            required_poomsae_code: "TG4",
            required_poomsae_name: "Thái cực 4 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 5,
            name: "Cấp 4",
            color: "Red",
            description: "Đai đỏ cấp 4",
            order_sequence: 5,
            required_poomsae_code: "TG5",
            required_poomsae_name: "Thái cực 5 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 6,
            name: "Cấp 3",
            color: "Red",
            description: "Đai đỏ cấp 3",
            order_sequence: 6,
            required_poomsae_code: "TG6",
            required_poomsae_name: "Thái cực 6 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 7,
            name: "Cấp 2",
            color: "Red",
            description: "Đai đỏ cấp 2",
            order_sequence: 7,
            required_poomsae_code: "TG7",
            required_poomsae_name: "Thái cực 7 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 8,
            name: "Cấp 1",
            color: "Red",
            description: "Đai đỏ cấp 1",
            order_sequence: 8,
            required_poomsae_code: "TG8",
            required_poomsae_name: "Thái cực 8 Jang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 9,
            name: "Nhất đẳng (1 Dan)",
            color: "Black",
            description: "Đai đen 1 đẳng",
            order_sequence: 9,
            required_poomsae_code: "KR",
            required_poomsae_name: "Koryo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 10,
            name: "Nhị đẳng (2 Dan)",
            color: "Black",
            description: "Đai đen 2 đẳng",
            order_sequence: 10,
            required_poomsae_code: "KG",
            required_poomsae_name: "Keumgang",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 11,
            name: "Tam đẳng (3 Dan)",
            color: "Black",
            description: "Đai đen 3 đẳng",
            order_sequence: 11,
            required_poomsae_code: "TB",
            required_poomsae_name: "Taebaek",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 12,
            name: "Tứ đẳng (4 Dan)",
            color: "Black",
            description: "Đai đen 4 đẳng",
            order_sequence: 12,
            required_poomsae_code: "PW",
            required_poomsae_name: "Pyongwon",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 13,
            name: "Ngũ đẳng (5 Dan)",
            color: "Black",
            description: "Đai đen 5 đẳng",
            order_sequence: 13,
            required_poomsae_code: "SJ",
            required_poomsae_name: "Sipjin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 14,
            name: "Lục đẳng (6 Dan)",
            color: "Black",
            description: "Đai đen 6 đẳng",
            order_sequence: 14,
            required_poomsae_code: "JT",
            required_poomsae_name: "Jitae",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 15,
            name: "Thất đẳng (7 Dan)",
            color: "Black",
            description: "Đai đen 7 đẳng",
            order_sequence: 15,
            required_poomsae_code: "CK",
            required_poomsae_name: "Cheonkwon",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 16,
            name: "Bát đẳng (8 Dan)",
            color: "Black",
            description: "Đai đen 8 đẳng",
            order_sequence: 16,
            required_poomsae_code: "HS",
            required_poomsae_name: "Hansoo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 17,
            name: "Cửu đẳng (9 Dan)",
            color: "Black",
            description: "Đai đen 9 đẳng",
            order_sequence: 17,
            required_poomsae_code: "IY",
            required_poomsae_name: "Ilyeo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 18,
            name: "Thập đẳng (10 Dan)",
            color: "Black",
            description: "Đai đen 10 đẳng",
            order_sequence: 18,
            required_poomsae_code: "IY",
            required_poomsae_name: "Ilyeo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setBeltLevels(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBeltLevel) {
        // Cập nhật cấp đai hiện có
        const updatedBeltLevel = await beltLevelsApi.update(
          editingBeltLevel.id,
          formData
        );
        // Cập nhật state local
        setBeltLevels(
          beltLevels.map((beltLevel) =>
            beltLevel.id === editingBeltLevel.id ? updatedBeltLevel : beltLevel
          )
        );
      } else {
        // Tạo cấp đai mới
        const newBeltLevel = await beltLevelsApi.create(formData);
        // Thêm vào state local
        setBeltLevels([...beltLevels, newBeltLevel]);
      }

      setShowModal(false);
      setEditingBeltLevel(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi lưu cấp đai:", error);
      alert("Lỗi khi lưu cấp đai. Vui lòng thử lại.");
    }
  };

  const handleEdit = (beltLevel: BeltLevel) => {
    setEditingBeltLevel(beltLevel);
    setFormData({
      name: beltLevel.name,
      color: beltLevel.color,
      description: beltLevel.description,
      order_sequence: beltLevel.order_sequence,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa cấp đai này?")) {
      try {
        await beltLevelsApi.delete(id);
        // Xóa khỏi state local
        setBeltLevels(beltLevels.filter((beltLevel) => beltLevel.id !== id));
        alert("Xóa cấp đai thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa cấp đai:", error);
        alert("Lỗi khi xóa cấp đai. Vui lòng thử lại.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: "",
      description: "",
      order_sequence: 1,
    });
    setEditingBeltLevel(null);
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
    <div className="belt-levels-page">
      <div className="page-header">
        <h2>Quản lý cấp đai</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm cấp đai mới
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Tên cấp đai</th>
                  <th>Màu sắc</th>
                  <th>Bài quyền</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {beltLevels
                  .sort((a, b) => a.order_sequence - b.order_sequence)
                  .map((beltLevel) => (
                    <tr key={beltLevel.id}>
                      <td>
                        <span className="badge bg-secondary">
                          {beltLevel.order_sequence}
                        </span>
                      </td>
                      <td>
                        <strong>{beltLevel.name}</strong>
                      </td>
                      <td>
                        <div
                          className="belt-color-preview"
                          style={{
                            width: "40px",
                            height: "20px",
                            backgroundColor: beltLevel.color,
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            display: "inline-block",
                          }}
                        ></div>
                        <span className="ms-2">{beltLevel.color}</span>
                      </td>
                      <td>
                        {beltLevel.required_poomsae_name ? (
                          <div>
                            <span className="badge bg-info me-1">
                              {beltLevel.required_poomsae_code}
                            </span>
                            <br />
                            <small className="text-muted">
                              {beltLevel.required_poomsae_name}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div
                          className="text-wrap"
                          style={{ maxWidth: "300px" }}
                        >
                          {beltLevel.description}
                        </div>
                      </td>
                      <td>
                        {new Date(beltLevel.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td>
                        {new Date(beltLevel.updated_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(beltLevel)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(beltLevel.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Hiển thị khi không có dữ liệu */}
            {beltLevels.length === 0 && !loading && (
              <div className="text-center py-4">
                <i className="fas fa-medal fa-3x text-muted mb-3"></i>
                <p className="text-muted">
                  Chưa có cấp đai nào. Hãy thêm cấp đai đầu tiên!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal cho Thêm/Chỉnh sửa Cấp đai */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBeltLevel ? "Chỉnh sửa cấp đai" : "Thêm cấp đai mới"}
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
                        <label className="form-label">Tên cấp đai</label>
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
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Màu sắc</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={formData.color}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Thứ tự</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.order_sequence}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              order_sequence: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Mô tả về cấp đai này..."
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
                    {editingBeltLevel ? "Cập nhật" : "Tạo mới"}
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
