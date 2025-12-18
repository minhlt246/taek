"use client";

import { useRef, useState, FormEvent, useEffect } from "react";
import { authApi } from "@/services/api/auth";
import { profileApi } from "@/services/api/profile";
import { useAccountStore } from "@/stores/account";
import { useTranslation } from "react-i18next";
import { useToast } from "@/utils/toast";

/**
 * Modal update profile
 * Send data to API update profile, handle upload avatar (multipart/form-data)
 * @returns JSX modal update profile
 */
interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAvatarFile?: File | null;
  initialAvatarPreview?: string | null;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialAvatarFile,
  initialAvatarPreview,
}: UpdateProfileModalProps) {
  // Get authentication information
  const {} = useTranslation();
  const { account, updateUser } = useAccountStore();

  // State manage form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatar: null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // State loading when submit
  const [isLoading, setIsLoading] = useState(false);
  // State notification result
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  // Ref for input file avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && account) {
      // Split name into first and last name
      const fullName = account.name || "";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: account.email || "",
        phoneNumber: (account as any).phone || "",
        address: (account as any).address || "",
        avatar: null,
      });

      // Set initial avatar file and preview if provided
      if (initialAvatarFile) {
        setAvatarFile(initialAvatarFile);
      }
      if (initialAvatarPreview) {
        setAvatarPreview(initialAvatarPreview);
      } else {
        setAvatarFile(null);
        setAvatarPreview(null);
      }

      setMessage(null);
      setMessageType("info");
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  }, [isOpen, account, initialAvatarFile, initialAvatarPreview]);

  /**
   * Handle change input data
   * @param e Event change input
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  /**
   * Handle select file avatar
   * @param e Event select file
   */
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }

  // Validate email format
  function isValidEmail(email: string): boolean {
    if (!email) return true; // Không bắt buộc
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number format (chỉ số và một số ký tự đặc biệt)
  function isValidPhone(phone: string): boolean {
    if (!phone) return true; // Không bắt buộc
    // Cho phép số, khoảng trắng, dấu +, dấu -, dấu ngoặc đơn
    const phoneRegex = /^[\d\s+\-()]+$/;
    return phoneRegex.test(phone);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate email format nếu có nhập
    if (formData.email && !isValidEmail(formData.email)) {
      setMessage("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
      setMessageType("error");
      return;
    }

    // Validate phone number format nếu có nhập
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      setMessage(
        "Số điện thoại không hợp lệ. Chỉ được chứa số và các ký tự: +, -, (), khoảng trắng."
      );
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // If there's an avatar file, upload it first
      if (avatarFile) {
        try {
          // Get token and account info from account store
          const { token } = useAccountStore.getState();

          // Create FormData with userId and role
          const avatarFormData = new FormData();
          avatarFormData.append("image", avatarFile);
          if (account?.id) {
            avatarFormData.append("userId", String(account.id));
          }
          if (account?.role) {
            avatarFormData.append("role", account.role);
          }

          // Use usersApi directly to upload avatar
          const { usersApi } = await import("@/services/api/users");
          const uploadResponse = await usersApi.updateProfileWithAvatar(
            avatarFormData,
            token || undefined
          );

          if (uploadResponse.success && uploadResponse.data) {
            // Backend trả về avatar, profile_image_url, hoặc photo_url
            let avatarUrl =
              uploadResponse.data.avatarUrl ||
              uploadResponse.data.avatar ||
              uploadResponse.data.profile_image_url ||
              uploadResponse.data.photo_url;

            if (avatarUrl) {
              // Convert relative path thành full URL nếu cần
              const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
              if (avatarUrl.startsWith("client/images/")) {
                avatarUrl = `${apiUrl}/${avatarUrl}`;
              } else if (avatarUrl.startsWith("/uploads/")) {
                avatarUrl = `${apiUrl}${avatarUrl}`;
              } else if (
                !avatarUrl.startsWith("http") &&
                !avatarUrl.startsWith("/")
              ) {
                avatarUrl = `${apiUrl}/${avatarUrl}`;
              }

              // Update account store with new avatar URL
              updateUser({ avatarUrl: avatarUrl } as any);
              useToast.success("Upload ảnh đại diện thành công!");
            } else {
              throw new Error("Không nhận được URL ảnh đại diện từ server");
            }
          } else {
            throw new Error(uploadResponse.message || "Upload ảnh thất bại");
          }
        } catch (avatarError: any) {
          console.error("Error uploading avatar:", avatarError);
          const errorMsg =
            avatarError?.response?.data?.message ||
            avatarError?.message ||
            "Không thể upload ảnh đại diện";
          setMessage(errorMsg);
          setMessageType("error");
          useToast.error(errorMsg);
          setIsLoading(false);
          return;
        }
      }

      // Update profile data - chỉ gửi các trường có giá trị
      const updateData: any = {};

      // Chỉ thêm trường nếu có giá trị
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      if (fullName) {
        updateData.ho_va_ten = fullName;
      }

      if (formData.email) {
        updateData.email = formData.email;
      }

      if (formData.phoneNumber) {
        updateData.phone = formData.phoneNumber;
      }

      if (formData.address) {
        updateData.address = formData.address;
      }

      // Chỉ gọi API nếu có ít nhất một trường cần cập nhật hoặc có avatar
      const hasUpdates = Object.keys(updateData).length > 0 || avatarFile;

      if (hasUpdates) {
        // Use usersApi to update profile
        if (Object.keys(updateData).length > 0) {
          const { usersApi } = await import("@/services/api/users");
          // Truyền userId từ account để backend biết cập nhật user nào
          const userId = account?.id ? Number(account.id) : undefined;
          await usersApi.updateProfile(updateData, userId);
        }

        setMessage("Cập nhật profile thành công!");
        setMessageType("success");
        useToast.success("Cập nhật profile thành công!");
      } else {
        // Nếu không có thay đổi gì, chỉ đóng modal
        setMessage(null);
        onClose();
        return;
      }

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setAvatarFile(null);
      setAvatarPreview(null);

      // Call success callback and close modal
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật profile. Vui lòng thử lại.";
      setMessage(errorMessage);
      setMessageType("error");
      useToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .loading-spinner {
          animation: spin 0.6s linear infinite;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
              Cập nhật Profile
            </h1>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ padding: "24px" }}>
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#f0f7ff",
                borderRadius: "8px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Cập nhật thông tin cá nhân và ảnh đại diện để giữ profile luôn mới
              nhất.
              <strong>
                {" "}
                Tất cả các trường đều không bắt buộc - bạn có thể chỉ cập nhật
                những thông tin muốn thay đổi.
              </strong>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Ảnh đại diện
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "#e9ecef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (account as any)?.avatarUrl ? (
                      <img
                        src={(account as any).avatarUrl}
                        alt="Current avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#999",
                        }}
                      >
                        <span style={{ fontSize: "48px" }}>👤</span>
                        <span style={{ fontSize: "12px", marginTop: "8px" }}>
                          Chưa có ảnh
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ width: "100%", maxWidth: "300px" }}>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      Chọn ảnh (PNG, JPG, GIF, WEBP) - Tối đa 1MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="firstName"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Họ
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="Nhập họ (không bắt buộc)"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Tên
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Nhập tên (không bắt buộc)"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email (không bắt buộc)"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="phoneNumber"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="Nhập số điện thoại (không bắt buộc)"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Address Field */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="address"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="Nhập địa chỉ (không bắt buộc)"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Message Display */}
              {message && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "4px",
                    marginBottom: "16px",
                    backgroundColor:
                      messageType === "success"
                        ? "#d4edda"
                        : messageType === "error"
                          ? "#f8d7da"
                          : "#d1ecf1",
                    color:
                      messageType === "success"
                        ? "#155724"
                        : messageType === "error"
                          ? "#721c24"
                          : "#0c5460",
                    fontSize: "14px",
                  }}
                >
                  {message}
                </div>
              )}

              {/* Submit Section */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isLoading ? "#ccc" : "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {isLoading && (
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #fff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                      className="loading-spinner"
                    />
                  )}
                  {isLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
