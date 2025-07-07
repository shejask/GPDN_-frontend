/** @type {import('next').NextConfig} */

// Enable React 19 compatibility for antd
// process.env.DISABLE_NEW_JSX_TRANSFORM = 'true';

const nextConfig = {
  // Set React strict mode to true for better compatibility
  reactStrictMode: true,
  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.thegpdn.org/api/:path*'
      }
    ];
  },
  // Experimental features section removed as allowMiddlewareResponseBody is no longer supported
  // Expand transpilePackages to include all required Ant Design packages
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-table',
    'rc-tree',
    'rc-select'
  ],
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Content-Type' },
        ],
      },
    ];
  },
  images: {
    domains: ['api.thegpdn.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.thegpdn.org',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
};

module.exports = nextConfig;
