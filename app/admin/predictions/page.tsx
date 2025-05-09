"use client"

import { AdminPredictionsTable } from "@/components/admin-predictions-table"

export default function AdminPredictionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Predictions Management</h1>
      </div>

      <div className="grid gap-6">
        <AdminPredictionsTable />
      </div>
    </div>
  )
}
