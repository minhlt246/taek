"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "student";
  student_code?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { account } = useAccountStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "student">(
    "all"
  );
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student" as "admin" | "student",
    student_code: "",
    phone: "",
    is_active: true,
  });

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = async () => {
      setLoading(true);
      // TODO: Replace with actual API calls
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            role: "student",
            student_code: "ST001",
            phone: "0123456789",
            is_active: true,
            created_at: "2024-01-15",
          },
          {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            role: "student",
            student_code: "ST002",
            phone: "0987654321",
            is_active: true,
            created_at: "2024-01-20",
          },
          {
            id: 3,
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            is_active: true,
            created_at: "2024-01-01",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_code &&
        user.student_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      student_code: user.student_code || "",
      phone: user.phone || "",
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update existing user
        setUsers(
          users.map((user) =>
            user.id === editingUser.id
              ? { ...user, ...formData, updated_at: new Date().toISOString() }
              : user
          )
        );
      } else {
        // Create new user
        const newUser = {
          id: Math.max(...users.map((u) => u.id)) + 1,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      student_code: "",
      phone: "",
      is_active: true,
    });
    setEditingUser(null);
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
    <div className="admin-page">
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage all users in the system</p>
      </div>

      {/* Filters and Actions */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="m-0 font-weight-bold text-primary">Users</h6>
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
                Add New User
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
                  placeholder="Search users..."
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
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Student Code</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
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
                        {user.is_active ? "Active" : "Inactive"}
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
                No users found matching your criteria.
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
                  {editingUser ? "Edit User" : "Add New User"}
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
                        <label className="form-label">Name</label>
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
                        <label className="form-label">Role</label>
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
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Student Code</label>
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
                    <label className="form-label">Phone</label>
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
                      <label className="form-check-label">Active</label>
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? "Update" : "Create"}
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
