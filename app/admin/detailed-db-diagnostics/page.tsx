"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DetailedDbDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixResult, setFixResult] = useState<any>(null)
  const [fixLoading, setFixLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/detailed-db-diagnostics")
      const data = await response.json()
      setDiagnostics(data)
    } catch (err) {
      setError("Failed to run diagnostics")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fixTable = async () => {
    setFixLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/detailed-db-diagnostics", {
        method: "POST",
      })
      const data = await response.json()
      setFixResult(data)
      // Refresh diagnostics after fix
      runDiagnostics()
    } catch (err) {
      setError("Failed to fix table")
      console.error(err)
    } finally {
      setFixLoading(false)
    }
  }

  // Run diagnostics on page load
  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Detailed Database Diagnostics</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Diagnostics</CardTitle>
            <CardDescription>
              Detailed information about your database connection and the password_reset_tokens table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={runDiagnostics} disabled={loading}>
                {loading ? "Running Diagnostics..." : "Run Diagnostics"}
              </Button>
              <Button onClick={fixTable} disabled={fixLoading} variant="destructive">
                {fixLoading ? "Fixing Table..." : "Fix Reset Tokens Table"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {fixResult && (
              <Alert variant={fixResult.success ? "default" : "destructive"} className="mb-6">
                <AlertTitle>{fixResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {fixResult.message}
                  {fixResult.error && (
                    <div className="mt-2">
                      <strong>Error details:</strong> {fixResult.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {diagnostics && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Diagnostic Results</h3>

                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Basic Connection</h4>
                  <div className="pl-4">
                    <p>Status: {diagnostics.tests.basicConnection?.success ? "✅ Connected" : "❌ Failed"}</p>
                    {diagnostics.tests.basicConnection?.timestamp && (
                      <p>Server time: {diagnostics.tests.basicConnection.timestamp}</p>
                    )}
                    {diagnostics.tests.basicConnection?.error && (
                      <p className="text-red-500">Error: {diagnostics.tests.basicConnection.error}</p>
                    )}
                  </div>
                </div>

                {diagnostics.tests.databaseVersion && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Database Version</h4>
                    <div className="pl-4">
                      <p>{diagnostics.tests.databaseVersion.version}</p>
                    </div>
                  </div>
                )}

                {diagnostics.tests.schemaPermissions && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Schema Permissions</h4>
                    <div className="pl-4">
                      <p>
                        Can create tables:{" "}
                        {diagnostics.tests.schemaPermissions.permissions.can_create ? "✅ Yes" : "❌ No"}
                      </p>
                      <p>
                        Can use schema: {diagnostics.tests.schemaPermissions.permissions.can_use ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                  </div>
                )}

                {diagnostics.tests.tableExists && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Reset Tokens Table</h4>
                    <div className="pl-4">
                      <p>Table exists: {diagnostics.tests.tableExists.exists ? "✅ Yes" : "❌ No"}</p>
                    </div>
                  </div>
                )}

                {diagnostics.tests.tableStructure && diagnostics.tests.tableStructure.columns && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Table Structure</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b">Column</th>
                            <th className="py-2 px-4 border-b">Type</th>
                            <th className="py-2 px-4 border-b">Nullable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagnostics.tests.tableStructure.columns.map((col: any, i: number) => (
                            <tr key={i}>
                              <td className="py-2 px-4 border-b">{col.column_name}</td>
                              <td className="py-2 px-4 border-b">{col.data_type}</td>
                              <td className="py-2 px-4 border-b">{col.is_nullable === "YES" ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {diagnostics.tests.tableConstraints && diagnostics.tests.tableConstraints.constraints && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Table Constraints</h4>
                    {diagnostics.tests.tableConstraints.constraints.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr>
                              <th className="py-2 px-4 border-b">Constraint Name</th>
                              <th className="py-2 px-4 border-b">Type</th>
                              <th className="py-2 px-4 border-b">Column</th>
                              <th className="py-2 px-4 border-b">References</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnostics.tests.tableConstraints.constraints.map((constraint: any, i: number) => (
                              <tr key={i}>
                                <td className="py-2 px-4 border-b">{constraint.constraint_name}</td>
                                <td className="py-2 px-4 border-b">{constraint.constraint_type}</td>
                                <td className="py-2 px-4 border-b">{constraint.column_name}</td>
                                <td className="py-2 px-4 border-b">
                                  {constraint.foreign_table_name &&
                                    `${constraint.foreign_table_name}.${constraint.foreign_column_name}`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="pl-4">No constraints found</p>
                    )}
                  </div>
                )}

                {diagnostics.tests.createTablePermission && (
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Create Table Permission</h4>
                    <div className="pl-4">
                      <p>Status: {diagnostics.tests.createTablePermission.success ? "✅ Success" : "❌ Failed"}</p>
                      {diagnostics.tests.createTablePermission.error && (
                        <p className="text-red-500">Error: {diagnostics.tests.createTablePermission.error}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Fix Instructions</CardTitle>
            <CardDescription>If the automatic fix doesn't work, try these manual steps:</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check database connection settings in your environment variables</li>
              <li>Verify that the database user has sufficient permissions (CREATE TABLE, DROP TABLE)</li>
              <li>
                Run the following SQL query directly in your database:
                <pre className="bg-gray-800 text-white p-3 rounded mt-2 overflow-x-auto text-sm">
                  {`-- Drop the table with CASCADE to force drop any dependencies
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
                  
-- Create a simple table structure without foreign keys
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`}
                </pre>
              </li>
              <li>Restart your application server after making these changes</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
