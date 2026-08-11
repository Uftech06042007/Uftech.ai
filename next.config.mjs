/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server output (node_modules pruned to only what's
  // needed at runtime) — copy .next/standalone + .next/static + public
  // into the Docker image instead of shipping the whole workspace.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
