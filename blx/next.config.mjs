/** @type {import('next').NextConfig} */
const nextConfig = {
    // Suppress hydration warnings for browser extensions
    reactStrictMode: true,

    // Ignore hydration warnings from browser extensions
    experimental: {
        // suppressHydrationWarning: true, // This option doesn't exist in Next.js
    },

    // Optional: Add custom headers to prevent some extensions from interfering
    async headers () {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                ],
            },
        ];
    },

    // Temporarily ignore problematic pages during development
    async rewrites () {
        return [
            {
                source: '/(client)/(require-login)/:path*',
                destination: '/404',
            },
        ];
    },
};

export default nextConfig;