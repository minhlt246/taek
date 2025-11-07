import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import Script from "next/script";
import { I18nProvider } from "@/components/providers/I18nProvider";

import "@/styles/css/bootstrap.min.css";
import "@/styles/css/all.min.css";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/scss/admin.scss";
import "@/styles/scss/style.scss";

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
          href="/styles/images/navicon.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="stylesheet"
          href="/styles/assets/plugins/tabler-icons/tabler-icons.min.css"
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
        <Script
          id="block-metamask-errors"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3')
                  ) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3')
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                window.addEventListener('error', function(e) {
                  const message = e.message || '';
                  if (
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3')
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }, true);
                
                window.addEventListener('unhandledrejection', function(e) {
                  const message = (e.reason && e.reason.message) || String(e.reason) || '';
                  if (
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3')
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
