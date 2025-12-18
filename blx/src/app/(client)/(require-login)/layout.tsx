"use client";

import React, { useEffect, useRef } from "react";
import Loading from "@/components/ui/loading";
import { useAccountStore } from "@/stores/account";
import { useRouter, usePathname } from "next/navigation";
import { useTokenExpiry } from "@/hooks/useTokenExpiry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { loginSuccess, account, isAuthenticated } = useAccountStore();
  const hasCheckedAuth = useRef(false);

  // Kiểm tra token expiry tự động
  useTokenExpiry();

  useEffect(() => {
    // Kiểm tra nếu đang ở trang user (pathname trong (require-login))
    const isUserPath =
      pathname?.startsWith("/user-center") ||
      pathname?.startsWith("/ticket") ||
      (pathname && !pathname.startsWith("/admin"));

    if (!isUserPath) {
      // Reset flag khi rời khỏi trang user
      hasCheckedAuth.current = false;
      return;
    }

    // CHỈ check và redirect MỘT LẦN khi component mount (lần đầu vào trang)
    // KHÔNG redirect lại khi state thay đổi do localStorage sync từ tab khác
    if (hasCheckedAuth.current) {
      // Đã check rồi, không check lại - ngăn redirect khi state sync từ tab khác
      return;
    }

    // Kiểm tra xem có phải là reload hay navigation mới
    let isReload = false;
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        isReload = navigation.type === "reload";
      }
    }

    // Đánh dấu đã check auth
    hasCheckedAuth.current = true;

    // Nếu là reload, KHÔNG redirect - để tránh redirect khi user khác login ở tab khác
    if (isReload) {
      return;
    }

    // Chỉ redirect nếu chưa authenticated (khi navigate mới, không phải reload)
    if (!isAuthenticated && !loginSuccess) {
      router.push("/login");
      return;
    }

    // Cho phép tất cả user đã authenticated vào trang user, kể cả admin
    // Không redirect admin về /admin nữa - để họ có thể truy cập cả 2 phần
  }, [loginSuccess, isAuthenticated, account, router, pathname]);

  // Hiển thị loading nếu chưa đăng nhập (chỉ khi navigate mới, không phải reload)
  if (!loginSuccess && !isAuthenticated) {
    // Nếu đã check auth rồi (có thể là reload), không show loading
    if (hasCheckedAuth.current) {
      return null;
    }
    return <Loading />;
  }

  return children;
}
