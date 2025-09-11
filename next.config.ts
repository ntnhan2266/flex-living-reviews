import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  redirects: async () => [
    {
      source: '/',
      destination: '/dashboard',
      permanent: true,
    },
  ],
  devIndicators: false
};

export default nextConfig;
