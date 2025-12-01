"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Component để load các CSS và JS từ bộ client assets
 * Sử dụng cho các page giao diện client
 */
export default function ClientAssets() {
  const [jQueryReady, setJQueryReady] = useState(false);

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
  }, []);

  return (
    <>
      {/* Load jQuery trước - sử dụng afterInteractive để onLoad hoạt động đúng */}
      <Script
        src="/client/js/jquery.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Đảm bảo jQuery đã sẵn sàng
          if (typeof window !== "undefined" && (window as any).jQuery) {
            setJQueryReady(true);
          }
        }}
      />
      
      {/* Load Bootstrap sau jQuery */}
      {jQueryReady && (
        <Script
          src="/client/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      )}
      
      {/* Load các script khác */}
      <Script src="/client/js/all.min.js" strategy="afterInteractive" />
      <Script src="/client/js/moment.min.js" strategy="afterInteractive" />
      
      {/* Chỉ load main.js sau khi jQuery đã sẵn sàng */}
      {jQueryReady && (
        <Script
          src="/client/js/main.js"
          strategy="afterInteractive"
          onError={(e) => {
            console.error("Error loading main.js:", e);
          }}
        />
      )}
    </>
  );
}

