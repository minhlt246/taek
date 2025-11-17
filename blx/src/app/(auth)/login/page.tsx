"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/utils/toast";
import { useAccountStore } from "@/stores/account";
import { useValidate } from "@/hooks/useValidate";
import { authApi } from "@/services/api/auth";

// Google Sign-In disabled
// import { GoogleLogin } from "@react-oauth/google";
// import { GoogleProvider } from "@/components/providers/GoogleProvider";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAccount, setLoginSuccess } = useAccountStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const { validateUsername } = useValidate();
  const usernameResult = validateUsername(username);
  const isFormValid = usernameResult.valid && password.trim() !== "";

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    const rememberedPassword = localStorage.getItem("rememberedPassword");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }

    // Check for error in URL params and clear if it's undefined
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get("error");
    if (errorParam === "undefined" || !errorParam) {
      // Clear error param from URL if it's undefined
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("error");
      const newUrl =
        window.location.pathname +
        (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
      if (newUrl !== window.location.pathname + window.location.search) {
        window.history.replaceState({}, "", newUrl);
      }
    }

    // Bỏ qua lỗi từ browser extensions (cursor, writing tools, etc.)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const isExtensionError =
        error?.reqInfo?.pathPrefix === "/writing" ||
        error?.reqInfo?.path?.includes("/writing") ||
        error?.message?.includes("permission error") ||
        (error?.code === 403 && error?.reqInfo?.pathPrefix);

      if (isExtensionError) {
        // Đây là lỗi từ extension, bỏ qua
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    try {
      // Gọi trực tiếp backend API thay vì qua NextAuth
      const response = await authApi.login({
        email: username, // Backend sẽ tự động detect email, username, phone, hoặc ma_hoi_vien
        password: password,
      });

      // Kiểm tra response từ backend
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token || "";

        // Tạo user object với đầy đủ thông tin
        const user = {
          id: userData.id?.toString() || String(userData.id || ""),
          email: userData.email || "",
          name: userData.name || userData.ho_va_ten || "",
          role: userData.role || "student",
          phone: userData.phone || "",
          ma_hoi_vien: userData.ma_hoi_vien || "",
        };

        // Validate user data
        if (!user.id || (!user.email && !user.name)) {
          useToast.error(
            "Thông tin người dùng không hợp lệ. Vui lòng thử lại."
          );
          setLoading(false);
          return;
        }

        // Lưu thông tin vào store
        setAccount(user);
        setLoginSuccess(true);
        useAccountStore.getState().setToken(token);
        useAccountStore.getState().setUser(user);
        useAccountStore.getState().login(user, token);

        // Lưu remember me
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberedPassword");
        }

        // Handle redirect after login
        const searchParams = new URLSearchParams(window.location.search);
        let redirectTo = searchParams.get("redirect");
        
        // Nếu là HLV (admin hoặc owner), redirect đến trang admin
        // Trừ khi có redirect param cụ thể từ URL
        if (!redirectTo) {
          const userRole = user.role?.toLowerCase();
          if (userRole === 'admin' || userRole === 'owner' || userRole === 'super_admin') {
            redirectTo = "/admin";
          } else {
            redirectTo = "/";
          }
        }

        setLoading(false);
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      } else {
        // Response không hợp lệ
        useToast.error(
          response.message || "Đăng nhập thất bại. Vui lòng thử lại."
        );
        setLoading(false);
        setLoginSuccess(false);
      }
    } catch (error: any) {
      // Bỏ qua lỗi từ browser extensions
      const isExtensionError =
        error?.reqInfo?.pathPrefix === "/writing" ||
        error?.reqInfo?.path?.includes("/writing") ||
        error?.reqInfo?.pathPrefix === "/site_integration" ||
        error?.reqInfo?.path?.includes("/site_integration") ||
        error?.message?.includes("permission error") ||
        (error?.code === 403 && error?.reqInfo?.pathPrefix);

      if (isExtensionError) {
        // Đây là lỗi từ extension, bỏ qua
        setLoading(false);
        return;
      }

      setLoginSuccess(false);
      setLoading(false);

      // Xử lý lỗi từ backend API
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      // Xử lý các trường hợp đặc biệt
      if (errorMessage.toLowerCase().includes("inactive")) {
        useToast.error(
          t("auth.accountInactive") || "Tài khoản chưa được kích hoạt."
        );
        router.push(`/otp?email=${username}&resend=1`);
        return;
      }

      // Hiển thị lỗi
      useToast.error(errorMessage);
    }
  };

  const handle2FASubmit = async (code: string) => {
    // TODO: Implement 2FA flow khi backend hỗ trợ
    setTwoFaLoading(true);
    try {
      useToast.error("2FA chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.");
      setTwoFaLoading(false);
    } catch (error: any) {
      useToast.error(error.message || "2FA verification failed");
      setTwoFaLoading(false);
    }
  };

  const handle2FAClose = () => {
    setShow2FaModal(false);
    setTwoFaLoading(false);
  };

  return (
    <div className="account-page bg-white">
      <div className="main-wrapper">
        <div className="overflow-hidden p-3 acc-vh">
          <div className="row vh-100 w-100 g-0">
            {/* Left Column - Form */}
            <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
              <div className="row">
                <div className="col-md-10 mx-auto">
                  <form
                    onSubmit={handleLogin}
                    className="vh-100 d-flex justify-content-between flex-column p-4 pb-0"
                  >
                    <div className="text-center mb-4 auth-logo">
                      <img
                        src="/styles/images/logo.png"
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
                        <h3 className="mb-2">Đăng Nhập</h3>
                        <p className="mb-0">
                          Truy cập hệ thống bằng email, tên đăng nhập, mã hội
                          viên và mật khẩu của bạn.
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Email / Tên đăng nhập / Mã hội viên
                        </label>
                        <div className="input-group input-group-flat">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập email, tên đăng nhập hoặc mã hội viên"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            onBlur={(e) => setUsername(e.target.value.trim())}
                            required
                          />
                          <span className="input-group-text">
                            <i className="ti ti-user"></i>
                          </span>
                        </div>
                        <small className="text-muted">
                          Bạn có thể đăng nhập bằng email, tên đăng nhập hoặc mã
                          hội viên
                          <br />
                          <span style={{ fontSize: "11px" }}>
                            Định dạng mã hội viên: HV_tên+họ+tên lót viết
                            tắt_ngày tháng năm sinh
                            <br />
                            Ví dụ: HV_anhhpba_280216
                          </span>
                        </small>
                        {username && usernameResult.message && (
                          <div
                            style={{
                              color: "red",
                              fontSize: 13,
                              marginTop: 6,
                            }}
                          >
                            {usernameResult.message}
                          </div>
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
                            onBlur={(e) => setPassword(e.target.value.trim())}
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
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="form-check form-check-md d-flex align-items-center">
                          <input
                            className="form-check-input mt-0"
                            type="checkbox"
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label
                            className="form-check-label text-dark ms-1"
                            htmlFor="remember-me"
                          >
                            Ghi nhớ đăng nhập
                          </label>
                        </div>
                        <div className="text-end">
                          <Link
                            href="/forgot-password"
                            className="link-danger fw-medium link-hover"
                          >
                            Quên mật khẩu?
                          </Link>
                        </div>
                      </div>
                      <div className="mb-3">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={!isFormValid || loading}
                        >
                          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </button>
                      </div>
                      <div className="mb-3">
                        <p className="mb-0">
                          Chưa có tài khoản?{" "}
                          <Link
                            href="/register"
                            className="link-indigo fw-bold link-hover"
                          >
                            Đăng ký ngay
                          </Link>
                        </p>
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
                  src="/styles/images/logo.png"
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
