"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HealthMetricsChart } from "@/components/health-metrics-chart"
import { HealthMetricsTable } from "@/components/health-metrics-table"
import { AddMetricForm } from "@/components/add-metric-form"
import { MetricInsights } from "@/components/metric-insights"
import { HealthMetricGoals } from "@/components/health-metric-goals"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, LineChart, Table, Target, TrendingUp } from "lucide-react"

export default function HealthMetricsPage() {
  const [activeTab, setActiveTab] = useState("chart")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMetricType, setSelectedMetricType] = useState("blood_pressure")

  const metricTypes = [
    { id: "blood_pressure", name: "Blood Pressure" },
    { id: "heart_rate", name: "Heart Rate" },
    { id: "cholesterol", name: "Cholesterol" },
    { id: "glucose", name: "Blood Glucose" },
    { id: "weight", name: "Weight" },
    { id: "steps", name: "Steps" },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
          <p className="text-muted-foreground">Track and monitor your key health indicators over time</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {showAddForm ? "Hide Form" : "Add New Measurement"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Measurement</CardTitle>
            <CardDescription>Record a new health metric measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <AddMetricForm onComplete={() => setShowAddForm(false)} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chart">
            <LineChart className="h-4 w-4 mr-2" />
            Chart View
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {(activeTab === "chart" || activeTab === "table") && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {metricTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedMetricType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMetricType(type.id)}
                  >
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <TabsContent value="chart" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics Chart</CardTitle>
                <CardDescription>Visualize your health metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <HealthMetricsChart metricType={selectedMetricType} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics Data</CardTitle>
                <CardDescription>View and manage your recorded health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <HealthMetricsTable metricType={selectedMetricType} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <HealthMetricGoals />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Health Insights</CardTitle>
                <CardDescription>AI-powered analysis of your health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricInsights metricType={selectedMetricType} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
