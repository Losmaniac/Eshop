import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL || "http://localhost:3000") + (process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/objednavka/", "/pokladna", "/kosik"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
