"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@/stores/account";
import { usersApi } from "@/services/api/users";
import Image from "next/image";

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
  const { account, token, updateUser } = useAccountStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      // Helper function to create fallback profile
      const createFallbackProfile = (): UserProfile => {
        if (!account) {
          throw new Error("No account data available");
        }

        return {
          id: parseInt(account.id?.toString() || "0"),
          name: account.name || "Admin",
          email: account.email || "",
          phone: account.phone || "",
          avatar: account.avatar,
          role: account.role || "admin",
          department: account.department || "",
          position: account.position || "",
          bio: "",
          address: "",
          dateOfBirth: "",
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: "active",
        };
      };

      try {
        const response = await usersApi.getProfile();
        console.log("Profile API response:", response);

        // Handle different response formats
        let profileData: any = null;

        if (response) {
          // Case 1: response has data property
          if (
            response.data &&
            typeof response.data === "object" &&
            !Array.isArray(response.data)
          ) {
            profileData = response.data;
          }
          // Case 2: response is the profile object directly
          else if (
            typeof response === "object" &&
            !Array.isArray(response) &&
            response.email
          ) {
            profileData = response;
          }
          // Case 3: response is in nested format
          else if (response.user) {
            profileData = response.user;
          }
        }

        if (profileData && profileData.email) {
          // Valid profile data from API
          const profile: UserProfile = {
            id: profileData.id || parseInt(account?.id?.toString() || "0"),
            name: profileData.name || account?.name || "Admin",
            email: profileData.email || account?.email || "",
            phone:
              profileData.phone ||
              profileData.phoneNumber ||
              account?.phone ||
              "",
            avatar:
              profileData.avatar ||
              profileData.profile_image_url ||
              account?.avatar,
            role: profileData.role || account?.role || "admin",
            department: profileData.department || account?.department || "",
            position: profileData.position || account?.position || "",
            bio: profileData.bio || profileData.biography || "",
            address: profileData.address || "",
            dateOfBirth: profileData.dateOfBirth || profileData.birthDate || "",
            joinDate:
              profileData.joinDate ||
              profileData.createdAt ||
              new Date().toISOString(),
            lastLogin:
              profileData.lastLogin ||
              profileData.lastLoginAt ||
              new Date().toISOString(),
            status: profileData.status || "active",
          };

          setProfile(profile);
          setFormData({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            bio: profile.bio,
            address: profile.address,
            dateOfBirth: profile.dateOfBirth
              ? profile.dateOfBirth.split("T")[0]
              : "",
            department: profile.department,
            position: profile.position,
          });
        } else {
          // No valid profile data, always use fallback from account
          console.warn(
            "No valid profile data from API, using account fallback"
          );
          if (account) {
            const fallbackProfile = createFallbackProfile();
            setProfile(fallbackProfile);
            setFormData({
              name: fallbackProfile.name,
              email: fallbackProfile.email,
              phone: fallbackProfile.phone || "",
              bio: fallbackProfile.bio,
              address: fallbackProfile.address,
              dateOfBirth: fallbackProfile.dateOfBirth
                ? fallbackProfile.dateOfBirth.split("T")[0]
                : "",
              department: fallbackProfile.department,
              position: fallbackProfile.position,
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);

        // Always use fallback on error
        if (account) {
          const fallbackProfile = createFallbackProfile();
          setProfile(fallbackProfile);
          setFormData({
            name: fallbackProfile.name,
            email: fallbackProfile.email,
            phone: fallbackProfile.phone || "",
            bio: fallbackProfile.bio,
            address: fallbackProfile.address,
            dateOfBirth: fallbackProfile.dateOfBirth
              ? fallbackProfile.dateOfBirth.split("T")[0]
              : "",
            department: fallbackProfile.department,
            position: fallbackProfile.position,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchProfile();
    } else {
      // No account, wait a bit and try again
      const timer = setTimeout(() => {
        if (account) {
          fetchProfile();
        } else {
          setLoading(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [account]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("image", avatarFile);

      const response = await usersApi.updateProfileWithAvatar(
        formData,
        token || undefined
      );

      if (response && response.data) {
        const newAvatarUrl =
          response.data.avatar || response.data.profile_image_url;
        setProfile((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : prev));

        // Cập nhật account store để avatar hiển thị ở header
        if (newAvatarUrl) {
          updateUser({ avatar: newAvatarUrl } as any);
        }

        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        alert("Cập nhật avatar thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      alert("Lỗi khi cập nhật avatar. Vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Cập nhật profile qua API
      const response = await usersApi.updateProfile(formData);

      // Cập nhật state local
      if (profile && response) {
        setProfile({
          ...profile,
          ...formData,
          ...(response.data || {}),
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
      <div className="mb-3">
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

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <div className="profile-avatar mb-3 position-relative d-inline-block">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Hồ sơ preview"
                    className="rounded-circle"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Image
                    src={
                      profile.avatar || "/styles/assets/img/users/user-40.jpg"
                    }
                    alt="Hồ sơ"
                    width={120}
                    height={120}
                    className="rounded-circle"
                    unoptimized={!!profile.avatar}
                    style={{
                      objectFit: "cover",
                    }}
                  />
                )}
                {editing && (
                  <div className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="form-control form-control-sm"
                      style={{ display: "none" }}
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      <i className="ti ti-upload me-1"></i>
                      Chọn ảnh
                    </label>
                    {avatarFile && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={handleUploadAvatar}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-check me-1"></i>
                            Lưu ảnh
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
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
