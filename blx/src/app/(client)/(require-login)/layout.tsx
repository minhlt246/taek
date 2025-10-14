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
  const { loginSuccess } = useAccountStore();

  // Kiểm tra token expiry tự động
  useTokenExpiry();

  useEffect(() => {
    if (!loginSuccess) {
      router.push("/login");
    }
  }, [loginSuccess, router]);

  if (!loginSuccess) {
    return <Loading />;
  }

  return children;
}
