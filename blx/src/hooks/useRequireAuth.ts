"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccountStore } from "@/stores/account";

/**
 * Hook để yêu cầu authentication
 * Redirect đến trang login nếu chưa đăng nhập
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const router = useRouter();
  const pathname = usePathname();
  const { loginSuccess, isAuthenticated } = useAccountStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!loginSuccess && !isAuthenticated) {
      const currentPath = pathname || window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [loginSuccess, isAuthenticated, router, redirectTo, pathname, mounted]);

  return {
    isAuthenticated: loginSuccess || isAuthenticated,
    user: useAccountStore.getState().user,
    isLoading: !mounted,
  };
}

