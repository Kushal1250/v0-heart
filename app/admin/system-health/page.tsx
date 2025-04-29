"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react"

export default function SystemHealthPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/diagnostics")

      if (!response.ok) {
        throw new Error(`Failed to fetch diagnostics: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setDiagnostics(data.diagnostics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch system diagnostics")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> OK
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        )
      case "misconfigured":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" /> Misconfigured
          </Badge>
        )
      case "configured":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Configured
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Health Dashboard</h1>
        <Button onClick={fetchDiagnostics} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !diagnostics ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Loading system diagnostics...</p>
          </div>
        </div>
      ) : diagnostics ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environment</CardTitle>
                  <CardDescription>Current system environment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{diagnostics.environment}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Last updated: {new Date(diagnostics.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>Database connection status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    {getStatusBadge(diagnostics.services.database?.status || "unknown")}
                  </div>
                  {diagnostics.services.database?.responseTime && (
                    <div className="mt-2 text-sm text-gray-500">
                      Response time: {diagnostics.services.database.responseTime}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Errors</CardTitle>
                  <CardDescription>Error summary</CardDescription>
                </CardHeader>
                <CardContent>
                  {diagnostics.recentErrors?.count !== undefined ? (
                    <>
                      <p className="text-2xl font-semibold">{diagnostics.recentErrors.count} errors</p>
                      {diagnostics.recentErrors.critical > 0 && (
                        <Badge variant="destructive" className="mt-2">
                          {diagnostics.recentErrors.critical} critical
                        </Badge>
                      )}
                      {diagnostics.recentErrors.high > 0 && (
                        <Badge variant="outline" className="mt-2 ml-2 border-orange-500 text-orange-500">
                          {diagnostics.recentErrors.high} high
                        </Badge>
                      )}
                    </>
                  ) : (
                    <p>Error data unavailable</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("errors")}>
                    View details
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SMS Service</CardTitle>
                  <CardDescription>Twilio configuration status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span>Status:</span>
                    {getStatusBadge(diagnostics.services.sms?.status || "unknown")}
                  </div>

                  {diagnostics.services.sms?.missingEnvVars?.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTitle>Missing Configuration</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2">
                          {diagnostics.services.sms.missingEnvVars.map((env: string) => (
                            <li key={env}>{env}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Service</CardTitle>
                  <CardDescription>Email configuration status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span>Status:</span>
                    {getStatusBadge(diagnostics.services.email?.status || "unknown")}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Server configured:</span>
                      {diagnostics.services.email?.server ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>From address configured:</span>
                      {diagnostics.services.email?.from ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
                <CardDescription>Database table structure information</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Verification Codes Table</h3>

                {diagnostics.tables?.verificationCodes ? (
                  <>
                    <div className="flex items-center mb-4">
                      <span className="mr-2">Table exists:</span>
                      {diagnostics.tables.verificationCodes.exists ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" /> Yes
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" /> No
                        </Badge>
                      )}
                    </div>

                    {diagnostics.tables.verificationCodes.userIdType && (
                      <div className="flex items-center mb-4">
                        <span className="mr-2">user_id column type:</span>
                        {diagnostics.tables.verificationCodes.userIdCorrect ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {diagnostics.tables.verificationCodes.userIdType} (Correct)
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {diagnostics.tables.verificationCodes.userIdType} (Should be TEXT)
                          </Badge>
                        )}
                      </div>
                    )}

                    {diagnostics.tables.verificationCodes.columns && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Column Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data Type
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {diagnostics.tables.verificationCodes.columns.map((col: any) => (
                              <tr key={col.name}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {col.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{col.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertTitle>Table Information Unavailable</AlertTitle>
                    <AlertDescription>Could not retrieve verification_codes table information.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Latest system errors</CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.recentErrors?.latest?.length > 0 ? (
                  <div className="space-y-4">
                    {diagnostics.recentErrors.latest.map((error: any) => (
                      <Alert
                        key={error.id}
                        className={
                          error.severity === "critical"
                            ? "border-red-500 bg-red-50"
                            : error.severity === "high"
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200"
                        }
                      >
                        <AlertTitle className="flex items-center justify-between">
                          <span>{error.context}</span>
                          <Badge
                            className={
                              error.severity === "critical"
                                ? "bg-red-500"
                                : error.severity === "high"
                                  ? "bg-orange-500"
                                  : error.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                            }
                          >
                            {error.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <p className="mt-1">{error.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(error.timestamp).toLocaleString()} • ID: {error.id}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">No recent errors found</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  View all errors
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}
