"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function DiagnosticsPage() {
  const [browserInfo, setBrowserInfo] = useState<Record<string, any>>({})
  const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine)
  const [memoryInfo, setMemoryInfo] = useState<any>(null)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [jsErrors, setJsErrors] = useState<string[]>([])

  useEffect(() => {
    // Collect browser information
    const browser = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
    }
    setBrowserInfo(browser)

    // Calculate page load time
    if (window.performance) {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      setLoadTime(pageLoadTime)
    }

    // Get memory info if available
    if (performance && (performance as any).memory) {
      setMemoryInfo((performance as any).memory)
    }

    // Listen for network status changes
    const handleOnline = () => setNetworkStatus(true)
    const handleOffline = () => setNetworkStatus(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Listen for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      setJsErrors((prev) => [...prev, `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`])
      // Don't prevent default so the error still shows in console
    }
    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("error", handleError)
    }
  }, [])

  const runTest = () => {
    try {
      // Test localStorage
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")

      // Test sessionStorage
      sessionStorage.setItem("test", "test")
      sessionStorage.removeItem("test")

      // Force a refresh of the page
      window.location.reload()
    } catch (error) {
      console.error("Storage test failed:", error)
      setJsErrors((prev) => [...prev, `Storage test failed: ${error instanceof Error ? error.message : String(error)}`])
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
      <p className="text-gray-600 mb-8">
        This page helps diagnose client-side issues with the HeartPredict application.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className={`mr-2 h-4 w-4 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}></div>
              Network Status
            </CardTitle>
            <CardDescription>Current network connectivity status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {networkStatus ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span>{networkStatus ? "Online" : "Offline"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>Page load time and memory usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Load Time:</span>
                <span>{loadTime ? `${loadTime}ms` : "Not available"}</span>
              </div>
              {memoryInfo && (
                <>
                  <div className="flex justify-between">
                    <span>Total JS Heap:</span>
                    <span>{Math.round(memoryInfo.totalJSHeapSize / (1024 * 1024))} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used JS Heap:</span>
                    <span>{Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))} MB</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browser" className="mt-8">
        <TabsList>
          <TabsTrigger value="browser">Browser Info</TabsTrigger>
          <TabsTrigger value="errors">JavaScript Errors</TabsTrigger>
        </TabsList>
        <TabsContent value="browser" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
              <CardDescription>Details about your browser environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(browserInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="errors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>JavaScript Errors</CardTitle>
              <CardDescription>Recent JavaScript errors detected on this page</CardDescription>
            </CardHeader>
            <CardContent>
              {jsErrors.length > 0 ? (
                <div className="space-y-2">
                  {jsErrors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error {index + 1}</AlertTitle>
                      <AlertDescription className="font-mono text-xs break-all">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  No JavaScript errors detected
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Run Diagnostics Test</CardTitle>
          <CardDescription>Test browser storage and refresh the page</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            This will test localStorage and sessionStorage functionality and then refresh the page to check for any
            persistent issues.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={runTest} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Run Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
