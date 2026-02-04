/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable SSR with Firebase Cloud Functions
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api-gi52ugpsnq-uc.a.run.app/api/v1",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
