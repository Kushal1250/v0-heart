import Link from "next/link"

export default function QuickLinks() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">QUICK LINKS</h3>
      <ul className="space-y-2">
        <li>
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
            Contact Form
          </Link>
        </li>
        <li>
          <Link href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">
            Support Center
          </Link>
        </li>
        <li>
          <Link href="/resources" className="text-gray-400 hover:text-white transition-colors text-sm">
            Resources
          </Link>
        </li>
        <li>
          <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
            FAQ
          </Link>
        </li>
      </ul>
    </div>
  )
}
