"use client"

import type { MetricReading, MetricDefinition, MetricType } from "@/app/health-metrics/page"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, AlertCircle, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HealthMetricsTableProps {
  data: MetricReading[]
  metricType: MetricType
  metricDefinition: MetricDefinition
  onDelete: (id: string) => void
}

export function HealthMetricsTable({ data, metricType, metricDefinition, onDelete }: HealthMetricsTableProps) {
  // Sort data by timestamp (newest first)
  const sortedData = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Function to format the value based on metric type
  const formatValue = (reading: MetricReading) => {
    if (metricType === "blood_pressure" && typeof reading.value === "object") {
      return `${reading.value.systolic}/${reading.value.diastolic} ${metricDefinition.unit}`
    } else {
      return `${reading.value} ${metricDefinition.unit}`
    }
  }

  // Function to determine if a value is within normal range
  const isWithinNormalRange = (reading: MetricReading) => {
    if (metricType === "blood_pressure" && typeof reading.value === "object") {
      const { systolic, diastolic } = reading.value
      return systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80
    } else if (typeof reading.value === "number") {
      switch (metricType) {
        case "heart_rate":
          return reading.value >= 60 && reading.value <= 100
        case "oxygen_saturation":
          return reading.value >= 95 && reading.value <= 100
        case "blood_glucose":
          return reading.value >= 70 && reading.value <= 99
        case "cholesterol":
          return reading.value < 200
        case "sleep":
          return reading.value >= 7 && reading.value <= 9
        case "steps":
          return reading.value >= 7000 && reading.value <= 10000
        case "water_intake":
          return reading.value >= 2000 && reading.value <= 3000
        default:
          return true
      }
    }
    return true
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of your {metricDefinition.name.toLowerCase()} readings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell>{format(parseISO(reading.timestamp), "MMM d, yyyy")}</TableCell>
              <TableCell>{format(parseISO(reading.timestamp), "h:mm a")}</TableCell>
              <TableCell className="font-medium">{formatValue(reading)}</TableCell>
              <TableCell>
                {isWithinNormalRange(reading) ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Normal
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" /> Attention
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{reading.notes || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(reading.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
