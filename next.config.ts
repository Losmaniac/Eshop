import type { NextConfig } from "next";

// Two build targets share one codebase:
// - default: full shop with API routes, database and emails (Vercel, VPS, ...)
// - STATIC_EXPORT=1: static demo for GitHub Pages. Checkout and inquiry run
//   in the browser only, nothing is stored or emailed.
// Files named `*.server.ts(x)` are only routed in the full build and
// `*.static.ts(x)` only in the static demo build.
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : undefined,
  basePath: basePath || undefined,
  trailingSlash: isStatic,
  pageExtensions: isStatic
    ? ["static.tsx", "static.ts", "tsx", "ts"]
    : ["server.tsx", "server.ts", "tsx", "ts"],
  images: {
    unoptimized: isStatic,
    formats: ["image/webp"],
  },
  env: {
    NEXT_PUBLIC_DEMO_MODE: isStatic ? "1" : "",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
