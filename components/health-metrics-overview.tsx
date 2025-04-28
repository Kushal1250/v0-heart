"use client"

import { Card } from "@/components/ui/card"
import { Activity, Calendar, BarChart, Users } from "lucide-react"

export function HealthMetricsOverview() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Health Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Risk Score</p>
              <p className="text-2xl font-semibold text-gray-900">32%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last Assessment</p>
              <p className="text-2xl font-semibold text-gray-900">2 days ago</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Risk Trend</p>
              <p className="text-2xl font-semibold text-gray-900">Stable</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Community Rank</p>
              <p className="text-2xl font-semibold text-gray-900">Top 20%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
