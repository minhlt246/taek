"use client";

import { useState, useEffect } from "react";
import { beltLevelsApi } from "@/services/adminApi";

interface BeltLevel {
  id: number;
  name: string;
  color: string;
  description: string;
  requirements: string;
  minimumAge: number;
  trainingHours: number;
  testFee: number;
  order: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
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
    requirements: "",
    minimumAge: 6,
    trainingHours: 0,
    testFee: 0,
    order: 1,
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    // Simulate API call to fetch belt levels
    const fetchBeltLevels = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => {
        setBeltLevels([
          {
            id: 1,
            name: "White Belt",
            color: "#FFFFFF",
            description: "Beginning level - no previous experience required",
            requirements: "Basic stance, basic kicks, basic blocks",
            minimumAge: 6,
            trainingHours: 0,
            testFee: 0,
            order: 1,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 2,
            name: "Yellow Belt",
            color: "#FFFF00",
            description: "First colored belt - basic techniques mastered",
            requirements:
              "All white belt techniques, front kick, roundhouse kick",
            minimumAge: 6,
            trainingHours: 20,
            testFee: 200000,
            order: 2,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 3,
            name: "Orange Belt",
            color: "#FFA500",
            description: "Intermediate level - developing power and speed",
            requirements: "All yellow belt techniques, side kick, back kick",
            minimumAge: 7,
            trainingHours: 40,
            testFee: 250000,
            order: 3,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 4,
            name: "Green Belt",
            color: "#008000",
            description: "Advanced intermediate - technique refinement",
            requirements:
              "All orange belt techniques, spinning kicks, combinations",
            minimumAge: 8,
            trainingHours: 60,
            testFee: 300000,
            order: 4,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 5,
            name: "Blue Belt",
            color: "#0000FF",
            description: "Senior intermediate - advanced techniques",
            requirements: "All green belt techniques, jumping kicks, sparring",
            minimumAge: 9,
            trainingHours: 80,
            testFee: 350000,
            order: 5,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 6,
            name: "Brown Belt",
            color: "#8B4513",
            description: "Pre-black belt level - mastery preparation",
            requirements:
              "All blue belt techniques, advanced forms, leadership",
            minimumAge: 10,
            trainingHours: 100,
            testFee: 400000,
            order: 6,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 7,
            name: "Red Belt",
            color: "#FF0000",
            description: "High level - near black belt mastery",
            requirements:
              "All brown belt techniques, teaching skills, philosophy",
            minimumAge: 12,
            trainingHours: 120,
            testFee: 500000,
            order: 7,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          {
            id: 8,
            name: "Black Belt",
            color: "#000000",
            description: "Master level - beginning of true learning",
            requirements:
              "All previous techniques, mastery of forms, teaching ability",
            minimumAge: 14,
            trainingHours: 200,
            testFee: 1000000,
            order: 8,
            status: "active",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchBeltLevels();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBeltLevel) {
        // Update existing belt level
        await beltLevelsApi.update(editingBeltLevel.id, formData);
        // Update local state
        setBeltLevels(
          beltLevels.map((beltLevel) =>
            beltLevel.id === editingBeltLevel.id
              ? {
                  ...beltLevel,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : beltLevel
          )
        );
      } else {
        // Create new belt level
        const newBeltLevel = await beltLevelsApi.create(formData);
        // Add to local state
        setBeltLevels([
          ...beltLevels,
          {
            ...newBeltLevel,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingBeltLevel(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save belt level:", error);
      alert("Failed to save belt level. Please try again.");
    }
  };

  const handleEdit = (beltLevel: BeltLevel) => {
    setEditingBeltLevel(beltLevel);
    setFormData({
      name: beltLevel.name,
      color: beltLevel.color,
      description: beltLevel.description,
      requirements: beltLevel.requirements,
      minimumAge: beltLevel.minimumAge,
      trainingHours: beltLevel.trainingHours,
      testFee: beltLevel.testFee,
      order: beltLevel.order,
      status: beltLevel.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this belt level?")) {
      try {
        await beltLevelsApi.delete(id);
        // Remove from local state
        setBeltLevels(beltLevels.filter((beltLevel) => beltLevel.id !== id));
        alert("Belt level deleted successfully!");
      } catch (error) {
        console.error("Failed to delete belt level:", error);
        alert("Failed to delete belt level. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: "",
      description: "",
      requirements: "",
      minimumAge: 6,
      trainingHours: 0,
      testFee: 0,
      order: 1,
      status: "active",
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
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="belt-levels-page">
      <div className="page-header">
        <h2>Belt Levels Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Belt Level
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Belt</th>
                  <th>Name</th>
                  <th>Min Age</th>
                  <th>Training Hours</th>
                  <th>Test Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {beltLevels
                  .sort((a, b) => a.order - b.order)
                  .map((beltLevel) => (
                    <tr key={beltLevel.id}>
                      <td>
                        <span className="badge bg-secondary">
                          {beltLevel.order}
                        </span>
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
                          }}
                        ></div>
                      </td>
                      <td>
                        <div>
                          <strong>{beltLevel.name}</strong>
                          <br />
                          <small className="text-muted">
                            {beltLevel.description}
                          </small>
                        </div>
                      </td>
                      <td>{beltLevel.minimumAge} years</td>
                      <td>{beltLevel.trainingHours} hours</td>
                      <td>
                        {beltLevel.testFee > 0
                          ? formatCurrency(beltLevel.testFee)
                          : "Free"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            beltLevel.status === "active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {beltLevel.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(beltLevel)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(beltLevel.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Belt Level */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBeltLevel ? "Edit Belt Level" : "Add New Belt Level"}
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
                        <label className="form-label">Belt Name</label>
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
                        <label className="form-label">Color</label>
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
                        <label className="form-label">Order</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              order: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Requirements</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: e.target.value,
                        })
                      }
                      placeholder="List the techniques and skills required for this belt level..."
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Minimum Age</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.minimumAge}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minimumAge: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Training Hours</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.trainingHours}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trainingHours: parseInt(e.target.value),
                            })
                          }
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Test Fee (VND)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.testFee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              testFee: parseInt(e.target.value),
                            })
                          }
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBeltLevel ? "Update" : "Create"}
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
