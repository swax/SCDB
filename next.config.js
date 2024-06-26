const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_STATIC_HOSTNAME,
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
