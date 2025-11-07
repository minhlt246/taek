"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account";

export function useTokenExpiry() {
  const router = useRouter();
  const { token, logout } = useAccountStore();

  useEffect(() => {
    if (!token) return;

    // Kiểm tra token expiry mỗi phút
    const checkTokenExpiry = () => {
      try {
        // Decode JWT token để lấy expiry time
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        // Nếu token đã hết hạn hoặc sắp hết hạn (trong vòng 5 phút)
        if (currentTime >= expiryTime - 5 * 60 * 1000) {
          logout();
          router.push("/login");
        }
      } catch (error) {
        // Nếu không thể decode token, logout
        console.error("Error checking token expiry:", error);
        logout();
        router.push("/login");
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenExpiry();

    // Kiểm tra mỗi phút
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [token, logout, router]);
}

