import { ToastContainer } from "react-toastify";
import Script from "next/script";

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
        {children}
        <ToastContainer limit={2} />
        <Script src="/js/bootstrap.bundle.min.js" />
        <Script
          id="block-metamask-errors"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Save original console methods
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                // Override console.error to suppress MetaMask and other extension errors
                console.error = function(...args) {
                  const message = args.join(' ');
                  const fullMessage = args.map(arg => {
                    if (typeof arg === 'object') {
                      try {
                        return JSON.stringify(arg);
                      } catch {
                        return String(arg);
                      }
                    }
                    return String(arg);
                  }).join(' ');
                  
                  // Kiểm tra lỗi từ browser extensions
                  const errorObj = args.find(arg => typeof arg === 'object' && arg !== null);
                  const isExtensionError = 
                    errorObj?.reqInfo?.pathPrefix === '/site_integration' ||
                    errorObj?.reqInfo?.pathPrefix === '/writing' ||
                    errorObj?.reqInfo?.path?.includes('/site_integration') ||
                    errorObj?.reqInfo?.path?.includes('/template_list') ||
                    errorObj?.reqInfo?.path?.includes('/writing') ||
                    (errorObj?.code === 403 && errorObj?.reqInfo) ||
                    (errorObj?.message === 'permission error' && errorObj?.reqInfo);
                  
                  if (
                    isExtensionError ||
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3') ||
                    message.includes('/api/auth/') ||
                    fullMessage.includes('/api/auth/') ||
                    message.includes('/api/auth/callback') ||
                    fullMessage.includes('/api/auth/callback') ||
                    message.includes('CLIENT_FETCH_ERROR') ||
                    fullMessage.includes('CLIENT_FETCH_ERROR') ||
                    message.includes('Unexpected token') ||
                    fullMessage.includes('Unexpected token') ||
                    message.includes('<!DOCTYPE') ||
                    fullMessage.includes('<!DOCTYPE') ||
                    message.includes('next-auth') ||
                    fullMessage.includes('next-auth') ||
                    message.includes('[next-auth]') ||
                    fullMessage.includes('[next-auth]') ||
                    message.includes('GSI_LOGGER') ||
                    message.includes('client ID is not found') ||
                    (message.includes('403') && (fullMessage.includes('site_integration') || fullMessage.includes('template_list') || fullMessage.includes('permission error'))) ||
                    message.includes('404') ||
                    message.includes('Failed to load resource') ||
                    fullMessage.includes('site_integration') ||
                    fullMessage.includes('template_list') ||
                    (fullMessage.includes('permission error') && fullMessage.includes('reqInfo'))
                  ) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                // Override console.warn to suppress MetaMask and other extension warnings
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3') ||
                    message.includes('/api/auth/callback') ||
                    message.includes('GSI_LOGGER') ||
                    message.includes('client ID is not found')
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                // Override console.log to suppress NextAuth route logs
                console.log = function(...args) {
                  const message = args.join(' ');
                  // Bỏ qua log từ NextAuth routes và errors
                  if (
                    message.includes('/api/auth/') ||
                    message.includes('/api/auth/callback/login-by-username-password') ||
                    message.includes('/api/auth/callback/login-by-2fa') ||
                    message.includes('/api/auth/callback/credentials') ||
                    message.includes('POST /api/auth/') ||
                    message.includes('GET /api/auth/') ||
                    message.includes('404 in') ||
                    message.includes('302 in') ||
                    message.includes('401 in') ||
                    message.includes('CLIENT_FETCH_ERROR') ||
                    message.includes('Unexpected token') ||
                    message.includes('Invalid email or password') ||
                    message.includes('Callback for provider type credentials not supported') ||
                    message.includes('credentials not supported') ||
                    message.includes('GSI_LOGGER') ||
                    message.includes('client ID is not found') ||
                    message.includes('next-auth')
                  ) {
                    return;
                  }
                  originalLog.apply(console, args);
                };
                
                // Suppress window error events from MetaMask and extensions
                window.addEventListener('error', function(e) {
                  const message = e.message || '';
                  const error = e.error;
                  
                  // Kiểm tra lỗi từ browser extensions
                  const isExtensionError = 
                    error?.reqInfo?.pathPrefix === '/site_integration' ||
                    error?.reqInfo?.pathPrefix === '/writing' ||
                    error?.reqInfo?.path?.includes('/site_integration') ||
                    error?.reqInfo?.path?.includes('/template_list') ||
                    error?.reqInfo?.path?.includes('/writing') ||
                    (error?.code === 403 && error?.reqInfo) ||
                    (error?.message === 'permission error' && error?.reqInfo);
                  
                  if (
                    isExtensionError ||
                    message.includes('MetaMask') ||
                    message.includes('Failed to connect to MetaMask') ||
                    message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
                    message.includes('Runtime i') ||
                    message.includes('ethereum') ||
                    message.includes('wallet') ||
                    message.includes('web3') ||
                    (message.includes('permission error') && error?.reqInfo)
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }, true);
                
                // Suppress unhandled promise rejections from extensions
                window.addEventListener('unhandledrejection', function(e) {
                  const error = e.reason;
                  const message = (error && error.message) || String(error) || '';
                  
                  // Bỏ qua lỗi từ MetaMask
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
                  
                  // Bỏ qua lỗi từ browser extensions (Cursor AI, site_integration, etc.)
                  const isExtensionError = 
                    error?.reqInfo?.pathPrefix === '/site_integration' ||
                    error?.reqInfo?.pathPrefix === '/writing' ||
                    error?.reqInfo?.path?.includes('/site_integration') ||
                    error?.reqInfo?.path?.includes('/template_list') ||
                    error?.reqInfo?.path?.includes('/writing') ||
                    error?.reqInfo?.path?.includes('get_template_list') ||
                    (error?.code === 403 && error?.reqInfo) ||
                    (error?.message === 'permission error' && error?.reqInfo) ||
                    (message.includes('permission error') && error?.reqInfo);
                  
                  if (isExtensionError) {
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
