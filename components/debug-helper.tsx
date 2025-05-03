"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { safeSessionStorage } from "@/lib/safe-client-utils"

export function DebugHelper() {
  const [isOpen, setIsOpen] = useState(false)
  const [errors, setErrors] = useState<any[]>([])
  const [browserInfo, setBrowserInfo] = useState<Record<string, any>>({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Get browser info
    if (typeof window !== "undefined") {
      setBrowserInfo({
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
      })
    }

    // Get stored errors
    try {
      const storedErrors = safeSessionStorage.getItem("app_errors")
      if (storedErrors) {
        setErrors(JSON.parse(storedErrors))
      }
    } catch (e) {
      console.error("Failed to load stored errors:", e)
    }
  }, [])

  if (!isMounted) return null

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="bg-white shadow-md">
          Debug Tools
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle>Debug Helper</CardTitle>
          <CardDescription>Troubleshooting tools for client-side errors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors">
            <TabsList>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="browser">Browser Info</TabsTrigger>
              <TabsTrigger value="localStorage">Local Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-4">
              <h3 className="text-lg font-medium">Recent Errors</h3>
              {errors.length > 0 ? (
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <div key={index} className="rounded border p-2 text-sm">
                      <div>
                        <strong>Time:</strong> {error.timestamp}
                      </div>
                      <div>
                        <strong>URL:</strong> {error.url}
                      </div>
                      <div>
                        <strong>Error:</strong> {error.error?.message || JSON.stringify(error.error)}
                      </div>
                      {error.error?.stack && (
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs">
                          {error.error.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No errors recorded</p>
              )}
            </TabsContent>

            <TabsContent value="browser">
              <h3 className="text-lg font-medium mb-4">Browser Information</h3>
              <div className="space-y-2">
                {Object.entries(browserInfo).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2">{String(value)}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="localStorage">
              <h3 className="text-lg font-medium mb-4">Local Storage Contents</h3>
              <pre className="max-h-60 overflow-auto rounded bg-gray-100 p-4 text-xs">
                {JSON.stringify(
                  Object.fromEntries(Object.keys(localStorage || {}).map((key) => [key, localStorage.getItem(key)])),
                  null,
                  2,
                )}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
