"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/utils/toast";
import { useAccountStore } from "@/stores/account";
import { getSession, signIn } from "next-auth/react";
import { useValidate } from "@/hooks/useValidate";

import { GoogleLogin } from "@react-oauth/google";
import { GoogleProvider } from "@/components/providers/GoogleProvider";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAccount, setLoginSuccess, setAccessToken } = useAccountStore();

  const [username, setUsername] = useState(
    process.env.NEXT_PUBLIC_MODE === "development" ? "customer@yopmail.com" : ""
  );
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_MODE === "development" ? "admin@123" : ""
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
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
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    const res: any = await signIn("login-by-username-password", {
      username,
      password,
      redirect: false,
    });
    if (res?.error) {
      setLoginSuccess(false);
      const [errorCode, value] = res.error.split("|");
      if (errorCode === "auth.login.requires2fa") {
        setSessionId(value);
        setShow2FaModal(true);
      } else {
        // Translate error message with fallback
        const errorMessage =
          t(res.error) || res.error || "Login failed. Please try again.";
        useToast.error(errorMessage);
        if (res.error === "auth.accountInactive") {
          router.push(`/otp?email=${username}&resend=1`);
        }
      }
    } else {
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }

      const result: any = await getSession();
      setAccessToken(result.user.accessToken);
      setAccount(result.user);
      setLoginSuccess(true);
      router.push("/");
    }
    setLoading(false);
  };

  const handle2FASubmit = async (code: string) => {
    setTwoFaLoading(true);
    try {
      const result = await signIn("login-by-2fa", {
        token: code,
        sessionId,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        const session: any = await getSession();
        if (session) {
          setAccessToken(session.user.accessToken);
          setAccount(session.user);
          setLoginSuccess(true);
          setShow2FaModal(false);
          useToast.success("2FA verification successful! Logging in...");

          if (rememberMe) {
            localStorage.setItem("rememberedUsername", username);
            localStorage.setItem("rememberedPassword", password);
          } else {
            localStorage.removeItem("rememberedUsername");
            localStorage.removeItem("rememberedPassword");
          }

          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          throw new Error("Unable to get user information");
        }
      }
    } catch (error: any) {
      throw new Error(error.message || "2FA verification failed");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FAClose = () => {
    setShow2FaModal(false);
    setTwoFaLoading(false);
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const idToken = credentialResponse.credential;
      const result = await signIn("google-oauth", {
        idToken: idToken,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Google authentication failed. Please try again.");
      } else if (result?.ok) {
        const session: any = await getSession();

        if (session?.user) {
          setAccessToken(session.user.accessToken);
          setAccount(session.user);
          setLoginSuccess(true);

          if (rememberMe && session.user.email) {
            localStorage.setItem("rememberedUsername", session.user.email);
          }

          useToast.success("Google login successful!");
          router.push("/");
        } else {
          throw new Error("Unable to get user session");
        }
      }
    } catch (error: any) {
      useToast.error(error?.message || "Google login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleProvider>
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
                            maxWidth: "100%",
                            height: "auto",
                            objectFit: "contain",
                          }}
                          width={50}
                          height={50}
                        />
                      </div>
                      <div>
                        <div className="mb-3">
                          <h3 className="mb-2">Đăng Nhập</h3>
                          <p className="mb-0">
                            Truy cập hệ thống bằng email và mật khẩu của bạn.
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <div className="input-group input-group-flat">
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Nhập email của bạn"
                              value={username}
                              onChange={(e) =>
                                setUsername(e.target.value.trim())
                              }
                              onBlur={(e) => setUsername(e.target.value.trim())}
                              required
                            />
                            <span className="input-group-text">
                              <i className="ti ti-mail"></i>
                            </span>
                          </div>
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
                                src="/styles/assets/img/icons/facebook-logo.svg"
                                alt="Facebook"
                              />
                            </a>
                          </div>
                          <div className="text-center flex-fill">
                            <div className="w-100 d-flex align-items-center justify-content-center">
                              <GoogleLogin
                                onSuccess={handleGoogleLoginSuccess}
                                onError={() =>
                                  useToast.error("Google login failed")
                                }
                                width="100%"
                              />
                            </div>
                          </div>
                          <div className="text-center flex-fill">
                            <a
                              href="javascript:void(0);"
                              className="p-2 btn btn-dark d-flex align-items-center justify-content-center"
                            >
                              <img
                                className="img-fluid m-1"
                                src="/styles/assets/img/icons/apple-logo.svg"
                                alt="Apple"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="text-center pb-4">
                        <p className="text-dark mb-0">
                          Copyright &copy; {new Date().getFullYear()} -
                          Taekwondo Đồng Phú
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
    </GoogleProvider>
  );
}
