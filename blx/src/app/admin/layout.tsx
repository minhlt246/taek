"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAccountStore } from "@/stores/account";
import Loading from "@/components/ui/loading";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { AdminAssets } from "./components/AdminAssets";
import { useState, useEffect, useRef } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { account, isAuthenticated } = useAccountStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const hasRedirected = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Initial loading timeout - don't wait too long
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    // Đánh dấu component đã mount
    isMountedRef.current = true;

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Kiểm tra nếu đang ở trang admin (pathname bắt đầu bằng /admin)
    const isAdminPath = pathname?.startsWith('/admin');
    
    if (!isAdminPath) {
      // Reset flags khi rời khỏi trang admin
      hasCheckedAuth.current = false;
      hasRedirected.current = false;
      return;
    }

    // CHỈ check và redirect MỘT LẦN khi component mount (lần đầu vào trang)
    // KHÔNG redirect lại khi state thay đổi do localStorage sync từ tab khác
    if (hasCheckedAuth.current) {
      // Đã check rồi, không check lại - ngăn redirect khi state sync từ tab khác
      return;
    }

    // Kiểm tra xem có phải là reload hay navigation mới
    // Sử dụng performance API để detect reload
    let isReload = false;
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        // type === 'reload' nghĩa là reload trang
        isReload = navigation.type === 'reload';
      }
    }

    // Đánh dấu đã check auth
    hasCheckedAuth.current = true;

    // Nếu là reload, KHÔNG redirect - để tránh redirect khi user khác login ở tab khác
    // Chỉ redirect khi thực sự navigate đến trang admin từ bên ngoài
    if (isReload) {
      // Đã reload, không redirect - giữ nguyên trang bất kể user có quyền hay không
      return;
    }

    // Check if user is authenticated (chỉ khi navigate mới, không phải reload)
    if (!isAuthenticated) {
      // Navigate mới đến trang admin nhưng chưa authenticated, redirect về login
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.push("/login");
      }
      return;
    }

    // Cho phép truy cập admin nếu role là 'admin', 'owner', hoặc từ bảng admin (super_admin)
    const allowedRoles = ['admin', 'owner', 'super_admin'];
    const userRole = account?.role?.toLowerCase();
    
    // CHỈ redirect nếu user có role nhưng KHÔNG phải admin/owner
    // Và đây là navigation MỚI (không phải reload)
    if (userRole && !allowedRoles.includes(userRole)) {
      // Navigate mới đến trang admin nhưng không có quyền, redirect về home
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.push("/");
      }
      return;
    }
    
    // User có quyền admin, không redirect
  }, [isAuthenticated, account, router, pathname]);

  // Show loading while checking authentication
  const userRole = account?.role?.toLowerCase();
  const allowedRoles = ['admin', 'owner', 'super_admin'];
  const hasAdminRole = userRole && allowedRoles.includes(userRole);
  const isAdminPath = pathname?.startsWith('/admin');
  
  // Chỉ show loading nếu:
  // 1. Đang initial loading
  // 2. Hoặc chưa authenticated và đang ở trang admin (sẽ redirect về login)
  // 3. Hoặc đã authenticated nhưng không có role admin và chưa check auth (sẽ redirect)
  if (initialLoading) {
    return <Loading />;
  }

  // Nếu không ở trang admin, không render admin layout
  if (!isAdminPath) {
    return null;
  }

  // Nếu chưa authenticated và đang ở trang admin
  if (!isAuthenticated) {
    // Nếu đã check auth rồi (có thể là reload), không show loading (để tránh flash)
    if (hasCheckedAuth.current) {
      return null;
    }
    // Chưa check auth, show loading (sẽ redirect về login)
    return <Loading />;
  }

  // Nếu có authenticated nhưng không có role admin
  if (!hasAdminRole) {
    // Nếu đã check auth rồi (có thể là reload với user khác), không render và không redirect
    // Điều này ngăn redirect khi reload với user từ tab khác
    if (hasCheckedAuth.current) {
      return null;
    }
    // Chưa check auth, show loading (sẽ redirect về home)
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
