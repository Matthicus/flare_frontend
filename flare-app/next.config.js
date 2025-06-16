/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://flare.ddev.site/api/:path*", // <-- only used in dev
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flare-backend-2.ddev.site", // dev
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "flare-app-q3qkb.ondigitalocean.app", // production
        pathname: "workspace/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;
