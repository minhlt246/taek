"use client";

import { useState, useEffect } from "react";
import { branchesApi } from "@/services/adminApi";

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const data = await branchesApi.getAll();
        setBranches(data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        // Update existing branch
        await branchesApi.update(editingBranch.id, formData);
        // Update local state
        setBranches(
          branches.map((branch) =>
            branch.id === editingBranch.id
              ? { ...branch, ...formData, updatedAt: new Date().toISOString() }
              : branch
          )
        );
      } else {
        // Create new branch
        const newBranch = await branchesApi.create(formData);
        // Add to local state
        setBranches([
          ...branches,
          {
            ...newBranch,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setEditingBranch(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save branch:", error);
      alert("Failed to save branch. Please try again.");
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        await branchesApi.delete(id);
        // Remove from local state
        setBranches(branches.filter((branch) => branch.id !== id));
        alert("Branch deleted successfully!");
      } catch (error) {
        console.error("Failed to delete branch:", error);
        alert("Failed to delete branch. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      status: "active",
    });
    setEditingBranch(null);
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
    <div className="branches-page">
      <div className="page-header">
        <h2>Branches Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Branch
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.id}</td>
                    <td>{branch.name}</td>
                    <td>{branch.address}</td>
                    <td>{branch.phone}</td>
                    <td>{branch.email}</td>
                    <td>{branch.manager}</td>
                    <td>
                      <span
                        className={`badge ${
                          branch.status === "active"
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {branch.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(branch)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(branch.id)}
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

      {/* Modal for Add/Edit Branch */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
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
                    <label className="form-label">Branch Name</label>
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
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
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
                  <div className="mb-3">
                    <label className="form-label">Manager</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.manager}
                      onChange={(e) =>
                        setFormData({ ...formData, manager: e.target.value })
                      }
                      required
                    />
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
                    {editingBranch ? "Update" : "Create"}
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
