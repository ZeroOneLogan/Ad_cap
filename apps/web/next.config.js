const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@idle-tycoon/sim-core', '@idle-tycoon/ui-kit'],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = withPWA(nextConfig);