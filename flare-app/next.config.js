/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://flare.ddev.site/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
