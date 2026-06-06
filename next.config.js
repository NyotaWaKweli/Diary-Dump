/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gudsybbywbksilodgahg.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
