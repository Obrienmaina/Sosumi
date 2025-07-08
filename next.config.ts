/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', // For blog thumbnails and other Cloudinary assets
      'lh3.googleusercontent.com', // For Google user profile pictures
      // Add any other external image domains your application uses
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Other Next.js configurations can go here
};

module.exports = nextConfig;
