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
};

export default nextConfig;