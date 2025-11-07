"use client";

import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account";
import Loading from "@/components/ui/loading";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { AdminAssets } from "./components/AdminAssets";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { account, isAuthenticated } = useAccountStore();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Initial loading timeout - don't wait too long
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <>
      {/* Load admin assets via dedicated component */}
      <AdminAssets />

      <div className="main-wrapper">
        <AdminSidebar />
        
        {/* Search Modal */}
        <div className="modal fade" id="searchModal">
          <div className="modal-dialog modal-lg">
            <div className="modal-content bg-transparent">
              <div className="card shadow-none mb-0">
                <div className="px-3 py-2 d-flex flex-row align-items-center" id="search-top">
                  <i className="ti ti-search fs-22"></i>
                  <input type="search" className="form-control border-0" placeholder="Search" />
                  <button type="button" className="btn p-0" data-bs-dismiss="modal" aria-label="Close">
                    <i className="ti ti-x fs-22"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-wrapper">
          <AdminHeader />
          <div className="content pb-0">
            {children}
          </div>

          {/* Footer */}
          <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
            <p className="mb-md-0 mb-1">
              Copyright &copy; {new Date().getFullYear()}{" "}
              <a href="javascript:void(0);" className="link-primary text-decoration-underline ms-1">Minh-Dev Team</a>
            </p>
            <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
              <a href="javascript:void(0);">About</a>
              <a href="javascript:void(0);">Terms</a>
              <a href="javascript:void(0);">Contact Us</a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
