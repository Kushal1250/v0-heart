import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo-config"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/features",
          "/contact",
          "/signup",
          "/login",
          "/product/features",
          "/legal/privacy-policy",
          "/legal/terms",
          "/contact/whatsapp-support",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/dashboard/",
          "/profile/",
          "/settings/",
          "/predict/",
          "/history/",
          "/private/",
          "/*.json$",
          "/temp/",
          "/scripts/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
