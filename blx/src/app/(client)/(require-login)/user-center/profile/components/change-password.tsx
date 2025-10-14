"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/services/api/auth";
import { useLogout } from "@/hooks/useLogout";
import { useValidate } from "@/hooks/useValidate";
import { useTranslation } from "react-i18next";

/**
 * Modal change password
 * Call API /auth/change-password to change password
 * After successful change, automatically logout and redirect to login page
 */
export default function ChangePassword() {
  const { t } = useTranslation();
  // State save value of input fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // State for loading and notification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { logout } = useLogout();
  const { validatePassword } = useValidate();

  // Show/hide password states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get validation results
  const passwordResult = validatePassword(newPassword);
  const isFormValid =
    oldPassword &&
    passwordResult.valid &&
    newPassword === confirmPassword &&
    newPassword &&
    confirmPassword;

  // Reset input khi modal mở
  useEffect(() => {
    const modalEl = document.getElementById("changePasswordModal");
    if (!modalEl) return;

    const handleShow = () => {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(null);
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    };

    modalEl.addEventListener("show.bs.modal", handleShow);
    return () => {
      modalEl.removeEventListener("show.bs.modal", handleShow);
    };
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "oldPassword") {
      setOldPassword(value);
    } else if (name === "newPassword") {
      setNewPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  /**
   * Handle submit form change password
   * @param e - Event submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await authApi.changePassword(oldPassword, newPassword, confirmPassword);
      setSuccess("Password changed successfully! Logging out...");
      logout();
    } catch (err: any) {
      setError(t(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade change-password-modal"
      id="changePasswordModal"
      tabIndex={-1}
      aria-labelledby="changePasswordModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title" id="changePasswordModalLabel">
              Change Password
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="security-note">
              You will be automatically logged out after changing your password
              for security reasons.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="oldPassword" className="form-label">
                  Current Password
                </label>
                <div className="input-group">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    className="form-control"
                    id="oldPassword"
                    name="oldPassword"
                    placeholder="Enter your current password"
                    value={oldPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-group-text">
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      disabled={loading}
                    >
                      <i
                        className={`fas ${
                          showOldPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      />
                    </button>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-group-text">
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      <i
                        className={`fas ${
                          showNewPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      />
                    </button>
                  </span>
                </div>
                {newPassword && (
                  <div
                    className={`validation-message ${
                      passwordResult.valid ? "valid" : "invalid"
                    }`}
                  >
                    {Array.isArray(passwordResult.message) ? (
                      passwordResult.message.map(
                        (item: string, idx: number) => (
                          <div key={idx}>{item}</div>
                        )
                      )
                    ) : (
                      <div>{passwordResult.message}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-group-text">
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      <i
                        className={`fas ${
                          showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      />
                    </button>
                  </span>
                </div>
                {newPassword !== confirmPassword && confirmPassword && (
                  <div className="validation-message invalid">
                    <div>Passwords do not match</div>
                  </div>
                )}
              </div>

              {error && (
                <div className="validation-message error">
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="validation-message success">
                  <div>{success}</div>
                </div>
              )}

              <div className="submit-section">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!isFormValid || loading}
                >
                  {loading && <span className="loading-spinner" />}
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
