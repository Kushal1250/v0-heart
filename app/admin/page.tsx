import AdminDashboardClient from "./AdminDashboardClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | HeartPredict",
  description: "Admin dashboard for HeartPredict application",
}

export default function AdminDashboard() {
  return <AdminDashboardClient />
}
