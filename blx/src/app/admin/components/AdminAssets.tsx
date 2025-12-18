"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/**
 * Component để load CSS và JS cho admin interface
 * Sử dụng assets từ /client/assets
 */
export const AdminAssets = () => {
  const [jQueryReady, setJQueryReady] = useState(false);
  const [slickReady, setSlickReady] = useState(false);

  useEffect(() => {
    // Load CSS files từ /client/assets
    const links = [
      "/client/assets/css/bootstrap.min.css",
      "/client/assets/css/style.css",
      "/client/assets/plugins/tabler-icons/tabler-icons.min.css",
      "/client/assets/plugins/simplebar/simplebar.min.css",
      "/client/assets/plugins/datatables/css/dataTables.bootstrap5.min.css",
      "/client/assets/plugins/daterangepicker/daterangepicker.css",
      "/client/assets/plugins/fontawesome/css/all.min.css",
      "/client/slick/slick.css",
      "/client/slick/slick-theme.css",
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
        src="/client/js/jquery.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Đảm bảo jQuery đã sẵn sàng
          if (typeof window !== "undefined" && (window as any).jQuery) {
            setJQueryReady(true);
          }
        }}
      />

      {/* Load Bootstrap after jQuery */}
      {jQueryReady && (
        <Script
          src="/client/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log("Bootstrap loaded successfully");
          }}
        />
      )}

      {/* Load Simplebar */}
      {jQueryReady && (
        <Script
          src="/client/assets/plugins/simplebar/simplebar.min.js"
          strategy="lazyOnload"
        />
      )}

      {/* Load DataTables - cần jQuery */}
      {jQueryReady && (
        <>
          <Script
            src="/client/assets/plugins/datatables/js/jquery.dataTables.min.js"
            strategy="lazyOnload"
          />
          <Script
            src="/client/assets/plugins/datatables/js/dataTables.bootstrap5.min.js"
            strategy="lazyOnload"
          />
        </>
      )}

      {/* Load DateRangePicker */}
      <Script src="/client/js/moment.min.js" strategy="lazyOnload" />
      {jQueryReady && (
        <Script
          src="/client/assets/plugins/daterangepicker/daterangepicker.js"
          strategy="lazyOnload"
        />
      )}

      {/* Load Slick carousel - cần jQuery và phải load trước main.js */}
      {jQueryReady && (
        <Script
          src="/client/slick/slick.js"
          strategy="lazyOnload"
          onLoad={() => {
            // Đảm bảo Slick đã sẵn sàng
            if (
              typeof window !== "undefined" &&
              (window as any).jQuery &&
              (window as any).jQuery.fn.slick
            ) {
              console.log("Slick carousel loaded successfully");
              setSlickReady(true);
            }
          }}
          onError={(e) => {
            console.error("Error loading slick.js:", e);
            // Vẫn set ready để không block main.js nếu Slick fail
            setSlickReady(true);
          }}
        />
      )}

      {/* Load main admin script - cần jQuery và Slick */}
      {jQueryReady && slickReady && (
        <Script
          src="/client/js/main.js"
          strategy="lazyOnload"
          onError={(e) => {
            console.error("Error loading main.js:", e);
          }}
        />
      )}
    </>
  );
};
