"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useValidate } from "@/hooks/useValidate";
import { useToast } from "@/utils/toast";
import { getSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useAccountStore } from "@/stores/account";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleProvider } from "@/components/providers/GoogleProvider";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { setLoginSuccess, setAccount } = useAccountStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_MODE === "development" ? "customer@yopmail.com" : ""
  );
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_MODE === "development" ? "admin@123" : ""
  );
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const { validateUsername } = useValidate();
  const emailResult = validateUsername(email);

  const isFormValid = emailResult.valid && password.trim() !== "";

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    // Remove password from localStorage for security
    localStorage.removeItem("rememberedPassword");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);

    const res: any = await signIn("login-by-username-password", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setLoginSuccess(false);
      useToast.error(t(res.error));
      if (res.error === "auth.accountInactive") {
        router.push(`/otp?email=${email}&resend=1`);
      }
    } else {
      // Login and Remember Me (only email, not password for security)
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const result: any = await getSession();

      setAccount(result.user);
      setLoginSuccess(true);
      router.push("/");
    }
    setLoading(false);
  };

  // callback API
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const idToken = credentialResponse.credential;
      // ✅ use NextAuth signIn()
      const result = await signIn("google-oauth", {
        idToken: idToken,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Google authentication failed. Please try again.");
      } else if (result?.ok) {
        const session: any = await getSession();

        if (session?.user) {
          setAccount(session.user);
          setLoginSuccess(true);

          // Handle Remember Me for Google login
          if (rememberMe && session.user.email) {
            localStorage.setItem("rememberedEmail", session.user.email);
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
      <section className="login-mus d-flex align-items-center justify-content-center min-vh-100 w-100">
        <div className="container">
          <div className="row justify-content-center align-items-center d-flex">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center">
              <form className="login-form w-100" onSubmit={handleLogin}>
                <h2 className="login-title">Welcome to MUS</h2>
                <label
                  className="form-label login-label "
                  htmlFor="mus-account"
                >
                  MUS Account
                </label>
                <input
                  className="form-control"
                  id="mus-account"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="mb-3">
                  {email && emailResult.message && (
                    <div style={{ color: "red", fontSize: 13 }}>
                      {emailResult.message}
                    </div>
                  )}
                </div>
                <div className="password-tiltle">
                  <label
                    className="form-label password-label"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-primary forgot-password"
                    href="/forgotpassword"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="password-input-container mb-3">
                  <input
                    className="form-control password-input"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Please enter the password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i
                      className={`fa-solid ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </span>
                </div>

                <div className="d-flex mb-2 justify-content-between align-items-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={() => setRememberMe((v) => !v)}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-login w-100 mb-2 fw-light"
                  type="submit"
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <div className="text-center my-3">
                  {/* <a className="text-primary login-with-code" href="#">
                      Login With Code
                    </a>
                    <span className="mx-2 text-muted">|</span>  */}
                  <a
                    className="text-primary mus-login-with-code"
                    href="/signup"
                  >
                    Sign Up
                  </a>
                </div>
                <div className="divider d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2">Others</span>
                  <hr className="flex-grow-1" />
                </div>
                <div className="row d-flex justify-content-center">
                  <div className="col-12">
                    <div className="google-login-wrapper">
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={() => useToast.error("Google login failed")}
                        width="100%"
                      />
                    </div>
                  </div>
                  {/* <div className="col-4">
                      <button
                        className="btn btn-light border d-flex justify-content-center align-items-center gap-2 w-100 rounded-pill"
                        type="button"
                      >
                        <i
                          className="fab fa-apple"
                          style={{ color: "#000000", fontSize: 20 }}
                        ></i>
                        <span>Apple</span>
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        className="btn btn-light border d-flex justify-content-center align-items-center gap-2 w-100 rounded-pill"
                        type="button"
                      >
                        <i
                          className="fab fa-telegram"
                          style={{ color: "#229ED9", fontSize: 20 }}
                        ></i>
                        <span>Telegram</span>
                      </button>
                    </div> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </GoogleProvider>
  );
}
