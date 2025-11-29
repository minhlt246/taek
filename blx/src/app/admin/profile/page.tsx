"use client";

import { useState, useEffect, useRef } from "react";
import { useAccountStore } from "@/stores/account";
import { usersApi } from "@/services/api/users";
import { coachesApi, CoachResponse } from "@/services/api/coaches";
import http from "@/services/http";
import Image from "next/image";
import { useAvatar } from "@/hooks/useAvatar";
import { getAvatarUrl } from "@/utils/avatar";

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
  const [avatarRefreshTrigger, setAvatarRefreshTrigger] = useState<number>(Date.now());
  const avatarUrl = useAvatar(account?.id, avatarRefreshTrigger);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback avatar URL - CHỈ dùng khi:
  // 1. API không trả về avatar từ database
  // 2. Avatar từ API load bị lỗi (avatarError = true)
  // 3. Chưa có dữ liệu từ database (đang loading)
  const defaultAvatarUrl = "/client/images/users/user-40.jpg";

  // Logic ưu tiên hiển thị avatar:
  // 1. avatarPreview (khi đang upload/preview ảnh mới)
  // 2. profile.avatar từ state (ưu tiên vì được cập nhật trực tiếp sau upload)
  // 3. avatarUrl từ hook useAvatar (load từ API /coaches/{id})
  // 4. defaultAvatarUrl (FALLBACK - chỉ khi không có dữ liệu từ database)
  // Lưu ý: profile.avatar được ưu tiên hơn avatarUrl vì nó được cập nhật ngay sau khi upload thành công
  const displayAvatarUrl =
    avatarPreview ||
    (profile?.avatar && !avatarError ? profile.avatar : null) ||
    (avatarUrl && !avatarError ? avatarUrl : null) ||
    defaultAvatarUrl;

  // Debug: Log avatar URLs để kiểm tra
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Profile] Avatar URLs:", {
        avatarUrlFromHook: avatarUrl,
        profileAvatar: profile?.avatar,
        avatarPreview,
        avatarError,
        displayAvatarUrl,
      });
    }
  }, [
    avatarUrl,
    profile?.avatar,
    avatarPreview,
    avatarError,
    displayAvatarUrl,
  ]);
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
          avatar: account.avatar || undefined, // Không set default vào state, để logic displayAvatarUrl tự fallback
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
        // Kiểm tra role để gọi đúng API
        // Nếu là admin hoặc owner (coach), gọi API coaches
        // Nếu là student/user, gọi API users
        const userId = account?.id
          ? parseInt(account.id.toString())
          : undefined;

        const isCoach = account?.role === "owner" || account?.role === "admin";

        let response: any = null;

        if (isCoach && userId) {
          // Lấy thông tin coach từ API raw response
          console.log("[Profile] Fetching coach profile for ID:", userId);
          try {
            // Gọi API trực tiếp để lấy raw CoachResponse
            const coachResponse = await http.get(`/coaches/${userId}`);
            const coachData: CoachResponse = coachResponse.data;
            console.log("Coach API raw response:", coachData);

            if (coachData) {
              // Map CoachResponse sang UserProfile format
              // Sử dụng utility function để xử lý avatar URL nhất quán
              // CHỈ set avatar nếu có dữ liệu từ database, không set defaultAvatarUrl vào state
              const processedAvatarUrl = getAvatarUrl(
                coachData.photo_url,
                coachData.images
              );
              // Không set defaultAvatarUrl vào profile.avatar
              // Để logic displayAvatarUrl tự quyết định fallback

              response = {
                id: coachData.id,
                name:
                  coachData.ho_va_ten ||
                  coachData.name ||
                  account?.name ||
                  "Huấn luyện viên",
                email: coachData.email || account?.email || "",
                phone: coachData.phone || account?.phone || "",
                avatar: processedAvatarUrl || undefined, // Chỉ set nếu có từ database
                role: coachData.role || account?.role || "admin",
                department: coachData.specialization || "",
                position:
                  coachData.role === "owner"
                    ? "Chủ sở hữu"
                    : coachData.role === "admin"
                    ? "Huấn luyện viên"
                    : "Huấn luyện viên",
                bio: coachData.bio || "",
                address: coachData.address || "",
                dateOfBirth: coachData.ngay_thang_nam_sinh
                  ? new Date(coachData.ngay_thang_nam_sinh).toISOString()
                  : "",
                joinDate: coachData.created_at || new Date().toISOString(),
                lastLogin: coachData.updated_at || new Date().toISOString(),
                status: coachData.is_active !== false ? "active" : "inactive",
              };
            }
          } catch (error) {
            console.error("[Profile] Error fetching coach:", error);
            // Fallback to coachesApi.getById if direct API call fails
            const coach = await coachesApi.getById(userId);
            if (coach) {
              response = {
                id: coach.id,
                name: coach.name,
                email: coach.email || "",
                phone: coach.phone || "",
                avatar: coach.image || undefined, // Chỉ set nếu có từ database
                role: coach.role || account?.role || "admin",
                department: coach.specialization || "",
                position: coach.title || "Huấn luyện viên",
                bio: coach.bio || "",
                address: "",
                dateOfBirth: "",
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                status: coach.isActive ? "active" : "inactive",
              };
            }
          }
        } else {
          // Lấy thông tin user/student
          console.log("[Profile] Fetching user profile for ID:", userId);
          response = await usersApi.getProfile(userId);
          console.log("User API response:", response);
        }

        // Handle different response formats
        let profileData: any = null;

        if (response) {
          // Nếu response đã được map từ Coach (isCoach case), dùng trực tiếp
          if (isCoach && response.id && response.name) {
            profileData = response;
          }
          // Case 1: response has data property
          else if (
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
            (response.email || response.id)
          ) {
            profileData = response;
          }
          // Case 3: response is in nested format
          else if (response.user) {
            profileData = response.user;
          }
        }

        if (profileData) {
          // Valid profile data from API
          // Nếu đã map từ Coach, dùng trực tiếp
          if (
            isCoach &&
            profileData.id &&
            profileData.name &&
            profileData.role
          ) {
            const profile: UserProfile = profileData as UserProfile;
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
            // Map đầy đủ các field từ API response (user/student case)
            const profile: UserProfile = {
              id: profileData.id || parseInt(account?.id?.toString() || "0"),
              name:
                profileData.name ||
                profileData.ho_va_ten ||
                account?.name ||
                "Admin",
              email: profileData.email || account?.email || "",
              phone:
                profileData.phone ||
                profileData.phoneNumber ||
                account?.phone ||
                "",
              // Sử dụng utility function để xử lý avatar URL nhất quán
              // CHỈ set avatar nếu có từ database, không set default vào state
              avatar: (() => {
                const avatarFromApi =
                  profileData.avatar ||
                  profileData.profile_image_url ||
                  profileData.photo_url;
                const imagesString =
                  typeof profileData.images === "string"
                    ? profileData.images
                    : Array.isArray(profileData.images)
                    ? JSON.stringify(profileData.images)
                    : undefined;
                return (
                  getAvatarUrl(avatarFromApi, imagesString) ||
                  account?.avatar ||
                  undefined
                );
              })(),
              role: profileData.role || account?.role || "admin",
              department:
                profileData.department ||
                profileData.specialization ||
                account?.department ||
                "",
              position:
                profileData.position ||
                (profileData.experience_years
                  ? `Huấn luyện viên (${profileData.experience_years} năm kinh nghiệm)`
                  : profileData.role === "admin" || profileData.role === "owner"
                  ? "Huấn luyện viên"
                  : "Học viên") ||
                account?.position ||
                "",
              bio: profileData.bio || profileData.biography || "",
              address: profileData.address || "",
              dateOfBirth:
                profileData.dateOfBirth ||
                profileData.birthDate ||
                (profileData.ngay_thang_nam_sinh
                  ? new Date(profileData.ngay_thang_nam_sinh).toISOString()
                  : ""),
              joinDate:
                profileData.joinDate ||
                profileData.createdAt?.toISOString() ||
                (profileData.created_at
                  ? new Date(profileData.created_at).toISOString()
                  : new Date().toISOString()),
              lastLogin:
                profileData.lastLogin ||
                profileData.lastLoginAt?.toISOString() ||
                (profileData.updated_at
                  ? new Date(profileData.updated_at).toISOString()
                  : new Date().toISOString()),
              status:
                profileData.status ||
                (profileData.is_active !== undefined
                  ? profileData.is_active
                    ? "active"
                    : "inactive"
                  : profileData.active_status !== undefined
                  ? profileData.active_status
                    ? "active"
                    : "inactive"
                  : "active"),
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
          }
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

  /**
   * Upload avatar image to server and update profile
   * Lưu ảnh vào database thông qua API /auth/profile/avatar
   */
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      alert("Vui lòng chọn ảnh trước khi tải lên");
      return;
    }

    if (!account?.id) {
      alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Tạo FormData với file ảnh và thông tin user
      const formData = new FormData();

      // Kiểm tra file trước khi append
      if (!avatarFile) {
        throw new Error("File không tồn tại");
      }

      // Append file - field name phải khớp với FileInterceptor('image')
      formData.append("image", avatarFile, avatarFile.name);
      formData.append("userId", account.id.toString());
      if (account?.role) {
        formData.append("role", account.role);
      }

      // Log FormData để debug
      console.log("[Profile] Uploading avatar:", {
        userId: account.id,
        role: account.role,
        fileName: avatarFile.name,
        fileSize: avatarFile.size,
        fileType: avatarFile.type,
        hasFile: !!avatarFile,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value:
            value instanceof File
              ? `File: ${value.name} (${value.size} bytes)`
              : value,
        })),
      });

      // Gọi API upload avatar
      const response = await usersApi.updateProfileWithAvatar(
        formData,
        token || undefined
      );

      console.log("[Profile] Avatar upload response:", response);

      if (response && response.success && response.data) {
        // Lấy URL ảnh từ response
        const newAvatarUrl =
          response.data.avatar ||
          response.data.profile_image_url ||
          response.data.photo_url ||
          response.data.user?.avatar;

        if (!newAvatarUrl) {
          throw new Error("Không nhận được URL ảnh từ server");
        }

        // Sử dụng utility function để xử lý avatar URL nhất quán
        // Nếu upload thành công, newAvatarUrl sẽ có giá trị từ API
        const fullAvatarUrl = getAvatarUrl(newAvatarUrl);
        if (!fullAvatarUrl) {
          throw new Error("Không nhận được URL ảnh từ server sau khi upload");
        }
        console.log("[Profile] New avatar URL:", fullAvatarUrl);

        // Cập nhật profile state với ảnh mới
        setProfile((prev) => {
          if (prev) {
            return { ...prev, avatar: fullAvatarUrl };
          }
          return prev;
        });

        // Cập nhật account store để avatar hiển thị ở header
        updateUser({ avatar: fullAvatarUrl } as any);

        // Reset file input và preview
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Trigger refresh hook useAvatar để load avatar mới từ API
        setAvatarRefreshTrigger(Date.now());

        // Reload profile để lấy thông tin mới nhất từ database
        try {
          const userId = account?.id
            ? parseInt(account.id.toString())
            : undefined;
          const isCoach =
            account?.role === "owner" || account?.role === "admin";

          let updatedProfile: any = null;
          if (isCoach && userId) {
            // Reload coach profile
            const coachResponse = await http.get(`/coaches/${userId}`);
            const coachData: CoachResponse = coachResponse.data;

            if (coachData) {
              // Sử dụng utility function để xử lý avatar URL nhất quán
              // CHỈ set avatar nếu có từ database, không set defaultAvatarUrl vào state
              const finalAvatarUrl = getAvatarUrl(
                coachData.photo_url,
                coachData.images
              );

              if (finalAvatarUrl) {
                setProfile((prev) => {
                  if (prev) {
                    return { ...prev, avatar: finalAvatarUrl };
                  }
                  return prev;
                });
                updateUser({ avatar: finalAvatarUrl } as any);
                // Trigger refresh hook useAvatar sau khi reload thành công
                setAvatarRefreshTrigger(Date.now());
              }
              // Nếu không có avatar từ database, để logic displayAvatarUrl tự fallback
            }
          } else {
            // Reload user profile
            updatedProfile = await usersApi.getProfile(userId);
            if (updatedProfile) {
              // Map data từ API response
              let profileData: any = null;
              if (
                updatedProfile.data &&
                typeof updatedProfile.data === "object" &&
                !Array.isArray(updatedProfile.data)
              ) {
                profileData = updatedProfile.data;
              } else if (
                typeof updatedProfile === "object" &&
                !Array.isArray(updatedProfile) &&
                updatedProfile.email
              ) {
                profileData = updatedProfile;
              } else if (updatedProfile.user) {
                profileData = updatedProfile.user;
              }

              if (profileData) {
                // Cập nhật avatar URL từ response
                // Ưu tiên: avatar -> profile_image_url -> photo_url -> images[0]
                // Sử dụng utility function để xử lý avatar URL nhất quán
                // getAvatarUrl sẽ tự động xử lý: avatar -> profile_image_url -> photo_url -> images[0]
                const avatarFromApi =
                  profileData.avatar ||
                  profileData.profile_image_url ||
                  profileData.photo_url;

                // Convert images array thành string nếu cần
                const imagesString =
                  typeof profileData.images === "string"
                    ? profileData.images
                    : Array.isArray(profileData.images)
                    ? JSON.stringify(profileData.images)
                    : undefined;

                // CHỈ set avatar nếu có từ database, không set defaultAvatarUrl vào state
                const finalAvatarUrl = getAvatarUrl(
                  avatarFromApi,
                  imagesString
                );

                if (finalAvatarUrl) {
                  setProfile((prev) => {
                    if (prev) {
                      return { ...prev, avatar: finalAvatarUrl };
                    }
                    return prev;
                  });
                  updateUser({ avatar: finalAvatarUrl } as any);
                  // Trigger refresh hook useAvatar sau khi reload thành công
                  setAvatarRefreshTrigger(Date.now());
                }
                // Nếu không có avatar từ database, để logic displayAvatarUrl tự fallback
              }
            }
          }
        } catch (reloadError) {
          console.warn(
            "[Profile] Error reloading profile after avatar upload:",
            reloadError
          );
          // Không throw error vì upload đã thành công
        }

        alert("Cập nhật avatar thành công!");
      } else {
        throw new Error(response?.message || "Upload avatar thất bại");
      }
    } catch (error: any) {
      console.error("[Profile] Error uploading avatar:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi cập nhật avatar. Vui lòng thử lại.";
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = account?.id ? parseInt(account.id.toString()) : undefined;
      const isCoach = account?.role === "owner" || account?.role === "admin";

      if (isCoach && userId) {
        // Cập nhật coach profile
        const updateData: any = {
          ho_va_ten: formData.name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          specialization: formData.department,
          address: formData.address,
        };

        // Thêm ngày sinh nếu có
        if (formData.dateOfBirth) {
          updateData.ngay_thang_nam_sinh = formData.dateOfBirth;
        }

        const response = await http.patch(`/coaches/${userId}`, updateData);
        const coachData = response.data?.data || response.data;

        // Cập nhật state local
        if (profile && coachData) {
          setProfile({
            ...profile,
            name: coachData.ho_va_ten || coachData.name || formData.name,
            email: coachData.email || formData.email,
            phone: coachData.phone || formData.phone,
            bio: coachData.bio || formData.bio,
            department: coachData.specialization || formData.department,
          });
        }
      } else {
        // Cập nhật user profile
        const response = await usersApi.updateProfile(formData, userId);

        // Cập nhật state local
        if (profile && response) {
          setProfile({
            ...profile,
            ...formData,
            ...(response.data || {}),
          });
        }
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
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
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
                {/* Hiển thị preview khi đang chọn ảnh mới, nếu không thì hiển thị ảnh hiện tại */}
                {avatarPreview ? (
                  <div className="position-relative">
                    <img
                      src={avatarPreview}
                      alt="Hồ sơ preview"
                      className="rounded-circle border border-2 border-primary"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                      }}
                    />
                    {uploadingAvatar && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <span
                          className="spinner-border spinner-border-sm text-white"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="position-relative">
                    <Image
                      src={displayAvatarUrl}
                      alt="Hồ sơ"
                      width={120}
                      height={120}
                      className="rounded-circle"
                      unoptimized={true}
                      style={{
                        objectFit: "cover",
                      }}
                      onError={() => {
                        // Chỉ log error nếu không phải là default avatar (để tránh log khi đang dùng fallback)
                        if (displayAvatarUrl !== defaultAvatarUrl) {
                          console.error(
                            "[Profile] Avatar load error:",
                            displayAvatarUrl
                          );
                          setAvatarError(true);
                        }
                        // Nếu đã là default avatar mà vẫn lỗi, có thể file không tồn tại
                        // Nhưng không cần set error vì đã là fallback cuối cùng
                      }}
                    />
                    {uploadingAvatar && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <span
                          className="spinner-border spinner-border-sm text-white"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </div>
                    )}
                  </div>
                )}
                {/* Nút upload ảnh chỉ hiển thị khi đang ở chế độ chỉnh sửa */}
                {editing && (
                  <div className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="form-control form-control-sm"
                      style={{ display: "none" }}
                      id="avatar-upload"
                      disabled={uploadingAvatar}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className={`btn btn-sm btn-outline-primary me-2 ${
                        uploadingAvatar ? "disabled" : ""
                      }`}
                      style={{
                        cursor: uploadingAvatar ? "not-allowed" : "pointer",
                        opacity: uploadingAvatar ? 0.6 : 1,
                      }}
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
                    {avatarFile && !uploadingAvatar && (
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <i className="ti ti-x me-1"></i>
                        Hủy
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
