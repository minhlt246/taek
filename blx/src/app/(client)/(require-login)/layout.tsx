"use client";

import React, { useEffect } from "react";
import Loading from "@/components/ui/loading";
import { useAccountStore } from "@/stores/account";
import { useRouter } from "next/navigation";
import { useTokenExpiry } from "@/hooks/useTokenExpiry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { loginSuccess, account } = useAccountStore();

  // Kiểm tra token expiry tự động
  useTokenExpiry();

  useEffect(() => {
    // Kiểm tra nếu chưa đăng nhập
    if (!loginSuccess) {
      router.push("/login");
      return;
    }

    // Kiểm tra nếu là huan_luyen_vien (admin/owner/super_admin) thì không cho vào trang user
    // Chỉ cho phép user (student) vào trang user-center
    if (account?.role) {
      const userRole = account.role.toLowerCase();
      const adminRoles = ['admin', 'owner', 'super_admin'];
      
      if (adminRoles.includes(userRole)) {
        // Redirect về trang admin nếu là huan_luyen_vien
        router.push("/admin");
        return;
      }
    }
  }, [loginSuccess, account, router]);

  // Hiển thị loading nếu chưa đăng nhập
  if (!loginSuccess) {
    return <Loading />;
  }

  // Kiểm tra lại role trước khi render children
  // Nếu là admin/owner/super_admin thì không render, đã redirect ở useEffect
  if (account?.role) {
    const userRole = account.role.toLowerCase();
    const adminRoles = ['admin', 'owner', 'super_admin'];
    
    if (adminRoles.includes(userRole)) {
      return <Loading />; // Đang redirect, hiển thị loading
    }
  }

  return children;
}
