/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Assets are already delivered by the configured CDN/origin.
    unoptimized: true,
  },
  allowedDevOrigins: ['127.0.0.1'],
  transpilePackages: ['@shipshitshow/ui'],
};

export default nextConfig;
