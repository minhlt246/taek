"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account";
import Loading from "@/components/ui/loading";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { account, isAuthenticated } = useAccountStore();

  // Temporarily disable authentication check for admin access
  // useEffect(() => {
  //   // Check if user is authenticated and has admin role
  //   if (!isAuthenticated) {
  //     router.push("/login");
  //     return;
  //   }

  //   if (account?.role !== "admin") {
  //     router.push("/");
  //     return;
  //   }
  // }, [isAuthenticated, account, router]);

  // Show loading while checking authentication
  // if (!isAuthenticated || account?.role !== "admin") {
  //   return <Loading />;
  // }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
