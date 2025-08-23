import { siteConfig } from "./seo-config"

export interface PageSEOData {
  title: string
  description: string
  url: string
  lastModified?: Date
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generatePageSEO(data: PageSEOData) {
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords?.join(", ") || siteConfig.keywords.join(", "),
    authors: [{ name: data.author || siteConfig.creator }],
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      publishedTime: data.publishedTime,
      modifiedTime: data.modifiedTime || new Date().toISOString(),
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [`${siteConfig.url}/og-image.png`],
    },
    alternates: {
      canonical: data.url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      email: "support@heartguard-ai.com",
      availableLanguage: ["English"],
      areaServed: "Worldwide",
    },
    sameAs: [
      "https://twitter.com/heartguardai",
      "https://linkedin.com/company/heartguardai",
      "https://github.com/heartguardai",
    ],
    foundingDate: "2024",
    numberOfEmployees: "10-50",
    industry: "Healthcare Technology",
    keywords: siteConfig.keywords.join(", "),
  }
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.creator,
      logo: `${siteConfig.url}/logo.png`,
    },
  }
}
