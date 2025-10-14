"use client";

import { useAccountStore } from "@/stores/account";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, useCallback } from "react";
import { authApi } from "@/services/api/auth";
import { useToast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleProvider } from "@/components/providers/GoogleProvider";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref: string | null = searchParams.get("ref");
  const { setReferral, setLoginSuccess, setAccount, loginSuccess } =
    useAccountStore();

  // Email check state
  const [email, setEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Google login state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Email validation function following MUS Exchange patterns
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Handle email check following MCP API pattern
  const handleEmailCheck = useCallback(async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setIsCheckingEmail(true);
      setEmailError("");

      // ✅ Call email check API following MCP pattern
      const response = await authApi.checkEmailExists(
        email.trim().toLowerCase()
      );

      if (response.exists) {
        setEmailError(
          "This email is already registered. Please use a different email or login to your account."
        );
        useToast.error("Email already exists");
        return;
      }

      // Email is available, redirect to signup with pre-filled email
      useToast.success("Email is available");
      const signupUrl = `/signup?email=${encodeURIComponent(email)}${
        ref ? `&ref=${ref}` : ""
      }`;
      router.push(signupUrl);
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to check email availability";
      setEmailError(errorMessage);
      useToast.error(errorMessage);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [email, ref, router, validateEmail]);

  // ✅ FIXED: Google Login Handler - No 2FA check for Google OAuth
  const handleGoogleLoginSuccess = useCallback(
    async (credentialResponse: any) => {
      try {
        setIsGoogleLoading(true);
        const idToken = credentialResponse.credential;

        const result = await signIn("google-oauth", {
          idToken: idToken,
          redirect: false,
        });
        if (result?.error) {
          throw new Error("Google authentication failed. Please try again.");
        } else if (result?.ok) {
          const session = await getSession();

          if (session?.user) {
            // Convert session user to our User type
            const user = {
              id: session.user.email || "unknown",
              email: session.user.email || "",
              name: session.user.name || "",
              avatar: session.user.image || "",
            };
            setAccount(user);
            setLoginSuccess(true);

            useToast.success("Welcome back! Google login successful.");

            router.refresh();
          } else {
            throw new Error("Unable to get user session after Google login");
          }
        }
      } catch (error: any) {
        useToast.error(
          error?.message || "Google login failed. Please try again."
        );
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [router, setAccount, setLoginSuccess]
  );

  // Google Login Error Handler following MUS Exchange patterns
  const handleGoogleLoginError = useCallback(() => {
    useToast.error(
      "Google login failed. Please try again or use email registration."
    );
    setIsGoogleLoading(false);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleEmailCheck();
    },
    [handleEmailCheck]
  );

  // Handle input change
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);

      if (emailError) {
        setEmailError("");
      }
    },
    [emailError]
  );

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEmailCheck();
      }
    },
    [handleEmailCheck]
  );

  // Handle referral logic following MUS Exchange business patterns
  useEffect(() => {
    if (ref && ref.length > 0) {
      setReferral({
        code: ref,
        link: `${window.location.origin}?ref=${ref}`,
      });
    }
  }, [ref, setReferral]);

  // Check if any operation is in progress
  const isAnyOperationInProgress = isCheckingEmail || isGoogleLoading;

  return (
    <GoogleProvider>
      <div className="home-page">
        <div className="block-trade-main">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="block-main d-flex justify-content-between">
                  <div className="content">
                    <div className="title-page">
                      <h1 className="custom mb-lg-3">
                        Multi Assets. One Destination.
                      </h1>
                      <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
                        {loginSuccess ? (
                          <div>
                            <h3 className="mt-3 mb-5 text-desc mx-0">
                              Fund your account now to start trading
                            </h3>
                            <div className="d-flex justify-content-center justify-content-lg-start">
                              <a className="btn btn-stated" href="/quick-trade">
                                <span className="me-2">Get Started</span>
                                <i className="fa-solid fa-arrow-right"></i>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="sub-title">
                            <img
                              className="me-2"
                              src="/images/home-page/icon-gift.png"
                              alt="icon-gift"
                            />
                            Register now. Your rewards are waiting.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ CONDITIONAL RENDERING: Hide registration form when authenticated */}
                    {!loginSuccess && (
                      <>
                        <form
                          onSubmit={handleSubmit}
                          className="box-signup d-flex my-4"
                        >
                          <input
                            className={`form-control custom-input ${
                              emailError ? "is-invalid" : ""
                            }`}
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={handleEmailChange}
                            onKeyPress={handleKeyPress}
                            disabled={isAnyOperationInProgress}
                            autoComplete="email"
                          />
                          <button
                            type="submit"
                            className="btn btn-stated text-nowrap"
                            disabled={
                              isCheckingEmail ||
                              !email.trim() ||
                              isAnyOperationInProgress
                            }
                          >
                            {isCheckingEmail ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                              </>
                            ) : (
                              <>
                                Register
                                {/* <img
                                  src="/images/home-page/icon-arrow_right.png"
                                  alt="icon-arrow_right"
                                  className="ms-1"
                                /> */}
                              </>
                            )}
                          </button>
                        </form>
                        {emailError && (
                          <div className="invalid-feedback d-block">
                            <small className="text-danger">{emailError}</small>
                          </div>
                        )}
                        <div className="google-login-wrapper">
                          {isGoogleLoading ? (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light rounded-circle"
                              style={{ width: 40, height: 40 }}
                            >
                              <div
                                className="spinner-border spinner-border-sm text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Signing in with Google...
                                </span>
                              </div>
                            </div>
                          ) : isCheckingEmail ? (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light rounded-circle opacity-50"
                              style={{
                                width: 40,
                                height: 40,
                                cursor: "not-allowed",
                              }}
                              title="Please wait for email check to complete"
                            >
                              <i className="fab fa-google text-muted"></i>
                            </div>
                          ) : (
                            <GoogleLogin
                              onSuccess={handleGoogleLoginSuccess}
                              onError={handleGoogleLoginError}
                              theme="outline"
                              shape="rectangular"
                              containerProps={{
                                className: "custom-google-login",
                              }}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="content-right">
                    <div className="banner">
                      <a href={loginSuccess ? "/dashboard" : "#"}>
                        <img
                          src="/images/home-page/banner-trade.png"
                          alt="banner-trade"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block-millions-main">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="block-main d-flex justify-content-between align-items-center text-center">
                  <div className="item">
                    <div className="number">47</div>
                    <div className="text"> Million of User's Top Choice </div>
                  </div>
                  <div className="item">
                    <div className="number">$6,283,126,505</div>
                    <div className="text">24h Tranding volume</div>
                  </div>
                  <div className="item">
                    <div className="number">700+</div>
                    <div className="text">Prime Virtual Asset </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block-safeguarding-main custom-core">
          <div className="container bg">
            <div className="row">
              <div className="col-lg-6">
                <div className="block-main">
                  <div className="title-block">
                    <p className="text-customs ">
                      Your Multiverse of Trading Tools
                    </p>
                    <div className="text-desc">
                      Everything you need to trade with confidence
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-10">
                      <div className="list">
                        <div className="item hv-box-item d-flex align-items-center">
                          <div className="icon">
                            <img
                              className="eff-scale"
                              src="/images/sp.svg"
                              alt="icon-spot"
                            />
                          </div>
                          <div className="content">
                            <div className="title-sm fw-bold">
                              Spot
                              {/* <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        /> */}
                            </div>
                            <div className="text-sm">
                              Trade 500+ cryptos instantly.
                            </div>
                          </div>
                        </div>
                        {/* <div className="item d-flex align-items-center">
                    <div className="icon">
                      <img
                        className="eff-scale"
                        src="/images/home-page/icon-futures.png"
                        alt="icon-futures"
                      />
                    </div>
                    <div className="content">
                      <div className="title-sm">
                        Futures
                        <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        />
                      </div>
                      <div className="text-sm">
                        Flexible, fast, and powerful.
                      </div>
                    </div>
                  </div> */}
                        <div className="item hv-box-item d-flex align-items-center">
                          <div className="icon">
                            <img
                              className="eff-scale"
                              src="/images/home-page/icon-earn.png"
                              alt="icon-earn"
                            />
                          </div>
                          <div className="content">
                            <div className="title-sm fw-bold">
                              Earn
                              {/* <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        /> */}
                            </div>
                            <div className="text-sm">
                              Unlock high-yield crypto earnings.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="banner">
                  <a href="#">
                    <img src="/images/p2p.svg" alt="banner-core" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block-safeguarding-main">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="banner">
                  <a href="#">
                    <img
                      src="/images/quicktrade.svg"
                      alt="banner-safeguarding"
                    />
                  </a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="block-main">
                  <div className="title-block">
                    <h3 className="text-customs">Your Assets. Always Safe</h3>
                    <div className="text-desc">
                      Clarity | Security | Freedom to Withdraw
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-10">
                      <div className="list">
                        <div className="hv-box-item item d-flex align-items-center ps-4">
                          <div className="icon">
                            <img
                              className="eff-scale"
                              src="/images/home-page/icon-proof.png"
                              alt="icon-proof"
                            />
                          </div>
                          <div className="content">
                            <div className="title-sm fw-bold">
                              Proof of Reserves
                              {/* <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        /> */}
                            </div>
                            <div className="text-sm">
                              1:1 reserve ratio with regular, transparent
                              audits.
                            </div>
                          </div>
                        </div>
                        <div className="hv-box-item item d-flex align-items-center ps-4">
                          <div className="icon">
                            <img
                              className="eff-scale"
                              src="/images/home-page/icon-protected.png"
                              alt="icon-protected"
                            />
                          </div>
                          <div className="content">
                            <div className="title-sm fw-bold">
                              Withdrawal Guarantee
                              {/* <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        /> */}
                            </div>
                            <div className="text-sm">
                              Secure withdrawals with multi-layer wallet
                              protection.
                            </div>
                          </div>
                        </div>
                        <div className="hv-box-item item d-flex align-items-center ps-4">
                          <div className="icon">
                            <img
                              className="eff-scale"
                              src="/images/home-page/icon-account.png"
                              alt="icon-account"
                            />
                          </div>
                          <div className="content">
                            <div className="title-sm fw-bold">
                              Account Security
                              {/* <img
                          src="/images/home-page/icon-arrows-top.png"
                          alt="icon-arrows-top"
                        /> */}
                            </div>
                            <div className="text-sm">
                              Multi-factor login and smart anti-hijack features.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block-anytime-main">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="block-main text-center">
                  <div className="title-block">
                    <h3 className="text-customs text-center">
                      Trade anytime, anywhere
                    </h3>
                    <div className="text-desc">
                      Try MUS with your iOS, Android, or API
                    </div>
                  </div>
                  <div className="link-app">
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/app-google.png"
                        alt="app-google"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/app-iso.png"
                        alt="app-iso"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/app-api.png"
                        alt="app-api"
                      />
                    </a>
                  </div>
                  <div className="banner">
                    <a href="#">
                      <img
                        src="/images/home-page/banner-anytime.png"
                        alt="banner-anytime"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="block-follow-main bg-white">
          <div className="container">
            <div className="row d-flex align-items-center">
              <div className="col-lg-6">
                <div className="content">
                  <div className="title-block">
                    <h3 className="text-customs mx-0">
                      Stay Connected with Multision
                    </h3>
                    <div className="text-desc mx-0">
                      Join our community and be part of the conversation.
                    </div>
                  </div>
                  <div className="social-list">
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-x.png"
                        alt="social-x"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-tele.png"
                        alt="social-tele"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-ins.png"
                        alt="social-ins"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-fb.png"
                        alt="social-fb"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-yt.png"
                        alt="social-yt"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-dis.png"
                        alt="social-dis"
                      />
                    </a>
                    <a href="#">
                      <img
                        className="eff-scale"
                        src="/images/home-page/social-tik.png"
                        alt="social-tik"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="banner text-center">
                  <a href="#">
                    <img
                      className="banner-follow"
                      src="/images/home-page/banner-follow.png"
                      alt="banner-follow"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Script id="slick-init" strategy="afterInteractive">
          {`
            $(document).ready(function(){
              $('.responsive').slick({
                infinite: true,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 2000,
                responsive: [{
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 8,
                    slidesToScroll: 1,
                  }
                }, {
                  breakpoint: 835,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                  }
                }, {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                  }
                }, {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                  }
                }, {
                  breakpoint: 320,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                  }
                }]
              });
            });
          `}
        </Script>
      </div>
    </GoogleProvider>
  );
}
