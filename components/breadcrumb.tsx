import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { StructuredData } from "@/lib/structured-data"

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbItems = [{ name: "Home", url: "/" }, ...items]

  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          items: breadcrumbItems,
        }}
      />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="flex items-center hover:text-primary transition-colors">
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
        {breadcrumbItems.slice(1).map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {index === breadcrumbItems.length - 2 ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={item.url} className="hover:text-primary transition-colors">
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
