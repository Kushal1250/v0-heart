"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export default function FixIssuesPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runFixes = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/fix-issues", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to run fixes: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run system fixes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fix System Issues</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Repair Tool</CardTitle>
          <CardDescription>
            This tool will attempt to fix common issues with the application. Use this if you're experiencing errors
            with verification codes or other functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Running this tool will make changes to your database. It's recommended to backup your data first.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={runFixes} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running Fixes...
              </>
            ) : (
              "Run System Fixes"
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Results</CardTitle>
            <CardDescription>Results of the system repair process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Alert
                  key={index}
                  className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}
                >
                  <div className="flex items-start">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    )}
                    <div>
                      <AlertTitle>{result.success ? "Success" : "Failed"}</AlertTitle>
                      <AlertDescription>
                        <p>{result.message}</p>
                        {result.details && (
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
