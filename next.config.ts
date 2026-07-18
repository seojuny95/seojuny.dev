import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  // Per-post media (audio/diagrams) are static assets served by the CDN and are
  // never read by functions at runtime. Keep them out of function bundles so the
  // dynamic OG-image route stays under Vercel's 250 MB function size limit.
  outputFileTracingExcludes: {
    "*": ["public/posts/**/*"],
  },
};

export default nextConfig;
