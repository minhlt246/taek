"use client";

import { useClientOnly } from "@/hooks/useClientOnly";
import Header from "@/components/ui/crm/header";
import Footer from "@/components/ui/crm/footer";
import React from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Loading from "@/components/ui/loading";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mounted = useClientOnly();

  if (!mounted) {
    return <Loading />;
  }

  return (
    <AuthProvider>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
