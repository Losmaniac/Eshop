import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.SITE_URL || "http://localhost:3000") + (process.env.NEXT_PUBLIC_BASE_PATH ?? "");
  const pages = ["", "/obchod", "/poptavka", "/o-nas", "/obchodni-podminky", "/ochrana-osobnich-udaju", "/vraceni-zbozi", "/reklamace", "/cookies"];
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.6 })),
    ...catalog.map((p) => ({ url: `${base}/obchod/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
