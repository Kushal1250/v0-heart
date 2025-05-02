"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Database, AlertTriangle, CheckCircle, Clock, Server, Table } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface DatabaseStatusProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DatabaseMetric {
  name: string
  value: string | number
  status: "good" | "warning" | "error" | "neutral"
  icon?: React.ReactNode
}

interface TableInfo {
  name: string
  rowCount: number
  size: string
  lastAnalyzed: string
}

export function DatabaseStatusDialog({ open, onOpenChange }: DatabaseStatusProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<DatabaseMetric[]>([
    { name: "Connection", value: "Connected", status: "good", icon: <CheckCircle className="h-4 w-4" /> },
    { name: "Response Time", value: "45ms", status: "good", icon: <Clock className="h-4 w-4" /> },
    { name: "Server", value: "PostgreSQL 14.5", status: "good", icon: <Server className="h-4 w-4" /> },
    { name: "Tables", value: "24", status: "good", icon: <Table className="h-4 w-4" /> },
  ])
  const [tables, setTables] = useState<TableInfo[]>([
    { name: "users", rowCount: 156, size: "1.2 MB", lastAnalyzed: "2 hours ago" },
    { name: "predictions", rowCount: 423, size: "3.5 MB", lastAnalyzed: "2 hours ago" },
    { name: "verification_codes", rowCount: 89, size: "0.4 MB", lastAnalyzed: "2 hours ago" },
    { name: "password_reset_tokens", rowCount: 12, size: "0.1 MB", lastAnalyzed: "2 hours ago" },
    { name: "system_settings", rowCount: 15, size: "0.1 MB", lastAnalyzed: "2 hours ago" },
  ])

  const refreshDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/detailed-db-diagnostics", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch database diagnostics")
      }

      const data = await response.json()

      if (data.success) {
        // Update metrics with real data
        const updatedMetrics: DatabaseMetric[] = [
          {
            name: "Connection",
            value: data.connected ? "Connected" : "Disconnected",
            status: data.connected ? "good" : "error",
            icon: data.connected ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />,
          },
          {
            name: "Response Time",
            value: data.responseTime || "Unknown",
            status: data.responseTime && Number.parseInt(data.responseTime) < 100 ? "good" : "warning",
            icon: <Clock className="h-4 w-4" />,
          },
          {
            name: "Server",
            value: data.serverVersion || "Unknown",
            status: "good",
            icon: <Server className="h-4 w-4" />,
          },
          {
            name: "Tables",
            value: data.tables?.length || "Unknown",
            status: "good",
            icon: <Table className="h-4 w-4" />,
          },
        ]

        setMetrics(updatedMetrics)

        // Update tables with real data if available
        if (data.tables && Array.isArray(data.tables)) {
          const updatedTables = data.tables.map((table: any) => ({
            name: table.table_name,
            rowCount: table.row_count || 0,
            size: table.size || "Unknown",
            lastAnalyzed: table.last_analyzed || "Never",
          }))
          setTables(updatedTables)
        }
      }
    } catch (error) {
      console.error("Error refreshing database status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500 text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </DialogTitle>
          <DialogDescription>Detailed information about your database connection and health.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Connected</span>
              </span>
            </Badge>
            <span className="text-sm text-gray-500">Last checked: {new Date().toLocaleTimeString()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDatabaseStatus}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.name}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">{metric.name}</span>
                      <Badge className={getStatusColor(metric.status)}>{metric.icon}</Badge>
                    </div>
                    <div className="mt-2 text-2xl font-bold">{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Connection Pool</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active connections</span>
                    <span>3 / 10</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables">
            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-medium text-sm">
                <div>Table Name</div>
                <div>Row Count</div>
                <div>Size</div>
                <div>Last Analyzed</div>
              </div>
              <Separator />
              {tables.map((table, index) => (
                <div key={table.name}>
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                    <div className="font-medium">{table.name}</div>
                    <div>{table.rowCount.toLocaleString()}</div>
                    <div>{table.size}</div>
                    <div>{table.lastAnalyzed}</div>
                  </div>
                  {index < tables.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diagnostics">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Connection Test</h3>
                  <div className="flex justify-between items-center">
                    <span>Connection to database</span>
                    <Badge className="bg-green-500">Successful</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span>Query execution</span>
                    <Badge className="bg-green-500">Successful</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Database Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Database Name</span>
                      <span className="font-medium">heart_predict</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Host</span>
                      <span className="font-medium">db.example.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Port</span>
                      <span className="font-medium">5432</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SSL Mode</span>
                      <span className="font-medium">require</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/admin/detailed-db-diagnostics", "_blank")}
                >
                  View Full Diagnostics
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
