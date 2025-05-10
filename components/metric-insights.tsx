"use client"

import type { MetricReading, MetricDefinition, MetricType } from "@/app/health-metrics/page"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, CheckCircle, Info, Calendar, Clock, Activity } from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"

interface MetricInsightsProps {
  data: MetricReading[]
  metricType: MetricType
  metricDefinition: MetricDefinition
}

export function MetricInsights({ data, metricType, metricDefinition }: MetricInsightsProps) {
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Get latest reading
  const latestReading = sortedData[sortedData.length - 1]

  // Get earliest reading
  const earliestReading = sortedData[0]

  // Calculate average
  const calculateAverage = () => {
    if (metricType === "blood_pressure") {
      const systolicSum = sortedData.reduce(
        (sum, item) => sum + (typeof item.value === "object" ? (item.value as { systolic: number }).systolic : 0),
        0,
      )
      const diastolicSum = sortedData.reduce(
        (sum, item) => sum + (typeof item.value === "object" ? (item.value as { diastolic: number }).diastolic : 0),
        0,
      )
      return {
        systolic: Math.round(systolicSum / sortedData.length),
        diastolic: Math.round(diastolicSum / sortedData.length),
      }
    } else {
      const sum = sortedData.reduce(
        (sum, item) =>
          sum +
          (typeof item.value === "number"
            ? item.value
            : typeof item.value === "string"
              ? Number.parseFloat(item.value)
              : 0),
        0,
      )
      return Math.round((sum / sortedData.length) * 10) / 10
    }
  }

  // Calculate trend
  const calculateTrend = () => {
    if (sortedData.length < 2) return "stable"

    if (metricType === "blood_pressure") {
      const firstSystolic =
        typeof sortedData[0].value === "object" ? (sortedData[0].value as { systolic: number }).systolic : 0
      const lastSystolic =
        typeof sortedData[sortedData.length - 1].value === "object"
          ? (sortedData[sortedData.length - 1].value as { systolic: number }).systolic
          : 0

      const systolicDiff = lastSystolic - firstSystolic

      if (Math.abs(systolicDiff) < 5) return "stable"
      return systolicDiff > 0 ? "increasing" : "decreasing"
    } else {
      const firstValue =
        typeof sortedData[0].value === "number"
          ? sortedData[0].value
          : typeof sortedData[0].value === "string"
            ? Number.parseFloat(sortedData[0].value)
            : 0
      const lastValue =
        typeof sortedData[sortedData.length - 1].value === "number"
          ? sortedData[sortedData.length - 1].value
          : typeof sortedData[sortedData.length - 1].value === "string"
            ? Number.parseFloat(sortedData[sortedData.length - 1].value)
            : 0

      const diff = lastValue - firstValue
      const threshold = getThresholdForMetric(metricType)

      if (Math.abs(diff) < threshold) return "stable"
      return diff > 0 ? "increasing" : "decreasing"
    }
  }

  // Get trend icon
  const getTrendIcon = () => {
    const trend = calculateTrend()
    if (trend === "increasing") return <TrendingUp className="h-5 w-5 text-amber-500" />
    if (trend === "decreasing") return <TrendingDown className="h-5 w-5 text-green-500" />
    return <Minus className="h-5 w-5 text-gray-500" />
  }

  // Get trend description
  const getTrendDescription = () => {
    const trend = calculateTrend()

    if (metricType === "blood_pressure") {
      if (trend === "increasing")
        return "Your blood pressure has been trending upward. Consider consulting with your healthcare provider."
      if (trend === "decreasing")
        return "Your blood pressure has been trending downward, which may be a positive sign if it was previously elevated."
      return "Your blood pressure has remained relatively stable."
    } else {
      switch (metricType) {
        case "heart_rate":
          if (trend === "increasing")
            return "Your heart rate has been trending upward. This could be due to increased activity, stress, or other factors."
          if (trend === "decreasing")
            return "Your heart rate has been trending downward, which may indicate improved cardiovascular fitness."
          return "Your heart rate has remained relatively stable."

        case "weight":
          if (trend === "increasing")
            return "Your weight has been trending upward. Consider reviewing your diet and exercise habits."
          if (trend === "decreasing")
            return "Your weight has been trending downward. If this is intentional, great job!"
          return "Your weight has remained relatively stable."

        case "cholesterol":
          if (trend === "increasing")
            return "Your cholesterol has been trending upward. Consider consulting with your healthcare provider."
          if (trend === "decreasing")
            return "Your cholesterol has been trending downward, which is generally a positive sign."
          return "Your cholesterol has remained relatively stable."

        case "blood_glucose":
          if (trend === "increasing")
            return "Your blood glucose has been trending upward. Consider reviewing your diet and consulting with your healthcare provider."
          if (trend === "decreasing")
            return "Your blood glucose has been trending downward, which may be a positive sign if it was previously elevated."
          return "Your blood glucose has remained relatively stable."

        case "oxygen_saturation":
          if (trend === "increasing")
            return "Your oxygen saturation has been trending upward, which is generally a positive sign."
          if (trend === "decreasing")
            return "Your oxygen saturation has been trending downward. If it drops below 95%, consider consulting with your healthcare provider."
          return "Your oxygen saturation has remained relatively stable."

        case "sleep":
          if (trend === "increasing")
            return "Your sleep duration has been trending upward, which may contribute to better overall health."
          if (trend === "decreasing")
            return "Your sleep duration has been trending downward. Aim for 7-9 hours of sleep per night."
          return "Your sleep duration has remained relatively stable."

        case "steps":
          if (trend === "increasing")
            return "Your daily steps have been trending upward, which is great for your cardiovascular health."
          if (trend === "decreasing")
            return "Your daily steps have been trending downward. Try to incorporate more walking into your daily routine."
          return "Your daily steps have remained relatively stable."

        case "water_intake":
          if (trend === "increasing")
            return "Your water intake has been trending upward, which is great for your overall health."
          if (trend === "decreasing")
            return "Your water intake has been trending downward. Aim for at least 2000ml of water per day."
          return "Your water intake has remained relatively stable."

        default:
          return "Your measurements have remained relatively stable."
      }
    }
  }

  // Format the value for display
  const formatValue = (reading: MetricReading) => {
    if (metricType === "blood_pressure" && typeof reading.value === "object") {
      return `${reading.value.systolic}/${reading.value.diastolic} ${metricDefinition.unit}`
    } else {
      return `${reading.value} ${metricDefinition.unit}`
    }
  }

  // Calculate tracking consistency
  const calculateConsistency = () => {
    if (sortedData.length < 2) return "Not enough data"

    const firstDate = new Date(sortedData[0].timestamp)
    const lastDate = new Date(sortedData[sortedData.length - 1].timestamp)
    const daysBetween = differenceInDays(lastDate, firstDate)

    if (daysBetween === 0) return "Not enough data"

    const entriesPerDay = sortedData.length / daysBetween

    if (entriesPerDay >= 0.9) return "Excellent"
    if (entriesPerDay >= 0.7) return "Good"
    if (entriesPerDay >= 0.5) return "Fair"
    return "Needs improvement"
  }

  // Get health status
  const getHealthStatus = () => {
    if (metricType === "blood_pressure" && typeof latestReading.value === "object") {
      const { systolic, diastolic } = latestReading.value

      if (systolic < 90 || diastolic < 60) return "Low"
      if (systolic <= 120 && diastolic <= 80) return "Normal"
      if (systolic <= 129 && diastolic <= 80) return "Elevated"
      if (systolic <= 139 || diastolic <= 89) return "Stage 1 Hypertension"
      return "Stage 2 Hypertension"
    } else if (typeof latestReading.value === "number" || typeof latestReading.value === "string") {
      const value =
        typeof latestReading.value === "number" ? latestReading.value : Number.parseFloat(latestReading.value)

      switch (metricType) {
        case "heart_rate":
          if (value < 60) return "Low"
          if (value <= 100) return "Normal"
          return "Elevated"

        case "oxygen_saturation":
          if (value < 90) return "Low - Medical attention needed"
          if (value < 95) return "Below normal"
          return "Normal"

        case "blood_glucose":
          if (value < 70) return "Low"
          if (value <= 99) return "Normal"
          if (value <= 125) return "Prediabetes"
          return "Diabetes range"

        case "cholesterol":
          if (value < 200) return "Desirable"
          if (value <= 239) return "Borderline high"
          return "High"

        case "sleep":
          if (value < 7) return "Below recommended"
          if (value <= 9) return "Recommended"
          return "Above recommended"

        case "steps":
          if (value < 5000) return "Sedentary"
          if (value < 7500) return "Low active"
          if (value < 10000) return "Somewhat active"
          if (value < 12500) return "Active"
          return "Highly active"

        case "water_intake":
          if (value < 1500) return "Below recommended"
          if (value <= 3000) return "Recommended"
          return "Above recommended"

        default:
          return "Normal"
      }
    }

    return "Unknown"
  }

  // Get health status color
  const getHealthStatusColor = () => {
    const status = getHealthStatus()

    if (
      status.includes("Low") ||
      status.includes("Below") ||
      status.includes("Stage") ||
      status.includes("High") ||
      status.includes("Diabetes")
    ) {
      return "text-red-500"
    }

    if (
      status.includes("Elevated") ||
      status.includes("Borderline") ||
      status.includes("Prediabetes") ||
      status.includes("Sedentary")
    ) {
      return "text-amber-500"
    }

    return "text-green-500"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Reading */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-lg font-medium">Latest Reading</h3>
              <p className="text-2xl font-bold mt-2">{formatValue(latestReading)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(parseISO(latestReading.timestamp), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-lg font-medium">Average</h3>
              {metricType === "blood_pressure" ? (
                <p className="text-2xl font-bold mt-2">
                  {(calculateAverage() as { systolic: number; diastolic: number }).systolic}/
                  {(calculateAverage() as { systolic: number; diastolic: number }).diastolic} {metricDefinition.unit}
                </p>
              ) : (
                <p className="text-2xl font-bold mt-2">
                  {calculateAverage()} {metricDefinition.unit}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">Based on {sortedData.length} readings</p>
            </div>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-lg font-medium">Health Status</h3>
              <p className={`text-2xl font-bold mt-2 ${getHealthStatusColor()}`}>{getHealthStatus()}</p>
              <p className="text-sm text-muted-foreground mt-1">Based on your latest reading</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">{getTrendIcon()}</div>
            <div>
              <h3 className="text-lg font-medium">Trend Analysis</h3>
              <p className="text-muted-foreground mt-1">{getTrendDescription()}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">First Reading</h4>
                  <p className="mt-1">{formatValue(earliestReading)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(earliestReading.timestamp), "MMM d, yyyy")}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Latest Reading</h4>
                  <p className="mt-1">{formatValue(latestReading)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(latestReading.timestamp), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Consistency */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Tracking Consistency</h3>
              <p className="text-muted-foreground mt-1">
                Your consistency in tracking this metric is: <strong>{calculateConsistency()}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Regular tracking helps provide more accurate insights and trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 mt-2">
                {getRecommendationsForMetric(metricType, getHealthStatus()).map((rec, index) => (
                  <li key={index} className="text-muted-foreground">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get threshold for determining trend
function getThresholdForMetric(metricType: MetricType): number {
  switch (metricType) {
    case "heart_rate":
      return 5
    case "weight":
      return 1
    case "cholesterol":
      return 10
    case "blood_glucose":
      return 5
    case "oxygen_saturation":
      return 1
    case "sleep":
      return 0.5
    case "steps":
      return 1000
    case "water_intake":
      return 200
    default:
      return 5
  }
}

// Helper function to get recommendations based on metric type and health status
function getRecommendationsForMetric(metricType: MetricType, healthStatus: string): string[] {
  switch (metricType) {
    case "blood_pressure":
      if (healthStatus.includes("Low")) {
        return [
          "Stay hydrated and drink plenty of fluids.",
          "Eat small, frequent meals to prevent blood sugar drops.",
          "Avoid standing for long periods and rise slowly from sitting or lying down.",
          "Consult with your healthcare provider if you experience dizziness or fainting.",
        ]
      } else if (healthStatus.includes("Stage") || healthStatus.includes("Elevated")) {
        return [
          "Reduce sodium intake to less than 2,300mg per day.",
          "Engage in regular physical activity (at least 150 minutes per week).",
          "Maintain a healthy weight or lose weight if overweight.",
          "Limit alcohol consumption and avoid tobacco products.",
          "Consider the DASH diet (Dietary Approaches to Stop Hypertension).",
          "Manage stress through meditation, yoga, or other relaxation techniques.",
          "Take medications as prescribed by your healthcare provider.",
        ]
      } else {
        return [
          "Continue maintaining a healthy lifestyle with regular exercise.",
          "Eat a balanced diet rich in fruits, vegetables, and whole grains.",
          "Limit sodium intake and processed foods.",
          "Monitor your blood pressure regularly to ensure it stays within normal range.",
        ]
      }

    case "heart_rate":
      if (healthStatus.includes("Low")) {
        return [
          "Consult with your healthcare provider, especially if you experience symptoms.",
          "Stay hydrated throughout the day.",
          "Consider whether any medications you're taking might be affecting your heart rate.",
          "Gradually increase physical activity under medical supervision.",
        ]
      } else if (healthStatus.includes("Elevated")) {
        return [
          "Practice relaxation techniques such as deep breathing or meditation.",
          "Limit caffeine and alcohol consumption.",
          "Ensure you're getting adequate sleep.",
          "Stay hydrated and maintain a balanced diet.",
          "Consult with your healthcare provider if your heart rate is consistently elevated.",
        ]
      } else {
        return [
          "Continue with regular physical activity to maintain cardiovascular health.",
          "Stay hydrated and maintain a balanced diet.",
          "Monitor your heart rate during exercise to ensure you're training at an appropriate intensity.",
          "Consider tracking your resting heart rate over time as an indicator of cardiovascular fitness.",
        ]
      }

    case "weight":
      if (healthStatus.includes("Below")) {
        return [
          "Consult with a healthcare provider to rule out underlying medical conditions.",
          "Increase caloric intake with nutrient-dense foods.",
          "Include healthy fats like avocados, nuts, and olive oil in your diet.",
          "Consider strength training to build muscle mass.",
          "Eat smaller, more frequent meals throughout the day.",
        ]
      } else if (healthStatus.includes("Above")) {
        return [
          "Focus on a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.",
          "Aim for 150-300 minutes of moderate-intensity physical activity per week.",
          "Practice portion control and mindful eating.",
          "Stay hydrated and limit sugary beverages.",
          "Consider working with a registered dietitian for personalized guidance.",
        ]
      } else {
        return [
          "Maintain your current healthy habits.",
          "Continue with regular physical activity.",
          "Focus on nutrient-dense foods to support overall health.",
          "Monitor your weight regularly to detect any significant changes.",
        ]
      }

    case "cholesterol":
      if (healthStatus.includes("High") || healthStatus.includes("Borderline")) {
        return [
          "Limit saturated and trans fats in your diet.",
          "Increase intake of soluble fiber from foods like oats, beans, and fruits.",
          "Include plant sterols and stanols found in certain margarines and supplements.",
          "Engage in regular physical activity for at least 30 minutes most days.",
          "Maintain a healthy weight or lose weight if overweight.",
          "Limit alcohol consumption and avoid tobacco products.",
          "Consider medications as prescribed by your healthcare provider.",
        ]
      } else {
        return [
          "Continue with heart-healthy eating patterns.",
          "Maintain regular physical activity.",
          "Limit processed foods and added sugars.",
          "Get regular cholesterol screenings as recommended by your healthcare provider.",
        ]
      }

    case "blood_glucose":
      if (healthStatus.includes("Low")) {
        return [
          "Consume 15-20 grams of fast-acting carbohydrates if experiencing symptoms.",
          "Eat regular, balanced meals and snacks throughout the day.",
          "Monitor blood glucose levels regularly, especially if you have diabetes.",
          "Consult with your healthcare provider about adjusting medications if applicable.",
        ]
      } else if (healthStatus.includes("Prediabetes") || healthStatus.includes("Diabetes")) {
        return [
          "Focus on a balanced diet with controlled carbohydrate intake.",
          "Engage in regular physical activity for at least 150 minutes per week.",
          "Maintain a healthy weight or lose weight if overweight.",
          "Monitor blood glucose levels as recommended by your healthcare provider.",
          "Take medications as prescribed.",
          "Schedule regular check-ups with your healthcare team.",
        ]
      } else {
        return [
          "Maintain a balanced diet with limited added sugars.",
          "Engage in regular physical activity.",
          "Maintain a healthy weight.",
          "Consider periodic blood glucose screening, especially if you have risk factors for diabetes.",
        ]
      }

    case "oxygen_saturation":
      if (healthStatus.includes("Low") || healthStatus.includes("Below")) {
        return [
          "Seek immediate medical attention if oxygen saturation is below 90%.",
          "Practice deep breathing exercises to improve lung function.",
          "Maintain good posture to optimize breathing mechanics.",
          "Avoid smoking and secondhand smoke.",
          "Follow treatment plans for any underlying respiratory conditions.",
        ]
      } else {
        return [
          "Continue monitoring oxygen saturation, especially if you have respiratory conditions.",
          "Practice regular deep breathing exercises.",
          "Stay physically active to maintain lung function.",
          "Avoid smoking and air pollutants.",
        ]
      }

    case "sleep":
      if (healthStatus.includes("Below")) {
        return [
          "Establish a consistent sleep schedule, even on weekends.",
          "Create a relaxing bedtime routine.",
          "Ensure your sleep environment is dark, quiet, and cool.",
          "Limit screen time before bed.",
          "Avoid caffeine and large meals close to bedtime.",
          "Consider relaxation techniques such as meditation or deep breathing.",
        ]
      } else if (healthStatus.includes("Above")) {
        return [
          "Excessive sleep can sometimes indicate underlying health issues. Consider consulting with a healthcare provider.",
          "Ensure you're getting quality sleep rather than just quantity.",
          "Maintain a consistent sleep schedule.",
          "Stay physically active during the day.",
        ]
      } else {
        return [
          "Continue maintaining your healthy sleep habits.",
          "Prioritize sleep consistency over occasional late nights.",
          "Monitor how you feel during the day as an indicator of sleep quality.",
          "Adjust your sleep environment as needed for optimal rest.",
        ]
      }

    case "steps":
      if (healthStatus.includes("Sedentary") || healthStatus.includes("Low")) {
        return [
          "Gradually increase your daily step count by 1,000 steps every 1-2 weeks.",
          "Incorporate short walks throughout the day, such as after meals.",
          "Park farther away from entrances when shopping or at work.",
          "Take the stairs instead of elevators when possible.",
          "Set reminders to stand up and move every hour.",
        ]
      } else if (healthStatus.includes("Highly")) {
        return [
          "Ensure you're balancing activity with adequate rest and recovery.",
          "Focus on proper footwear and walking form to prevent injuries.",
          "Stay well-hydrated, especially during longer walks or activities.",
          "Consider incorporating strength training to complement your cardiovascular fitness.",
        ]
      } else {
        return [
          "Maintain your current activity level for optimal health benefits.",
          "Add variety to your walking routine to keep it engaging.",
          "Consider setting new goals, such as increasing intensity or adding hills.",
          "Track other metrics like active minutes or distance for a more complete picture.",
        ]
      }

    case "water_intake":
      if (healthStatus.includes("Below")) {
        return [
          "Carry a reusable water bottle with you throughout the day.",
          "Set reminders to drink water regularly.",
          "Flavor water with fruits or herbs if you find plain water unappealing.",
          "Eat water-rich foods like fruits and vegetables.",
          "Drink a glass of water before each meal.",
        ]
      } else if (healthStatus.includes("Above")) {
        return [
          "While good hydration is important, excessive water intake can sometimes dilute electrolytes.",
          "Ensure you're replacing electrolytes if you're very active or sweating a lot.",
          "Monitor the color of your urine—pale yellow indicates good hydration.",
          "Adjust intake based on activity level, climate, and individual needs.",
        ]
      } else {
        return [
          "Continue your good hydration habits.",
          "Adjust intake based on activity level and climate.",
          "Remember that other beverages and water-rich foods contribute to hydration.",
          "Monitor urine color as an indicator of hydration status.",
        ]
      }

    default:
      return [
        "Maintain a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.",
        "Engage in regular physical activity for at least 150 minutes per week.",
        "Get 7-9 hours of quality sleep each night.",
        "Manage stress through techniques like meditation, deep breathing, or yoga.",
        "Stay hydrated by drinking plenty of water throughout the day.",
        "Limit alcohol consumption and avoid tobacco products.",
        "Schedule regular check-ups with your healthcare provider.",
      ]
  }
}
