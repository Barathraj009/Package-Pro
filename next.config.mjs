/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native module — keep it out of the client/server bundle,
  // require it at runtime instead. Needed for both `next dev` and `next build`.
  // (This is `experimental.serverComponentsExternalPackages` on Next 14; it
  // moved to the stable top-level `serverExternalPackages` key in Next 15+ —
  // if you upgrade Next, move this out of `experimental`.)
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
  // Next.js does NOT emit production browser source maps unless this is set
  // to true — left unset (false) on purpose so the deployed bundle can't be
  // mapped back to original file names/line numbers by a normal visitor.
  productionBrowserSourceMaps: false,
  // Baseline hardening headers for a publicly reachable deployment. None of
  // this hides the client bundle (nothing can); it just closes a few cheap,
  // well-known holes (clickjacking, MIME sniffing, leaking full referrer URLs).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
