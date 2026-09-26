/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@omar-makawy/shared'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
