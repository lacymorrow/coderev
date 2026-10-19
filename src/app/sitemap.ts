import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}${routes.terms}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}${routes.privacy}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
