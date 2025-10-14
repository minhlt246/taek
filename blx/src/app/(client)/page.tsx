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
      
    </GoogleProvider>
  );
}
