"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

type HealthMetric = {
  id: string
  userId: string
  type: string
  value: number
  unit: string
  date: string
  notes?: string
}

type HealthMetricsTableProps = {
  metrics?: HealthMetric[]
  title?: string
  description?: string
  className?: string
  onEdit?: (metric: HealthMetric) => void
  onDelete?: (id: string) => void
}

export function HealthMetricsTable({
  metrics = [],
  title = "Health Metrics History",
  description = "View and manage your recorded health metrics",
  className = "",
  onEdit,
  onDelete,
}: HealthMetricsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [metricType, setMetricType] = useState<string>("all")

  // Get unique metric types
  const metricTypes = ["all", ...new Set(metrics.map((metric) => metric.type))]

  // Filter metrics by type
  const filteredMetrics = metricType === "all" ? metrics : metrics.filter((metric) => metric.type === metricType)

  // Sort metrics by date (newest first)
  const sortedMetrics = [...filteredMetrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Pagination
  const totalPages = Math.ceil(sortedMetrics.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMetrics = sortedMetrics.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {metricTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All metrics" : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedMetrics.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMetrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium capitalize">{metric.type}</TableCell>
                      <TableCell>
                        {metric.value} {metric.unit}
                      </TableCell>
                      <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{metric.notes || "-"}</TableCell>
                      {(onEdit || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onEdit(metric)}
                                aria-label={`Edit ${metric.type} record`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onDelete(metric.id)}
                                aria-label={`Delete ${metric.type} record`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedMetrics.length)} of{" "}
                  {sortedMetrics.length}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No metrics found. {metricType !== "all" && "Try changing the filter or "}Add some metrics to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
