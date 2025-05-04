"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, CheckCircle, ArrowRight, Download, Trash2 } from "lucide-react"
import ErrorTracker from "@/lib/error-tracking"

export default function ErrorDetectorPage() {
  const [errors, setErrors] = useState<any[]>([])
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({
    localStorage: null,
    sessionStorage: null,
    fetch: null,
    dynamic: null,
  })

  useEffect(() => {
    // Gather system information
    const info = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      connection: navigator.connection
        ? {
            downlink: (navigator.connection as any).downlink,
            effectiveType: (navigator.connection as any).effectiveType,
            rtt: (navigator.connection as any).rtt,
          }
        : "Not available",
      deviceMemory: (navigator as any).deviceMemory || "Not available",
      timestamp: new Date().toISOString(),
    }
    setSystemInfo(info)

    // Get stored errors
    const trackedErrors = ErrorTracker.getErrors()
    setErrors(trackedErrors)
  }, [])

  const runTests = async () => {
    // Test localStorage
    let localStorageWorks = false
    try {
      localStorage.setItem("test", "test")
      if (localStorage.getItem("test") === "test") {
        localStorageWorks = true
      }
      localStorage.removeItem("test")
    } catch (e) {
      console.error("localStorage test failed:", e)
    }

    // Test sessionStorage
    let sessionStorageWorks = false
    try {
      sessionStorage.setItem("test", "test")
      if (sessionStorage.getItem("test") === "test") {
        sessionStorageWorks = true
      }
      sessionStorage.removeItem("test")
    } catch (e) {
      console.error("sessionStorage test failed:", e)
    }

    // Test fetch API
    let fetchWorks = false
    try {
      const response = await fetch("https://httpstat.us/200")
      if (response.ok) {
        fetchWorks = true
      }
    } catch (e) {
      console.error("Fetch test failed:", e)
    }

    // Test dynamic import (crucial for Next.js)
    let dynamicWorks = false
    try {
      await import("react")
      dynamicWorks = true
    } catch (e) {
      console.error("Dynamic import test failed:", e)
    }

    setTestResults({
      localStorage: localStorageWorks,
      sessionStorage: sessionStorageWorks,
      fetch: fetchWorks,
      dynamic: dynamicWorks,
    })
  }

  // Function to clear errors
  const clearErrors = () => {
    ErrorTracker.clearErrors()
    setErrors([])
  }

  // Function to download error report
  const downloadReport = () => {
    const report = {
      errors,
      systemInfo,
      testResults,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `heartpredict-error-report-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Force a test error
  const forceTestError = () => {
    try {
      // @ts-ignore: This is intentional to generate an error
      const testObject = null
      testObject.nonExistentMethod()
    } catch (e) {
      if (e instanceof Error) {
        ErrorTracker.captureError({
          message: e.message,
          stack: e.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        })
        // Refresh errors
        setErrors(ErrorTracker.getErrors())
      }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Error Detector</h1>
      <p className="text-gray-600 mb-8">
        This utility helps identify and diagnose client-side errors in your application.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Detected Errors
              {errors.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {errors.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Client-side errors captured by the application</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            {errors.length > 0 ? (
              <div className="space-y-4">
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTitle className="font-mono text-xs">{new Date(error.timestamp).toLocaleString()}</AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="font-bold">{error.message}</div>
                      {error.stack && (
                        <pre className="mt-2 text-xs bg-gray-900 text-white p-2 rounded overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      )}
                      <div className="mt-2 text-xs opacity-70">URL: {error.url}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p>No errors detected</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={clearErrors} disabled={errors.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Errors
            </Button>
            <Button onClick={downloadReport} disabled={errors.length === 0} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compatibility Tests</CardTitle>
            <CardDescription>Test browser features required by the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        testResults.localStorage === null ? "gray" : testResults.localStorage ? "green" : "red",
                    }}
                  ></div>
                  <span>localStorage</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        testResults.sessionStorage === null ? "gray" : testResults.sessionStorage ? "green" : "red",
                    }}
                  ></div>
                  <span>sessionStorage</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: testResults.fetch === null ? "gray" : testResults.fetch ? "green" : "red",
                    }}
                  ></div>
                  <span>Fetch API</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: testResults.dynamic === null ? "gray" : testResults.dynamic ? "green" : "red",
                    }}
                  ></div>
                  <span>Dynamic Import</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={runTests} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
            <Button onClick={forceTestError} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test Error Capture
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Details about your environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(systemInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="text-gray-600 max-w-[60%] truncate text-right">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold">Common Solutions</h2>

        <Card>
          <CardHeader>
            <CardTitle>Hydration Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Hydration errors occur when the server-rendered HTML doesn't match the client-side React component tree.
            </p>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold mb-2">Common Causes:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Using browser-specific APIs like <code>window</code> or <code>document</code> without checking if they
                  exist
                </li>
                <li>
                  Using <code>Math.random()</code> or <code>Date.now()</code> during render
                </li>
                <li>Different content being rendered on server vs client based on environment variables</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2">Solutions:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use <code>useEffect</code> for browser-only code
                </li>
                <li>
                  Use <code>useState</code> with a stable initial value
                </li>
                <li>Implement proper loading states</li>
                <li>
                  Use <code>suppressHydrationWarning</code> where appropriate
                </li>
                <li>Check that environment variables are consistent</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local Storage Errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2">Solutions:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Always wrap localStorage access in try/catch blocks</li>
                <li>Implement a fallback mechanism when localStorage is unavailable</li>
                <li>Check for localStorage availability before using it</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
          Next Step
        </h3>
        <p className="mb-4">
          Visit the <strong>/error-detector</strong> page on your deployed site and check for any detected errors.
          Download the error report and share it for more specific troubleshooting.
        </p>
        <Button asChild>
          <a href="/error-detector" target="_blank" rel="noreferrer">
            Go to Error Detector
          </a>
        </Button>
      </div>
    </div>
  )
}
