"use client"

import { useState, useEffect } from "react"
import { Eye, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Prediction = {
  id: string
  user_id: string
  username: string
  risk_level: number
  timestamp: string
  prediction_data: any
}

type SortableColumn = "username" | "risk_level" | "timestamp" | "user_id"

export default function SortablePredictionsTable() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [sortColumn, setSortColumn] = useState<SortableColumn>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/predictions")
      if (!response.ok) {
        throw new Error("Failed to fetch predictions")
      }
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error fetching predictions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort column and default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const sortedPredictions = [...predictions].sort((a, b) => {
    let comparison = 0

    switch (sortColumn) {
      case "username":
        comparison = a.username.localeCompare(b.username)
        break
      case "risk_level":
        comparison = a.risk_level - b.risk_level
        break
      case "timestamp":
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        break
      case "user_id":
        comparison = a.user_id.localeCompare(b.user_id)
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const truncateId = (id: string) => {
    if (!id) return "N/A"
    return id.length > 8 ? `${id.substring(0, 8)}...` : id
  }

  const formatRiskLevel = (level: number) => {
    let color = "bg-green-500"
    if (level > 50) color = "bg-red-500"
    else if (level > 30) color = "bg-yellow-500"

    return <span className={`${color} text-white text-sm px-2 py-1 rounded-full`}>{level.toFixed(1)}% Risk</span>
  }

  if (loading) {
    return <div className="text-center py-8">Loading predictions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th
                className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center">
                  User
                  {getSortIcon("username")}
                </div>
              </th>
              <th
                className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort("risk_level")}
              >
                <div className="flex items-center">
                  Risk Level
                  {getSortIcon("risk_level")}
                </div>
              </th>
              <th
                className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort("timestamp")}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon("timestamp")}
                </div>
              </th>
              <th
                className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/80"
                onClick={() => handleSort("user_id")}
              >
                <div className="flex items-center">
                  User ID
                  {getSortIcon("user_id")}
                </div>
              </th>
              <th className="h-10 px-4 text-right align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPredictions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No predictions found
                </td>
              </tr>
            ) : (
              sortedPredictions.map((prediction) => (
                <tr key={prediction.id} className="border-b">
                  <td className="p-4">{prediction.username}</td>
                  <td className="p-4">{formatRiskLevel(prediction.risk_level)}</td>
                  <td className="p-4">{new Date(prediction.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded" title={prediction.user_id}>
                      {truncateId(prediction.user_id)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPrediction(prediction)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedPrediction} onOpenChange={(open) => !open && setSelectedPrediction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">User</h3>
                <p>{selectedPrediction.username}</p>
              </div>
              <div>
                <h3 className="font-medium">User ID</h3>
                <code className="block bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {selectedPrediction.user_id}
                </code>
              </div>
              <div>
                <h3 className="font-medium">Prediction ID</h3>
                <code className="block bg-gray-100 p-2 rounded text-sm overflow-x-auto">{selectedPrediction.id}</code>
              </div>
              <div>
                <h3 className="font-medium">Risk Level</h3>
                <p>{selectedPrediction.risk_level.toFixed(1)}%</p>
              </div>
              <div>
                <h3 className="font-medium">Date</h3>
                <p>{new Date(selectedPrediction.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium">Prediction Data</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedPrediction.prediction_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
