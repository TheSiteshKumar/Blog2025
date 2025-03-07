/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    config.externals = [...config.externals, "canvas"];
    return config;
  },
};

module.exports = nextConfig;
