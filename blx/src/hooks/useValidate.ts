import { useMemo } from "react";

interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const useValidate = () => {
  const validateUsername = useMemo(() => {
    return (username: string): ValidationResult => {
      if (!username || username.trim().length === 0) {
        return { valid: false, message: "Vui lòng nhập email, tên đăng nhập hoặc mã hội viên" };
      }

      if (username.trim().length < 2) {
        return {
          valid: false,
          message: "Vui lòng nhập ít nhất 2 ký tự",
        };
      }

      // No strict validation - accept email, username, or ma_hoi_vien
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
