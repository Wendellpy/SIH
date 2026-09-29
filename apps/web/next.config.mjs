/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@sih/shared-types', '@sih/sample-data'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  async rewrites() {
    const apiTarget = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
