"use client"

import type React from "react"

import Link from "next/link"
import { Heart, Twitter, Facebook, Instagram, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react"

export default function GlobalFooter() {
  // Function to handle link clicks
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's an external link (starts with http), let the default behavior happen
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return
    }

    // For internal links, we can add any additional logic here if needed
    console.log(`Navigating to: ${href}`)
  }

  return (
    <footer className="bg-[#0d1524] text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1: Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <span className="text-xl font-bold">HeartCare</span>
            </div>
            <p className="text-gray-400 text-sm">Monitoring heart health with precision and care.</p>
            <div className="flex space-x-4 pt-2">
              <Link
                href="/social/twitter"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, "/social/twitter")}
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="/social/facebook"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, "/social/facebook")}
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="/social/instagram"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, "/social/instagram")}
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="/social/linkedin"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, "/social/linkedin")}
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="/social/github"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, "/social/github")}
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Column 2: PRODUCT */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PRODUCT</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/product/features"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/features")}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/product/pricing"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/pricing")}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/product/faq"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/faq")}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/product/testimonials"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/testimonials")}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/product/case-studies"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/case-studies")}
                >
                  Case Studies
                </Link>
              </li>
              <li>
                <Link
                  href="/product/integrations"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/product/integrations")}
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div>
            <h3 className="text-lg font-semibold mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/company/about-us"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/about-us")}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/company/team"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/team")}
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/company/careers"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/careers")}
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/company/blog"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/blog")}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/company/press-releases"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/press-releases")}
                >
                  Press Releases
                </Link>
              </li>
              <li>
                <Link
                  href="/company/partners"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/company/partners")}
                >
                  Our Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: LEGAL */}
          <div>
            <h3 className="text-lg font-semibold mb-4">LEGAL</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/privacy-policy")}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/terms")}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookie-policy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/cookie-policy")}
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/gdpr"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/gdpr")}
                >
                  GDPR Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/security"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/security")}
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/hipaa"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "/legal/hipaa")}
                >
                  HIPAA Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CONTACT</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <a
                  href="mailto:heartguide108@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "mailto:heartguide108@gmail.com")}
                >
                  heartguide108@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <a
                  href="tel:+919016261380"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => handleLinkClick(e, "tel:+919016261380")}
                >
                  +91 (901) 626-1380
                </a>
              </li>
              <li className="text-green-400 hover:text-green-300 transition-colors text-sm ml-7">
                <Link href="/contact/whatsapp-support" onClick={(e) => handleLinkClick(e, "/contact/whatsapp-support")}>
                  WhatsApp Support
                </Link>
              </li>
              <li className="flex items-start gap-2 mt-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-gray-400 text-sm">
                  <p>HeartCare Headquarters</p>
                  <p>123 Health Street</p>
                  <p>Medical City, MC 12345</p>
                  <p>India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Bottom Links */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-4">© 2025 HeartCare. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <Link
              href="/legal/accessibility"
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onClick={(e) => handleLinkClick(e, "/legal/accessibility")}
            >
              Accessibility
            </Link>
            <Link
              href="/sitemap"
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onClick={(e) => handleLinkClick(e, "/sitemap")}
            >
              Sitemap
            </Link>
            <Link
              href="/legal/responsible-disclosure"
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onClick={(e) => handleLinkClick(e, "/legal/responsible-disclosure")}
            >
              Responsible Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
