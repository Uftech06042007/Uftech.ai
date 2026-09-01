/** @type {import('next').NextConfig} */

// Applied to every response. None of these depend on the host, so they hold
// on Vercel, behind a CDN, or on a bare Node server alike.
const securityHeaders = [
  // The site is never meant to be framed — clickjacking guard, stated twice
  // because older browsers only honour the first and modern ones the second.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL same-origin, origin only cross-origin, nothing on downgrade.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here asks for hardware; deny it rather than leave it to the default.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Two years, subdomains included. No `preload` — that is a one-way commitment
  // for the whole apex domain and belongs to whoever owns uftech.com DNS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

// The hero and card videos are ~26MB in total and their filenames are not
// content-hashed, so `immutable` would strand a replacement for a year.
// Instead: a short browser cache, and a long CDN cache that a new deployment
// invalidates anyway — which is where the repeat-bandwidth saving actually is.
const mediaCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400",
};

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/videos/:path*", headers: [mediaCacheHeader] },
      { source: "/images/:path*", headers: [mediaCacheHeader] },
    ];
  },
};

export default nextConfig;
