"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/services/api/auth";
import { useToast } from "@/utils/toast";

type UserRole = "student" | "parent";

/**
 * Kiểm tra email có phải là Gmail không
 * @param email - Email cần kiểm tra
 * @returns true nếu là Gmail, false nếu không
 */
const isGmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@gmail\.com$/i;
  return emailRegex.test(email);
};

/**
 * Kiểm tra mật khẩu có đáp ứng yêu cầu không
 * @param password - Mật khẩu cần kiểm tra
 * @returns Object chứa kết quả kiểm tra và thông báo lỗi
 */
const validatePassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Kiểm tra tối thiểu 8 ký tự
  if (password.length < 8) {
    errors.push("Mật khẩu phải có tối thiểu 8 ký tự");
  }

  // Kiểm tra có chữ viết hoa
  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự viết hoa");
  }

  // Kiểm tra có số
  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 số");
  }

  // Kiểm tra có ký tự đặc biệt
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Xử lý submit form đăng ký
   * @param e - Event form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Kiểm tra thông tin bắt buộc
    if (!name || !email || !password || !confirmPassword) {
      useToast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validation: Kiểm tra vai trò đã được chọn
    if (!userRole) {
      useToast.error("Vui lòng chọn vai trò đăng ký");
      return;
    }

    // Validation: Kiểm tra email phải là Gmail
    if (!isGmail(email)) {
      useToast.error("Vui lòng sử dụng địa chỉ email Gmail (@gmail.com)");
      return;
    }

    // Validation: Kiểm tra mật khẩu
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      useToast.error(passwordValidation.errors.join(", "));
      return;
    }

    // Validation: Kiểm tra mật khẩu xác nhận có khớp không
    if (password !== confirmPassword) {
      useToast.error("Mật khẩu xác nhận không khớp với mật khẩu");
      return;
    }

    // Validation: Kiểm tra mật khẩu xác nhận cũng phải đáp ứng yêu cầu
    if (confirmPassword && password === confirmPassword) {
      const confirmPasswordValidation = validatePassword(confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        useToast.error("Mật khẩu xác nhận không đáp ứng yêu cầu");
        return;
      }
    }

    // Validation: Kiểm tra đồng ý điều khoản
    if (!agreeTerms) {
      useToast.error("Vui lòng đồng ý với Điều khoản & Quyền riêng tư");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        name,
        email,
        password,
        role: userRole,
      });

      if (response.success) {
        const roleText = userRole === "student" ? "học sinh" : "phụ huynh";
        useToast.success(
          `Đăng ký thành công với vai trò ${roleText}! Vui lòng đăng nhập.`
        );
        router.push("/login");
      }
    } catch (error: any) {
      useToast.error(
        error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="main-wrapper">
        <div className="overflow-hidden p-3 acc-vh">
          <div className="row vh-100 w-100 g-0">
            {/* Left Column - Form */}
            <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
              <div className="row">
                <div className="col-md-10 mx-auto">
                  <form
                    onSubmit={handleSubmit}
                    className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
                  >
                    <div className="text-center mb-3 auth-logo">
                      <img
                        src="/client/images/logo.png"
                        className="img-fluid "
                        alt="Logo"
                        style={{
                          
                        }}
                        width={50}
                        height={50}
                      />
                    </div>
                    <div>
                      <div className="mb-3">
                        <h3 className="mb-2">Đăng Ký</h3>
                        <p className="mb-0">Tạo tài khoản mới</p>
                      </div>
                      <style
                        dangerouslySetInnerHTML={{
                          __html: `
                          .role-radio-input:checked {
                            background-color: #0d6efd !important;
                            border-color: #0d6efd !important;
                            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
                          }
                          .role-radio-input:focus {
                            border-color: #86b7fe !important;
                            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
                          }
                          .role-radio-input {
                            border-color: #dee2e6;
                            cursor: pointer;
                            width: 1.25em;
                            height: 1.25em;
                          }
                          .role-radio-label {
                            cursor: pointer;
                            user-select: none;
                          }
                        `,
                        }}
                      />
                      <div className="mb-3">
                        <label className="form-label">
                          Bạn đăng ký với vai trò là gì?
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check form-check-md flex-fill">
                            <input
                              className="form-check-input role-radio-input"
                              type="radio"
                              name="userRole"
                              id="role-student"
                              value="student"
                              checked={userRole === "student"}
                              onChange={(e) =>
                                setUserRole(e.target.value as UserRole)
                              }
                            />
                            <label
                              className="form-check-label role-radio-label"
                              htmlFor="role-student"
                            >
                              <i className="ti ti-user me-1"></i>
                              Học sinh
                            </label>
                          </div>
                          <div className="form-check form-check-md flex-fill">
                            <input
                              className="form-check-input role-radio-input"
                              type="radio"
                              name="userRole"
                              id="role-parent"
                              value="parent"
                              checked={userRole === "parent"}
                              onChange={(e) =>
                                setUserRole(e.target.value as UserRole)
                              }
                            />
                            <label
                              className="form-check-label role-radio-label"
                              htmlFor="role-parent"
                            >
                              <i className="ti ti-users me-1"></i>
                              Phụ huynh
                            </label>
                          </div>
                        </div>
                        <small className="text-muted d-block mt-2">
                          {userRole === "student"
                            ? "Đăng ký tài khoản cho học sinh. Thông tin chi tiết sẽ được bổ sung sau."
                            : "Đăng ký tài khoản cho phụ huynh. Thông tin chi tiết sẽ được bổ sung sau."}
                        </small>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Họ và Tên</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập họ và tên"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ paddingRight: "40px" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              color: "#999",
                              fontSize: "16px",
                            }}
                          >
                            <i className="ti ti-user"></i>
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="input-group input-group-flat">
                          <input
                            type="email"
                            className={`form-control ${
                              email && !isGmail(email) ? "is-invalid" : ""
                            }`}
                            placeholder="Nhập email Gmail của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <span className="input-group-text">
                            <i className="ti ti-mail"></i>
                          </span>
                        </div>
                        {email && !isGmail(email) && (
                          <small className="text-danger">
                            <i className="ti ti-alert-circle me-1"></i>
                            Vui lòng sử dụng địa chỉ email Gmail (@gmail.com)
                          </small>
                        )}
                        {email && isGmail(email) && (
                          <small className="text-success">
                            <i className="ti ti-check me-1"></i>
                            Email hợp lệ
                          </small>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-group input-group-flat pass-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control pass-input"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <span
                            className="input-group-text toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className={`ti ${
                                showPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                            ></i>
                          </span>
                        </div>
                        {password && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-1">
                              Yêu cầu mật khẩu:
                            </small>
                            <ul
                              className="list-unstyled mb-0"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <li
                                className={
                                  password.length >= 8
                                    ? "text-success"
                                    : "text-muted"
                                }
                              >
                                <i
                                  className={`ti ${
                                    password.length >= 8
                                      ? "ti-check"
                                      : "ti-circle"
                                  } me-1`}
                                ></i>
                                Tối thiểu 8 ký tự
                              </li>
                              <li
                                className={
                                  /[A-Z]/.test(password)
                                    ? "text-success"
                                    : "text-muted"
                                }
                              >
                                <i
                                  className={`ti ${
                                    /[A-Z]/.test(password)
                                      ? "ti-check"
                                      : "ti-circle"
                                  } me-1`}
                                ></i>
                                Có ký tự viết hoa
                              </li>
                              <li
                                className={
                                  /[0-9]/.test(password)
                                    ? "text-success"
                                    : "text-muted"
                                }
                              >
                                <i
                                  className={`ti ${
                                    /[0-9]/.test(password)
                                      ? "ti-check"
                                      : "ti-circle"
                                  } me-1`}
                                ></i>
                                Có số
                              </li>
                              <li
                                className={
                                  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                    password
                                  )
                                    ? "text-success"
                                    : "text-muted"
                                }
                              >
                                <i
                                  className={`ti ${
                                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                      password
                                    )
                                      ? "ti-check"
                                      : "ti-circle"
                                  } me-1`}
                                ></i>
                                Có ký tự đặc biệt
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group input-group-flat pass-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`form-control pass-input ${
                              confirmPassword && password !== confirmPassword
                                ? "is-invalid"
                                : confirmPassword &&
                                  password === confirmPassword &&
                                  password
                                ? "is-valid"
                                : ""
                            }`}
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <span
                            className="input-group-text toggle-password"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <i
                              className={`ti ${
                                showConfirmPassword ? "ti-eye" : "ti-eye-off"
                              }`}
                            ></i>
                          </span>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <small className="text-danger">
                            <i className="ti ti-alert-circle me-1"></i>
                            Mật khẩu xác nhận không khớp
                          </small>
                        )}
                        {confirmPassword &&
                          password === confirmPassword &&
                          password && (
                            <small className="text-success">
                              <i className="ti ti-check me-1"></i>
                              Mật khẩu xác nhận khớp
                            </small>
                          )}
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="form-check form-check-md d-flex align-items-center">
                          <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            id="agree-terms"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                          />
                          <label
                            className="form-check-label ms-1"
                            htmlFor="agree-terms"
                          >
                            Tôi đồng ý với{" "}
                            <a
                              href="javascript:void(0);"
                              className="text-primary link-hover"
                            >
                              Điều khoản & Quyền riêng tư
                            </a>
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={loading}
                        >
                          {loading ? "Đang đăng ký..." : "Đăng Ký"}
                        </button>
                      </div>
                      <div className="mb-3">
                        <p className="mb-0">
                          Đã có tài khoản?{" "}
                          <Link
                            href="/login"
                            className="link-indigo fw-bold link-hover"
                          >
                            Đăng nhập ngay
                          </Link>
                        </p>
                      </div>
                      <div className="or-login text-center position-relative mb-3">
                        <h6 className="fs-14 mb-0 position-relative text-body">
                          HOẶC
                        </h6>
                      </div>
                      <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-info d-flex align-items-center justify-content-center"
                          >
                            <img
                              className="img-fluid m-1"
                              src="/client/images/icons/facebook-logo.svg"
                              alt="Facebook"
                            />
                          </a>
                        </div>
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center"
                          >
                            <img
                              className="img-fluid m-1"
                              src="/client/images/icons/google-logo.svg"
                              alt="Google"
                            />
                          </a>
                        </div>
                        <div className="text-center flex-fill">
                          <a
                            href="javascript:void(0);"
                            className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                          >
                            <img
                              className="img-fluid m-1"
                              src="/client/images/icons/apple-logo.svg"
                              alt="Apple"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="text-center pb-4">
                      <p className="text-dark mb-0">
                        Copyright &copy; {new Date().getFullYear()} - Taekwondo
                        Đồng Phú
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* Right Column - Logo */}
            <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
              <div className="text-center p-5">
                <Image
                  src="/client/images/logo.png"
                  alt="Taekwondo Đồng Phú Logo"
                  width={500}
                  height={500}
                  className="img-fluid"
                  priority
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
