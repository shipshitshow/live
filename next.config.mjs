/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    ANALYTICS_API_URL: process.env.ANALYTICS_API_URL ?? "http://localhost:8000",
    PIPELINE_API_URL: process.env.PIPELINE_API_URL ?? "http://localhost:8001",
  },
  outputFileTracingIncludes: {
    "/*": ["./data/livestream/**/*"],
  },
};

export default nextConfig;
