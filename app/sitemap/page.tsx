import Link from "next/link"

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", url: "/" },
        { name: "Predict", url: "/predict" },
        { name: "About", url: "/about" },
        { name: "History", url: "/history" },
        { name: "Settings", url: "/settings" },
      ],
    },
    {
      title: "Product",
      links: [
        { name: "Features", url: "/product/features" },
        { name: "Pricing", url: "/product/pricing" },
        { name: "FAQ", url: "/product/faq" },
        { name: "Testimonials", url: "/product/testimonials" },
        { name: "Case Studies", url: "/product/case-studies" },
        { name: "Integrations", url: "/product/integrations" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", url: "/company/about-us" },
        { name: "Our Team", url: "/company/team" },
        { name: "Careers", url: "/company/careers" },
        { name: "Blog", url: "/company/blog" },
        { name: "Press Releases", url: "/company/press-releases" },
        { name: "Our Partners", url: "/company/partners" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", url: "/legal/privacy-policy" },
        { name: "Terms of Service", url: "/legal/terms" },
        { name: "Cookie Policy", url: "/legal/cookie-policy" },
        { name: "GDPR Compliance", url: "/legal/gdpr" },
        { name: "Security", url: "/legal/security" },
        { name: "HIPAA Compliance", url: "/legal/hipaa" },
        { name: "Accessibility", url: "/legal/accessibility" },
        { name: "Responsible Disclosure", url: "/legal/responsible-disclosure" },
      ],
    },
    {
      title: "Contact",
      links: [
        { name: "WhatsApp Support", url: "/contact/whatsapp-support" },
        { name: "Email Support", url: "mailto:heartguide108@gmail.com" },
        { name: "Phone Support", url: "tel:+919016261380" },
      ],
    },
    {
      title: "Social Media",
      links: [
        { name: "Twitter", url: "/social/twitter" },
        { name: "Facebook", url: "/social/facebook" },
        { name: "Instagram", url: "/social/instagram" },
        { name: "LinkedIn", url: "/social/linkedin" },
        { name: "GitHub", url: "/social/github" },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Sitemap</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto text-center mb-12">
          A complete overview of all pages available on the HeartCare website
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapSections.map((section, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.url.startsWith("/") ? (
                      <Link href={link.url} className="text-gray-400 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    ) : (
                      <a href={link.url} className="text-gray-400 hover:text-white transition-colors">
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-400 mb-6">
            If you can't find the page you're looking for, please contact our support team for assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:heartguide108@gmail.com"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
