/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    async rewrites() {
        if (process.env.NODE_ENV === 'production') {
            return [];
        }
        const backend = process.env.BACKEND_URL || 'http://localhost:5001';
        return [
            {
                source: '/api/:path*',
                destination: `${backend}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
