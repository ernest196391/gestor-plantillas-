/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [360, 420, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};
module.exports = nextConfig;
