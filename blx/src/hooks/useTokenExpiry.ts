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
        // Kiểm tra nếu token là dummy token hoặc không phải JWT hợp lệ
        if (!token || token === "dummy-token" || typeof token !== "string") {
          // Skip expiry check cho dummy token
          return;
        }

        // Kiểm tra format JWT (phải có 3 parts separated by dots)
        const parts = token.split(".");
        if (parts.length !== 3) {
          // Không phải JWT hợp lệ, skip expiry check
          console.warn("Token is not a valid JWT format, skipping expiry check");
          return;
        }

        // Decode JWT token để lấy expiry time
        const payloadString = parts[1];
        if (!payloadString) {
          console.warn("Token payload is missing, skipping expiry check");
          return;
        }

        // Validate base64 string trước khi decode
        try {
          // Decode base64
          const decodedPayload = atob(payloadString);
          const payload = JSON.parse(decodedPayload);

          // Kiểm tra nếu payload có exp field
          if (!payload.exp) {
            console.warn("Token does not have expiry time, skipping expiry check");
            return;
          }

          const expiryTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();

          // Nếu token đã hết hạn hoặc sắp hết hạn (trong vòng 5 phút)
          if (currentTime >= expiryTime - 5 * 60 * 1000) {
            console.log("Token expired, logging out");
            logout();
            router.push("/login");
          }
        } catch (decodeError) {
          // Lỗi khi decode base64 hoặc parse JSON
          console.warn("Failed to decode token payload, skipping expiry check:", decodeError);
          return;
        }
      } catch (error) {
        // Lỗi không mong đợi, nhưng không logout vì có thể là dummy token
        console.warn("Error checking token expiry:", error);
        // Không logout tự động, chỉ log warning
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenExpiry();

    // Kiểm tra mỗi phút
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [token, logout, router]);
}

