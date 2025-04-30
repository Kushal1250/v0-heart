import type React from "react"
import AdminNavbar from "./admin-navbar"
import CommonFooter from "@/components/common-footer"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      <div className="mt-auto">
        <CommonFooter />
      </div>
    </div>
  )
}
