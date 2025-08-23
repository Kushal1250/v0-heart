export const siteConfig = {
  name: "HeartGuard AI",
  title: "Heart Disease Risk Prediction | AI-Powered Health Assessment",
  description:
    "Advanced AI-powered heart disease risk prediction platform. Get personalized health insights, track vital statistics, and receive expert recommendations to protect your heart health.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://heartguard-ai.vercel.app",
  ogImage: "/og-image.png",
  keywords: [
    "heart disease prediction",
    "cardiovascular health",
    "AI health assessment",
    "heart risk calculator",
    "preventive cardiology",
    "health monitoring",
    "cardiac risk factors",
    "machine learning healthcare",
    "heart health tracker",
    "cardiovascular screening",
  ],
  authors: [
    {
      name: "HeartGuard AI Team",
      url: "https://heartguard-ai.vercel.app",
    },
  ],
  creator: "HeartGuard AI",
  publisher: "HeartGuard AI",
  category: "Healthcare Technology",
  classification: "Medical AI Platform",
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  noIndex?: boolean
} = {}) {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const metaUrl = url || siteConfig.url

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    category: siteConfig.category,
    classification: siteConfig.classification,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: metaUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: "@heartguardai",
      site: "@heartguardai",
    },
    alternates: {
      canonical: metaUrl,
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
  }
}
