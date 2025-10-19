"use client";

import { useState, useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { usersApi } from "@/services/adminApi";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  department: string;
  position: string;
  bio: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  lastLogin: string;
  status: "active" | "inactive";
}

export default function ProfilePage() {
  const { account } = useAccountStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    address: "",
    dateOfBirth: "",
    department: "",
    position: "",
  });

  useEffect(() => {
    // Lấy thông tin profile từ API
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // TODO: Thay thế bằng API call thực tế
        // const response = await api.get('/profile');
        // setProfile(response.data);
        setProfile(null);
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Cập nhật profile qua API
      await usersApi.updateProfile(formData);

      // Cập nhật state local
      if (profile) {
        setProfile({
          ...profile,
          ...formData,
          updatedAt: new Date().toISOString(),
        });
      }

      setEditing(false);
      alert("Cập nhật profile thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      alert("Lỗi khi cập nhật profile. Vui lòng thử lại.");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        department: profile.department,
        position: profile.position,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!profile) {
    return (
      <div className="alert alert-danger" role="alert">
        Không thể tải thông tin hồ sơ.
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>Hồ sơ của tôi</h2>
        <div>
          {!editing ? (
            <button
              className="btn btn-primary"
              onClick={() => setEditing(true)}
            >
              <i className="fas fa-edit mr-2"></i>
              Chỉnh sửa hồ sơ
            </button>
          ) : (
            <div className="btn-group">
              <button className="btn btn-success" onClick={handleSubmit}>
                <i className="fas fa-save mr-2"></i>
                Lưu thay đổi
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                <i className="fas fa-times mr-2"></i>
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <div className="profile-avatar mb-3">
                <img
                  src={profile.avatar || "/images/default-avatar.jpg"}
                  alt="Hồ sơ"
                  className="rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <h4 className="mb-1">{profile.name}</h4>
              <p className="text-muted mb-2">{profile.position}</p>
              <span
                className={`badge ${
                  profile.status === "active" ? "bg-success" : "bg-secondary"
                } mb-3`}
              >
                {profile.status}
              </span>
              <div className="profile-stats">
                <div className="row text-center">
                  <div className="col-6">
                    <div className="border-end">
                      <h5 className="mb-0">Admin</h5>
                      <small className="text-muted">Vai trò</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <h5 className="mb-0">{profile.department}</h5>
                    <small className="text-muted">Phòng ban</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card shadow mb-4">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">
                Thông tin tài khoản
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Thành viên từ:</strong>
                <br />
                <span className="text-muted">
                  {formatDate(profile.joinDate)}
                </span>
              </div>
              <div className="mb-3">
                <strong>Đăng nhập cuối:</strong>
                <br />
                <span className="text-muted">
                  {formatDateTime(profile.lastLogin)}
                </span>
              </div>
              <div>
                <strong>User ID:</strong>
                <br />
                <span className="text-muted">#{profile.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header">
              <h6 className="m-0 font-weight-bold text-primary">
                Profile Details
              </h6>
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
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
                        <label className="form-label">Ngày sinh</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Phòng ban</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.department}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Chức vụ</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tiểu sử</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Full Name:</strong>
                    </div>
                    <div className="col-sm-9">{profile.name}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Email:</strong>
                    </div>
                    <div className="col-sm-9">{profile.email}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Phone:</strong>
                    </div>
                    <div className="col-sm-9">{profile.phone}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Date of Birth:</strong>
                    </div>
                    <div className="col-sm-9">
                      {formatDate(profile.dateOfBirth)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Department:</strong>
                    </div>
                    <div className="col-sm-9">{profile.department}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Position:</strong>
                    </div>
                    <div className="col-sm-9">{profile.position}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <strong>Address:</strong>
                    </div>
                    <div className="col-sm-9">{profile.address}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3">
                      <strong>Bio:</strong>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted">{profile.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
