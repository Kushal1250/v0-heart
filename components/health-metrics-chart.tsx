"use client"
import type { MetricReading, MetricDefinition, MetricType } from "@/app/health-metrics/page"
import { format, parseISO } from "date-fns"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface HealthMetricsChartProps {
  data: MetricReading[]
  metricType: MetricType
  metricDefinition: MetricDefinition
}

export function HealthMetricsChart({ data, metricType, metricDefinition }: HealthMetricsChartProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Format data for Chart.js
  const chartData = {
    labels: sortedData.map((item) => format(parseISO(item.timestamp), "MMM d")),
    datasets:
      metricType === "blood_pressure"
        ? [
            {
              label: "Systolic",
              data: sortedData.map((item) =>
                typeof item.value === "object" ? (item.value as { systolic: number }).systolic : 0,
              ),
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.3,
            },
            {
              label: "Diastolic",
              data: sortedData.map((item) =>
                typeof item.value === "object" ? (item.value as { diastolic: number }).diastolic : 0,
              ),
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.3,
            },
          ]
        : [
            {
              label: metricDefinition.name,
              data: sortedData.map((item) =>
                typeof item.value === "number"
                  ? item.value
                  : typeof item.value === "string"
                    ? Number.parseFloat(item.value)
                    : 0,
              ),
              borderColor: getColorForMetric(metricType),
              backgroundColor: getBackgroundColorForMetric(metricType),
              tension: 0.3,
            },
          ],
  }

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: metricDefinition.unit,
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${metricDefinition.name} Over Time`,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number
            return `${context.dataset.label}: ${value} ${metricDefinition.unit}`
          },
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}

// Helper function to get color for metric
function getColorForMetric(metricType: MetricType): string {
  switch (metricType) {
    case "blood_pressure":
      return "rgb(239, 68, 68)" // red
    case "heart_rate":
      return "rgb(236, 72, 153)" // pink
    case "weight":
      return "rgb(59, 130, 246)" // blue
    case "cholesterol":
      return "rgb(234, 179, 8)" // yellow
    case "blood_glucose":
      return "rgb(168, 85, 247)" // purple
    case "oxygen_saturation":
      return "rgb(6, 182, 212)" // cyan
    case "sleep":
      return "rgb(99, 102, 241)" // indigo
    case "steps":
      return "rgb(34, 197, 94)" // green
    case "water_intake":
      return "rgb(14, 165, 233)" // light blue
    default:
      return "rgb(107, 114, 128)" // gray
  }
}

// Helper function to get background color for metric
function getBackgroundColorForMetric(metricType: MetricType): string {
  switch (metricType) {
    case "blood_pressure":
      return "rgba(239, 68, 68, 0.1)" // red
    case "heart_rate":
      return "rgba(236, 72, 153, 0.1)" // pink
    case "weight":
      return "rgba(59, 130, 246, 0.1)" // blue
    case "cholesterol":
      return "rgba(234, 179, 8, 0.1)" // yellow
    case "blood_glucose":
      return "rgba(168, 85, 247, 0.1)" // purple
    case "oxygen_saturation":
      return "rgba(6, 182, 212, 0.1)" // cyan
    case "sleep":
      return "rgba(99, 102, 241, 0.1)" // indigo
    case "steps":
      return "rgba(34, 197, 94, 0.1)" // green
    case "water_intake":
      return "rgba(14, 165, 233, 0.1)" // light blue
    default:
      return "rgba(107, 114, 128, 0.1)" // gray
  }
}
