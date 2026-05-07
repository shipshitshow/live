/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    ANALYTICS_API_URL: process.env.ANALYTICS_API_URL ?? "http://localhost:8000",
    PIPELINE_API_URL: process.env.PIPELINE_API_URL ?? "http://localhost:8001",
  },
  experimental: isProduction
    ? {}
    : {
        cpus: 2,
      },
  async redirects() {
    return [
      {
        destination: "/analytics",
        permanent: false,
        source: "/",
      },
      {
        destination: "/analytics",
        permanent: false,
        source: "/review",
      },
    ];
  },
  ...(isProduction
    ? {
        outputFileTracingIncludes: {
          "/*": ["./data/livestream/**/*"],
        },
      }
    : {}),
};

export default nextConfig;
