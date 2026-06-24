import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
export default function robots(): MetadataRoute.Robots {
  const siteUrl = env.integrationsEnabled
    ? env.NEXT_PUBLIC_SITE_URL
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/back-office/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
