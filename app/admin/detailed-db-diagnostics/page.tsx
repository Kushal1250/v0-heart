"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, AlertTriangle, Database, Server, TableIcon } from "lucide-react"

interface TableInfo {
  table_name: string
  row_count: number
  size: string
  last_analyzed: string
}

interface DatabaseDiagnostics {
  connected: boolean
  responseTime: string
  serverVersion: string
  tables: TableInfo[]
  connections: {
    active: number
    max: number
  }
}

export default function DetailedDatabaseDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDiagnostics = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch("/api/admin/detailed-db-diagnostics", {
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch database diagnostics: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setDiagnostics({
          connected: data.connected,
          responseTime: data.responseTime,
          serverVersion: data.serverVersion,
          tables: data.tables || [],
          connections: data.connections || { active: 0, max: 10 },
        })
      } else {
        throw new Error(data.message || "Failed to fetch database diagnostics")
      }
    } catch (err) {
      console.error("Error fetching database diagnostics:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!diagnostics) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No database diagnostic data available.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const connectionPercentage = (diagnostics.connections.active / diagnostics.connections.max) * 100

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Diagnostics</h1>
        <p className="text-gray-500">Detailed information about your database connection and health.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`px-3 py-1 ${diagnostics.connected ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
          >
            {diagnostics.connected ? "Connected" : "Disconnected"}
          </Badge>
          <span className="text-sm text-gray-500">Last checked: {new Date().toLocaleTimeString()}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDiagnostics}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Connection Status
                </CardTitle>
                <CardDescription>Current database connection information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={diagnostics.connected ? "bg-green-500" : "bg-red-500"}>
                      {diagnostics.connected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <span>{diagnostics.responseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Server Version</span>
                    <span>{diagnostics.serverVersion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Connection Usage
                </CardTitle>
                <CardDescription>Current database connection usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span>{diagnostics.connections.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Max Connections</span>
                    <span>{diagnostics.connections.max}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block mb-1">Connection Usage</span>
                    <Progress value={connectionPercentage} />
                    <span className="text-xs text-gray-500">
                      {diagnostics.connections.active} / {diagnostics.connections.max}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Tables Information
              </CardTitle>
              <CardDescription>Detailed information about database tables</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Row Count</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Analyzed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diagnostics.tables.map((table) => (
                    <TableRow key={table.table_name}>
                      <TableCell>{table.table_name}</TableCell>
                      <TableCell>{table.row_count}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{table.last_analyzed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Performance metrics and insights will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
