import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    return [
      {
        // Allow tenant pages to be embedded in iframes from the main domain
        source: "/:domain/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' *.${rootDomain} ${rootDomain}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
