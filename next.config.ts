import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  output: process.env.NEXT_STANDALONE === "true" || process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const rawBackendUrl = process.env.INTERNAL_API_URL || 'http://localhost:5001';
    const backendUrl = rawBackendUrl.replace(/\/+$/, '');
    return {
      beforeFiles: [
        {
          source: '/api/auth/profile',
          destination: `${backendUrl}/auth/profile`,
        },
        {
          source: '/api/health',
          destination: `${backendUrl}/health`,
        },
        {
          source: '/api/auth/login',
          destination: `${backendUrl}/auth/login`,
        },
        {
          source: '/api/auth/register',
          destination: `${backendUrl}/auth/register`,
        },
        {
          source: '/api/auth/me',
          destination: `${backendUrl}/auth/me`,
        },
        {
          source: '/api/auth/refresh',
          destination: `${backendUrl}/auth/refresh`,
        },
        {
          source: '/api/auth/logout',
          destination: `${backendUrl}/auth/logout`,
        },
        {
          source: '/api/auth/change-password',
          destination: `${backendUrl}/auth/change-password`,
        },
        {
          source: '/api/auth/ngo-apply',
          destination: `${backendUrl}/ngo-applications`,
        },
        {
          source: '/api/disasters',
          destination: `${backendUrl}/disasters`,
        },
        {
          source: '/api/disasters/:id',
          destination: `${backendUrl}/disasters/:id`,
        },
        {
          source: '/api/sos',
          destination: `${backendUrl}/sos`,
        },
        {
          source: '/api/sos/:id',
          destination: `${backendUrl}/sos/:id`,
        },
        {
          source: '/api/sos/:id/dispatch',
          destination: `${backendUrl}/sos/:id/dispatch`,
        },
        {
          source: '/api/shelters',
          destination: `${backendUrl}/shelters`,
        },
        {
          source: '/api/shelters/:id',
          destination: `${backendUrl}/shelters/:id`,
        },
        {
          source: '/api/supplies',
          destination: `${backendUrl}/supplies`,
        },
        {
          source: '/api/responders',
          destination: `${backendUrl}/responders`,
        },
        {
          source: '/api/responders/:id',
          destination: `${backendUrl}/responders/:id`,
        },
        {
          source: '/api/donations',
          destination: `${backendUrl}/donations`,
        },
        {
          source: '/api/admin/users',
          destination: `${backendUrl}/admin/users`,
        },
        {
          source: '/api/admin/users/provision',
          destination: `${backendUrl}/admin/users/provision`,
        },
        {
          source: '/api/admin/users/:id',
          destination: `${backendUrl}/admin/users/:id`,
        },
        {
          source: '/api/users',
          destination: `${backendUrl}/users`,
        },
        {
          source: '/api/users/:id',
          destination: `${backendUrl}/users/:id`,
        },
        {
          source: '/api/admin/ngo-applications',
          destination: `${backendUrl}/ngo-applications`,
        },
        {
          source: '/api/admin/ngo-applications/:id/review',
          destination: `${backendUrl}/ngo-applications/:id/review`,
        },
      ],
    };
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};


export default nextConfig;
