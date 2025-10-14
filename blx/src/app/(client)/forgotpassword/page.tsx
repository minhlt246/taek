"use client";
import { useState } from "react";
import { useValidate } from "@/hooks/useValidate";
import { authApi } from "@/services/api/auth";
import { useToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { validateUsername } = useValidate();
  const usernameResult = validateUsername(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usernameResult.valid) return;
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      useToast.success(t("auth.forgotPassword.success"));
      router.push("/reset-pass");
    } catch (err: any) {
      setError(t(err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className=" forgot-password d-flex align-items-center justify-content-center min-vh-100 w-100">
      <div className="container">
        <div className="row justify-content-center align-items-center d-flex">
          <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center">
            <div className="login-form w-100 mt-4 mt-lg-0">
              <h2 className="mb-4 text-center forgot-password-title">
                Reset login password
              </h2>
              <form onSubmit={handleSubmit} className="form">
                <label className="form-label forgot-password-label" htmlFor="mus-account">
                  Email
                </label>
                <input
                  className="form-control forgot-password-input"
                  id="mus-account"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="mb-3">
                  {email && usernameResult.message && (
                    <div style={{ color: "red", fontSize: 13 }}>
                      {usernameResult.message}
                    </div>
                  )}
                  {error && (
                    <div style={{ color: "red", fontSize: 13 }}>{error}</div>
                  )}
                </div>
                <button
                  className="btn forgot-password-button"
                  type="submit"
                  disabled={!usernameResult.valid || loading}
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
              </form>
              <div className="text-center mt-3">
                <a className="text-primary" href="/login">
                  Back to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
