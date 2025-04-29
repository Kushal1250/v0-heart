import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, AlertTriangle, Activity, Utensils, Dumbbell, Brain } from "lucide-react"

interface HealthTipProps {
  riskLevel?: "low" | "moderate" | "high"
}

export function HeartHealthTips({ riskLevel = "moderate" }: HealthTipProps) {
  // Tips based on risk level
  const getTips = () => {
    const baseTips = [
      {
        title: "Maintain a Healthy Diet",
        description: "Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats.",
        icon: <Utensils className="h-5 w-5 text-green-500" />,
      },
      {
        title: "Regular Physical Activity",
        description: "Aim for at least 150 minutes of moderate exercise per week.",
        icon: <Dumbbell className="h-5 w-5 text-purple-500" />,
      },
      {
        title: "Manage Stress",
        description: "Practice relaxation techniques like deep breathing, meditation, or yoga.",
        icon: <Brain className="h-5 w-5 text-blue-500" />,
      },
    ]

    if (riskLevel === "moderate" || riskLevel === "high") {
      baseTips.push({
        title: "Monitor Blood Pressure",
        description: "Check your blood pressure regularly and keep it within healthy ranges.",
        icon: <Activity className="h-5 w-5 text-red-500" />,
      })
    }

    if (riskLevel === "high") {
      baseTips.push({
        title: "Medication Adherence",
        description: "Take all prescribed medications exactly as directed by your doctor.",
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      })
    }

    return baseTips
  }

  const tips = getTips()

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Heart className="mr-2 h-5 w-5 text-primary" />
          Key Heart Health Tips
        </CardTitle>
        <CardDescription>Essential practices to maintain heart health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">{tip.icon}</div>
              <div>
                <h4 className="font-medium">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
