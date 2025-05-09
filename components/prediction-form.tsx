"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Helper function to get current user email
const getCurrentUserEmail = () => {
  try {
    // Try to get from localStorage first
    const email = localStorage.getItem("currentUserEmail")
    if (email) return email

    // If not found, check if we have a user object
    const userJson = localStorage.getItem("user")
    if (userJson) {
      const user = JSON.parse(userJson)
      if (user.email) return user.email
    }

    // Default fallback email if needed
    return "guest@example.com"
  } catch (e) {
    console.error("Error getting user email:", e)
    return "guest@example.com"
  }
}

// Save current email to localStorage for future reference
const saveCurrentEmail = (email) => {
  try {
    localStorage.setItem("currentUserEmail", email)
  } catch (e) {
    console.error("Error saving email:", e)
  }
}

export function PredictionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    cp: "0",
    trestbps: "",
    chol: "",
    fbs: "0",
    restecg: "0",
    thalach: "",
    exang: "0",
    oldpeak: "0",
    slope: "0",
    ca: "0",
    thal: "0",
    foodHabits: "mixed",
    junkFoodConsumption: "moderate",
    sleepingHours: "7",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const isMobile = useMediaQuery("(max-width: 640px)")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Get current user email
      const userEmail = getCurrentUserEmail()

      // Save email for future reference
      saveCurrentEmail(userEmail)

      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        userEmail,
      }

      // Submit to API
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit data")
      }

      const result = await response.json()

      // Store result in localStorage to access in results page
      localStorage.setItem(
        "predictionResult",
        JSON.stringify({
          ...formData,
          result: result.prediction,
        }),
      )

      // Also store in assessment history
      try {
        const assessmentHistory = JSON.parse(localStorage.getItem(`assessmentHistory_${userEmail}`) || "[]")
        assessmentHistory.push({
          ...formData,
          result: result.prediction,
          timestamp: new Date().toISOString(),
        })
        localStorage.setItem(`assessmentHistory_${userEmail}`, JSON.stringify(assessmentHistory))
      } catch (storageError) {
        console.error("Error saving to history:", storageError)
      }

      // Navigate to results page
      router.push("/predict/results")
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error instanceof Error ? error.message : "Failed to process prediction. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white border-gray-200 w-full max-w-full sm:max-w-3xl mx-auto">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl text-gray-900">Heart Health Assessment</CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600">
          Enter your health information to get a heart disease risk assessment
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-4 sm:px-6">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="age">Age</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your current age in years</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleInputChange}
                required
                className="bg-white border-gray-300 h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sex">Gender</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Biological sex is an important factor in heart disease risk</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                name="sex"
                value={formData.sex}
                onValueChange={(value) => handleSelectChange("sex", value)}
                required
              >
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Male</SelectItem>
                  <SelectItem value="0">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="trestbps">Blood Pressure (mm Hg)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your resting blood pressure in mm Hg</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="trestbps"
                name="trestbps"
                type="number"
                placeholder="e.g., 120"
                value={formData.trestbps}
                onChange={handleInputChange}
                required
                className="bg-white border-gray-300 h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="chol">Cholesterol (mg/dl)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your serum cholesterol level in mg/dl</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="chol"
                name="chol"
                type="number"
                placeholder="e.g., 200"
                value={formData.chol}
                onChange={handleInputChange}
                required
                className="bg-white border-gray-300 h-11 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cp">Chest Pain Type</Label>
              <Select name="cp" value={formData.cp} onValueChange={(value) => handleSelectChange("cp", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Typical angina</SelectItem>
                  <SelectItem value="1">Atypical angina</SelectItem>
                  <SelectItem value="2">Non-anginal pain</SelectItem>
                  <SelectItem value="3">Asymptomatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fbs">Fasting Blood Sugar &gt; 120 mg/dl</Label>
              <Select name="fbs" value={formData.fbs} onValueChange={(value) => handleSelectChange("fbs", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="restecg">Resting ECG Results</Label>
              <Select
                name="restecg"
                value={formData.restecg}
                onValueChange={(value) => handleSelectChange("restecg", value)}
              >
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">ST-T wave abnormality</SelectItem>
                  <SelectItem value="2">Left ventricular hypertrophy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="thalach">Maximum Heart Rate</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum heart rate achieved during exercise</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="thalach"
                name="thalach"
                type="number"
                placeholder="e.g., 150"
                value={formData.thalach}
                onChange={handleInputChange}
                required
                className="bg-white border-gray-300 h-11 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exang">Exercise Induced Angina</Label>
              <Select name="exang" value={formData.exang} onValueChange={(value) => handleSelectChange("exang", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Yes</SelectItem>
                  <SelectItem value="0">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldpeak">ST Depression Induced by Exercise</Label>
              <Input
                id="oldpeak"
                name="oldpeak"
                type="number"
                step="0.1"
                placeholder="e.g., 1.0"
                value={formData.oldpeak}
                onChange={handleInputChange}
                className="bg-white border-gray-300 h-11 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slope">Slope of Peak Exercise ST Segment</Label>
              <Select name="slope" value={formData.slope} onValueChange={(value) => handleSelectChange("slope", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select slope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Upsloping</SelectItem>
                  <SelectItem value="1">Flat</SelectItem>
                  <SelectItem value="2">Downsloping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ca">Number of Major Vessels</Label>
              <Select name="ca" value={formData.ca} onValueChange={(value) => handleSelectChange("ca", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thal">Thalassemia</Label>
              <Select name="thal" value={formData.thal} onValueChange={(value) => handleSelectChange("thal", value)}>
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Fixed defect</SelectItem>
                  <SelectItem value="2">Reversible defect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foodHabits">Food Habits</Label>
              <Select
                name="foodHabits"
                value={formData.foodHabits}
                onValueChange={(value) => handleSelectChange("foodHabits", value)}
              >
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select food habits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="mixed">Mixed Diet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="junkFoodConsumption">Junk Food Consumption</Label>
              <Select
                name="junkFoodConsumption"
                value={formData.junkFoodConsumption}
                onValueChange={(value) => handleSelectChange("junkFoodConsumption", value)}
              >
                <SelectTrigger className="bg-white border-gray-300 h-11">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (rarely)</SelectItem>
                  <SelectItem value="moderate">Moderate (weekly)</SelectItem>
                  <SelectItem value="high">High (daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleepingHours">Average Sleeping Hours</Label>
            <Select
              name="sleepingHours"
              value={formData.sleepingHours}
              onValueChange={(value) => handleSelectChange("sleepingHours", value)}
            >
              <SelectTrigger className="bg-white border-gray-300 h-11">
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Less than 6 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="7">7 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="9">More than 8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="px-4 sm:px-6 pb-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-medium"
          >
            {isSubmitting ? "Processing..." : "Get Assessment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
