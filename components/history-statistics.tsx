import { Card, CardContent } from "@/components/ui/card"
import type { AssessmentHistoryItem } from "@/lib/history-storage"

interface HistoryStatisticsProps {
  history: AssessmentHistoryItem[]
}

export default function HistoryStatistics({ history }: HistoryStatisticsProps) {
  // Calculate statistics
  const totalAssessments = history.length

  // Calculate average risk score
  const averageRiskScore =
    history.length > 0 ? Math.round(history.reduce((sum, item) => sum + item.result.score, 0) / history.length) : 0

  // Calculate risk distribution
  const highRiskCount = history.filter((item) => item.result.risk === "high").length
  const moderateRiskCount = history.filter((item) => item.result.risk === "moderate").length
  const lowRiskCount = history.filter((item) => item.result.risk === "low").length

  // Calculate risk trend (simplified)
  const riskTrend = "Stable"

  // Calculate average health metrics
  const averageAge =
    history.length > 0 ? Math.round(history.reduce((sum, item) => sum + Number(item.age), 0) / history.length) : 0

  const averageBP =
    history.length > 0 ? Math.round(history.reduce((sum, item) => sum + Number(item.trestbps), 0) / history.length) : 0

  const averageChol =
    history.length > 0 ? Math.round(history.reduce((sum, item) => sum + Number(item.chol), 0) / history.length) : 0

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v12h10V5H5z"
            clipRule="evenodd"
          />
          <path d="M15 7H5v2h10V7zM15 11H5v2h10v-2z" />
        </svg>
        Assessment Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Total Assessments</p>
            <p className="text-3xl font-bold text-blue-500">{totalAssessments}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Average Risk Score</p>
            <p className="text-3xl font-bold text-blue-500">{averageRiskScore}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Risk Trend</p>
            <p className="text-3xl font-bold text-blue-500">— {riskTrend}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Risk Distribution</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-1"></span>
                <span className="text-sm">{highRiskCount}</span>
              </span>
              <span className="inline-flex items-center">
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></span>
                <span className="text-sm">{moderateRiskCount}</span>
              </span>
              <span className="inline-flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                <span className="text-sm">{lowRiskCount}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Average Health Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Age</p>
            <p className="text-3xl font-bold text-blue-500">{averageAge} years</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Blood Pressure</p>
            <p className="text-3xl font-bold text-blue-500">{averageBP} mm Hg</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <p className="text-gray-400 mb-1">Cholesterol</p>
            <p className="text-3xl font-bold text-blue-500">{averageChol} mg/dl</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
