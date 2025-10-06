import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV !== 'production';

const withPwa = withPWA({
  dest: 'public',
  disable: isDev,
  buildExclusions: [/middleware-manifest\.json$/],
  runtimeCaching: []
});

const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  transpilePackages: ['@idle-tycoon/sim-core', '@idle-tycoon/ui-kit']
};

export default withPwa(nextConfig);
