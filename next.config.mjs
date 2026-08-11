/** @type {import('next').NextConfig} */

// Content Security Policy. No third-party scripts are used, so everything is
// locked to 'self'. 'unsafe-inline' is required for scripts/styles because the
// site is statically pre-rendered (no per-request nonce); since no user input
// is ever reflected into the page, there is no XSS injection vector to exploit.
// Next's dev server evaluates modules with eval() for hot reloading, which the
// production policy correctly forbids. Allow it in development only, so local
// client components hydrate; production keeps the strict policy.
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://buttondown.email https://buttondown.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Serve AVIF first (smallest), falling back to WebP.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The tools and prompts moved to their own site. Send any existing link
  // to the equivalent page there rather than dropping visitors on a 404.
  async redirects() {
    return [
      {
        source: "/:locale(en|ar)/tools/:path*",
        destination: "https://ordiveo.com/:locale/tools/:path*",
        permanent: true,
      },
      {
        source: "/:locale(en|ar)/prompts",
        destination: "https://ordiveo.com/:locale/prompts",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
