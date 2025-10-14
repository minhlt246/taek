import { useMemo } from "react";

interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const useValidate = () => {
  const validateUsername = useMemo(() => {
    return (username: string): ValidationResult => {
      if (!username) {
        return { valid: false, message: "Username is required" };
      }

      if (username.length < 3) {
        return {
          valid: false,
          message: "Username must be at least 3 characters",
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        return { valid: false, message: "Please enter a valid email address" };
      }

      return { valid: true };
    };
  }, []);

  const validatePassword = useMemo(() => {
    return (password: string): ValidationResult => {
      if (!password) {
        return { valid: false, message: "Password is required" };
      }

      if (password.length < 6) {
        return {
          valid: false,
          message: "Password must be at least 6 characters",
        };
      }

      return { valid: true };
    };
  }, []);

  return {
    validateUsername,
    validatePassword,
  };
};
