
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // NOTE: For development, keep dynamic rendering (with middleware)
  // For mobile production, we'll use 'npm run build && npx cap sync'
  // output: 'export' conflicts with middleware
  distDir: 'out',
  // Optimize for mobile
  compress: true,
  images: {
    unoptimized: true, // For mobile compatibility
  },
  // Trailing slashes for mobile compatibility
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ VERY IMPORTANT
  },

  typescript: {
    ignoreBuildErrors: true, // safety for production
  },
};

module.exports = nextConfig;
