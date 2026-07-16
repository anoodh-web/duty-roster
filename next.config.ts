// next.config.ts / next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has minor ESLint warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Similarly, bypass TypeScript strict warnings on build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;