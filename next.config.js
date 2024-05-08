/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sketchtv-lol.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
