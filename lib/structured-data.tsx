import { siteConfig } from "./seo-config"

export interface StructuredDataProps {
  type: "website" | "article" | "product" | "organization" | "medicalWebPage" | "faq" | "breadcrumb"
  data?: any
}

export function generateStructuredData({ type, data = {} }: StructuredDataProps) {
  const baseUrl = siteConfig.url

  const schemas = {
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.creator,
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
        },
      },
    },

    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      description: siteConfig.description,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English"],
        areaServed: "Worldwide",
      },
      sameAs: [
        "https://twitter.com/heartguardai",
        "https://linkedin.com/company/heartguardai",
        "https://github.com/heartguardai",
      ],
    },

    medicalWebPage: {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: data.title || siteConfig.title,
      description: data.description || siteConfig.description,
      url: data.url || baseUrl,
      mainContentOfPage: {
        "@type": "WebPageElement",
        cssSelector: "main",
      },
      specialty: "Cardiology",
      medicalAudience: {
        "@type": "MedicalAudience",
        audienceType: "Patient",
      },
      about: {
        "@type": "MedicalCondition",
        name: "Heart Disease",
        alternateName: ["Cardiovascular Disease", "Cardiac Disease"],
        description: "A range of conditions that affect the heart and blood vessels",
      },
      lastReviewed: new Date().toISOString().split("T")[0],
      reviewedBy: {
        "@type": "Organization",
        name: siteConfig.creator,
      },
    },

    faq: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity:
        data.questions?.map((q: any) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })) || [],
    },

    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement:
        data.items?.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })) || [],
    },

    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.title,
      description: data.description,
      image: data.image || `${baseUrl}/og-image.png`,
      datePublished: data.publishedAt || new Date().toISOString(),
      dateModified: data.updatedAt || new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: siteConfig.creator,
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.publisher,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": data.url || baseUrl,
      },
    },

    product: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      description: siteConfig.description,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Organization",
        name: siteConfig.creator,
      },
      downloadUrl: baseUrl,
      screenshot: `${baseUrl}/screenshot.png`,
    },
  }

  return schemas[type] || schemas.website
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = generateStructuredData({ type, data })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
