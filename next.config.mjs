/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve AVIF first (smallest), falling back to WebP.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
