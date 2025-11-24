import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable experimental features if needed
  },
  images: {
    domains: ['localhost', 'fastapi.localhost','exampapel-images-bucket2025.s3.amazonaws.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       // headers: [
  //       //   {
  //       //     key: 'Content-Security-Policy',
  //       //     value: "default-src 'self'; connect-src 'self' http://fastapi.localhost;",
  //       //   },
  //       // ],
  //     },
  //   ];
  // },
};

export default nextConfig;
