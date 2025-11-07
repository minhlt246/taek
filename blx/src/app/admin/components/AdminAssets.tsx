"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Component để load CSS và JS cho admin interface
 * Sử dụng next/script và useEffect để tải assets
 */
export const AdminAssets = () => {
  useEffect(() => {
    // Load CSS files
    const links = [
      "/styles/assets/css/bootstrap.min.css",
      "/styles/assets/plugins/tabler-icons/tabler-icons.min.css",
      "/styles/assets/plugins/simplebar/simplebar.min.css",
      "/styles/assets/plugins/datatables/css/dataTables.bootstrap5.min.css",
      "/styles/assets/plugins/daterangepicker/daterangepicker.css",
      "/styles/assets/css/style.css",
    ];

    links.forEach((href) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Cleanup function
    return () => {
      // Don't remove CSS as they should persist across navigation
    };
  }, []);

  return (
    <>
      {/* Load jQuery first - essential for other scripts */}
      <Script
        src="/styles/assets/js/jquery-3.7.1.min.js"
        strategy="afterInteractive"
      />

      {/* Load Bootstrap after jQuery */}
      <Script
        src="/styles/assets/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Bootstrap loaded successfully");
        }}
      />

      {/* Load Simplebar */}
      <Script
        src="/styles/assets/plugins/simplebar/simplebar.min.js"
        strategy="lazyOnload"
      />

      {/* Load theme script */}
      <Script src="/styles/assets/js/theme-script.js" strategy="lazyOnload" />
    </>
  );
};
