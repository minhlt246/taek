"use client";

import { useRef, useState, FormEvent, useEffect } from "react";
import { authApi } from "@/services/api/auth";
import { useAccountStore } from "@/stores/account";
import { useTranslation } from "react-i18next";

/**
 * Modal update profile
 * Send data to API update profile, handle upload avatar (multipart/form-data)
 * @returns JSX modal update profile
 */
export default function UpdateProfileModal() {
  // Get authentication information
  const { t } = useTranslation();
  const { account } = useAccountStore();

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

  useEffect(() => {
    const modalEl = document.getElementById("updateProfile");
    if (!modalEl) return;

    const handleShow = () => {
      setFormData({
        firstName: account.firstName || "",
        lastName: account.lastName || "",
        email: account.email || "",
        phoneNumber: account.phoneNumber || "",
        address: account.address || "",
        avatar: null,
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setMessage(null);
      setMessageType("info");
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    };

    modalEl.addEventListener("show.bs.modal", handleShow);
    return () => {
      modalEl.removeEventListener("show.bs.modal", handleShow);
    };
  }, [account]);

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

  function hasSpecialChars(str: string) {
    // Chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự phổ biến
    return /[^a-zA-Z0-9 @._-]/.test(str);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate các trường
    if (
      hasSpecialChars(formData.firstName) ||
      hasSpecialChars(formData.lastName) ||
      hasSpecialChars(formData.email) ||
      hasSpecialChars(formData.phoneNumber)
    ) {
      setMessage("Fields must not contain special characters.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("address", formData.address);
      if (avatarFile) {
        data.append("image", avatarFile);
      }

      const response = await authApi.updateProfile(data);

      setMessage("Profile updated successfully!");
      setMessageType("success");

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setAvatarFile(null);
      setAvatarPreview(null);

      window.location.reload();
    } catch (error: any) {
      setMessage(
        t(error?.message) || "Failed to update profile. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal fade update-profile-modal"
      id="updateProfile"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex={-1}
      aria-labelledby="updateProfileLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title" id="updateProfileLabel">
              Update Profile
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="profile-note">
              Update your personal information and avatar to keep your profile
              current.
            </div>

            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="form-group avatar-section">
                <label className="form-label">Profile Avatar</label>
                <div className="avatar-upload">
                  <div className="avatar-preview">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="avatar-image"
                      />
                    ) : account.avatarUrl ? (
                      <img
                        src={account.avatarUrl}
                        alt="Current avatar"
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user fa-2x"></i>
                        <span>No Avatar</span>
                      </div>
                    )}
                  </div>
                  <div className="avatar-controls">
                    <input
                      type="file"
                      className="form-control"
                      id="avatar"
                      ref={avatarInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                    <div className="upload-hint">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>Choose image (PNG, JPG, GIF, WebP)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Message Display */}
              {message && (
                <div className={`validation-message ${messageType}`}>
                  <div>{message}</div>
                </div>
              )}

              {/* Submit Section */}
              <div className="submit-section">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading && <span className="loading-spinner" />}
                  {isLoading ? "Updating Profile..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
