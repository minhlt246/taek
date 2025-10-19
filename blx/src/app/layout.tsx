import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import Script from "next/script";
import { I18nProvider } from "@/components/providers/I18nProvider";

import "@/styles/css/bootstrap.min.css";
import "@/styles/css/all.min.css";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/admin.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Taek DP</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="description" content="T.D.P" />
        <meta name="keywords" content="T.D.P" />
        <meta name="author" content="T.D.P" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <link
          rel="icon"
          href="/images/favicon.png"
          type="image/png"
          sizes="16x16"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Suspense>
          <I18nProvider>
            {children}
            <ToastContainer limit={2} />
          </I18nProvider>
        </Suspense>
        <Script src="/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  );
}
