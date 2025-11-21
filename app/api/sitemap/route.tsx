import { NextResponse } from "next/server"
import { siteConfig } from "@/lib/seo-config"

export async function GET() {
  const baseUrl = siteConfig.url

  // Define all pages with their metadata
  const pages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: "1.0",
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.9",
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.7",
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: "0.9",
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/product/features`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: "0.5",
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: "0.5",
    },
    {
      url: `${baseUrl}/contact/whatsapp-support`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: "0.6",
    },
  ]

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`,
  )
  .join("\n")}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
