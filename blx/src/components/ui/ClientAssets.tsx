"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Component để load các CSS và JS từ bộ client assets
 * Sử dụng cho các page giao diện client
 */
export default function ClientAssets() {
  useEffect(() => {
    // Load CSS từ client vào head
    const cssFiles = [
      "/client/css/bootstrap.min.css",
      "/client/css/all.min.css",
      "/client/css/animate.css",
      "/client/css/hover-min.css",
      "/client/css/jquery.fancybox.min.css",
      "/client/css/daterangepicker.css",
      "/client/css/flag-icons.min.css",
    ];

    cssFiles.forEach((href) => {
      const linkId = `client-css-${href.split("/").pop()?.replace(".css", "")}`;
      
      // Kiểm tra xem đã load chưa
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Cleanup khi component unmount (optional - thường không cần vì CSS nên giữ lại)
    // return () => { ... }
  }, []);

  return (
    <>
      {/* Load các JS từ client */}
      <Script src="/client/js/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/client/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/client/js/all.min.js" strategy="afterInteractive" />
      <Script src="/client/js/moment.min.js" strategy="afterInteractive" />
      <Script src="/client/js/main.js" strategy="afterInteractive" />
    </>
  );
}

