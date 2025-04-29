"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon as InfoCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getCurrentUserEmail } from "@/lib/user-specific-storage"

// Helper component for form fields with tooltips
const FormField = ({
  id,
  label,
  tooltip,
  children,
  isMobile,
}: {
  id: string
  label: string
  tooltip: string
  children: React.ReactNode
  isMobile: boolean
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className={isMobile ? "text-base" : ""}>
        {label}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoCircle className="h-4 w-4 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
  </div>
)

export function PredictionForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const [formData, setFormData] = useState({
    // Basic info
    age: "",
    sex: "",
    trestbps: "", // Blood pressure
    chol: "", // Cholesterol

    // Advanced parameters
    cp: "0", // Chest pain type (0-3)
    fbs: "0", // Fasting blood sugar
    restecg: "0", // Resting ECG
    thalach: "", // Max heart rate
    exang: "0", // Exercise induced angina
    oldpeak: "0", // ST depression
    slope: "0", // Slope of ST segment
    ca: "0", // Number of major vessels
    thal: "0", // Thalassemia

    // Lifestyle parameters
    foodHabits: "mixed", // Food habits (vegetarian, non-vegetarian, mixed)
    junkFoodConsumption: "moderate", // Junk food consumption (low, moderate, high)
    sleepingHours: "", // Sleeping hours per day
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Update the handleSubmit function to validate all required fields before submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.age || !formData.sex || !formData.trestbps || !formData.chol) {
      alert("Please fill in all required fields in the Basic Information tab")
      setActiveTab("basic")
      return
    }

    // Get the current user email
    const userEmail = getCurrentUserEmail()

    setLoading(true)

    try {
      // Prepare form data
      const formDataToSend = {
        ...formData,

        // Add user email if available
        userEmail: userEmail || null,
      }

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSend),
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

      // Navigate to results page
      router.push("/predict/results")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Failed to process prediction. Please try again."}`)
    } finally {
      setLoading(false)
    }
  }

  // Remove this line
  //const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl">Health Assessment Form</CardTitle>
        <p className="text-gray-400">Enter your health metrics below for a personalized heart risk assessment.</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 tabs-list">
            <TabsTrigger value="basic" className={`tabs-trigger ${isMobile ? "py-3" : ""}`}>
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="advanced" className={`tabs-trigger ${isMobile ? "py-3" : ""}`}>
              Advanced Parameters
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className={`tabs-trigger ${isMobile ? "py-3" : ""}`}>
              Lifestyle Factors
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="basic" className="space-y-6 mobile-section-spacing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="age"
                  label="Age"
                  tooltip="Your current age in years. Age is a significant factor in heart disease risk assessment."
                  isMobile={isMobile}
                >
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>

                <FormField
                  id="sex"
                  label="Sex"
                  tooltip="Biological sex is an important factor as heart disease risk profiles differ between males and females."
                  isMobile={isMobile}
                >
                  <Select value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)} required>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="0">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="trestbps"
                  label="Blood Pressure"
                  tooltip="Your resting blood pressure in mm Hg. High blood pressure is a key risk factor for heart disease."
                  isMobile={isMobile}
                >
                  <Input
                    id="trestbps"
                    name="trestbps"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter blood pressure"
                    value={formData.trestbps}
                    onChange={handleChange}
                    required
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>

                <FormField
                  id="chol"
                  label="Cholesterol"
                  tooltip="Your serum cholesterol level in mg/dl. High cholesterol can lead to plaque buildup in arteries."
                  isMobile={isMobile}
                >
                  <Input
                    id="chol"
                    name="chol"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter cholesterol level"
                    value={formData.chol}
                    onChange={handleChange}
                    required
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>
              </div>

              <div className="flex justify-between">
                <div></div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("advanced")}
                  className={`bg-gray-700 hover:bg-gray-600 ${isMobile ? "h-12 text-base w-full" : ""}`}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mobile-section-spacing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="cp"
                  label="Chest Pain Type"
                  tooltip="0: Typical angina, 1: Atypical angina, 2: Non-anginal pain, 3: Asymptomatic"
                  isMobile={isMobile}
                >
                  <Select value={formData.cp} onValueChange={(value) => handleSelectChange("cp", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Typical angina</SelectItem>
                      <SelectItem value="1">Atypical angina</SelectItem>
                      <SelectItem value="2">Non-anginal pain</SelectItem>
                      <SelectItem value="3">Asymptomatic</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="fbs"
                  label="Fasting Blood Sugar"
                  tooltip="Fasting blood sugar > 120 mg/dl"
                  isMobile={isMobile}
                >
                  <Select value={formData.fbs} onValueChange={(value) => handleSelectChange("fbs", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">≤ 120 mg/dl</SelectItem>
                      <SelectItem value="1">&gt; 120 mg/dl</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="restecg"
                  label="Resting ECG Results"
                  tooltip="0: Normal, 1: ST-T wave abnormality, 2: Left ventricular hypertrophy"
                  isMobile={isMobile}
                >
                  <Select value={formData.restecg} onValueChange={(value) => handleSelectChange("restecg", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal</SelectItem>
                      <SelectItem value="1">ST-T wave abnormality</SelectItem>
                      <SelectItem value="2">Left ventricular hypertrophy</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="thalach"
                  label="Maximum Heart Rate"
                  tooltip="Maximum heart rate achieved during exercise"
                  isMobile={isMobile}
                >
                  <Input
                    id="thalach"
                    name="thalach"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter maximum heart rate"
                    value={formData.thalach}
                    onChange={handleChange}
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>

                <FormField
                  id="exang"
                  label="Exercise Induced Angina"
                  tooltip="Chest pain during exercise"
                  isMobile={isMobile}
                >
                  <Select value={formData.exang} onValueChange={(value) => handleSelectChange("exang", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="oldpeak"
                  label="ST Depression"
                  tooltip="ST depression induced by exercise relative to rest"
                  isMobile={isMobile}
                >
                  <Input
                    id="oldpeak"
                    name="oldpeak"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="Enter ST depression"
                    value={formData.oldpeak}
                    onChange={handleChange}
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>

                <FormField
                  id="slope"
                  label="Slope of ST Segment"
                  tooltip="0: Upsloping, 1: Flat, 2: Downsloping"
                  isMobile={isMobile}
                >
                  <Select value={formData.slope} onValueChange={(value) => handleSelectChange("slope", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Upsloping</SelectItem>
                      <SelectItem value="1">Flat</SelectItem>
                      <SelectItem value="2">Downsloping</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="ca"
                  label="Number of Major Vessels"
                  tooltip="Number of major vessels colored by fluoroscopy (0-3)"
                  isMobile={isMobile}
                >
                  <Select value={formData.ca} onValueChange={(value) => handleSelectChange("ca", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="thal"
                  label="Thalassemia"
                  tooltip="0: Normal, 1: Fixed defect, 2: Reversible defect"
                  isMobile={isMobile}
                >
                  <Select value={formData.thal} onValueChange={(value) => handleSelectChange("thal", value)}>
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal</SelectItem>
                      <SelectItem value="1">Fixed defect</SelectItem>
                      <SelectItem value="2">Reversible defect</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className={`flex ${isMobile ? "flex-col gap-3" : "justify-between"}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className={isMobile ? "h-12 text-base w-full" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("lifestyle")}
                  className={`bg-gray-700 hover:bg-gray-600 ${isMobile ? "h-12 text-base w-full" : ""}`}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {isMobile && (
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Get Prediction"}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-6 mobile-section-spacing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  id="foodHabits"
                  label="Food Habits"
                  tooltip="Your primary dietary pattern"
                  isMobile={isMobile}
                >
                  <Select
                    value={formData.foodHabits}
                    onValueChange={(value) => handleSelectChange("foodHabits", value)}
                  >
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="mixed">Mixed Diet</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="junkFoodConsumption"
                  label="Junk Food Consumption"
                  tooltip="How often you consume processed or fast food"
                  isMobile={isMobile}
                >
                  <Select
                    value={formData.junkFoodConsumption}
                    onValueChange={(value) => handleSelectChange("junkFoodConsumption", value)}
                  >
                    <SelectTrigger className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (rarely)</SelectItem>
                      <SelectItem value="moderate">Moderate (weekly)</SelectItem>
                      <SelectItem value="high">High (daily)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  id="sleepingHours"
                  label="Sleeping Hours"
                  tooltip="Average hours of sleep per day"
                  isMobile={isMobile}
                >
                  <Input
                    id="sleepingHours"
                    name="sleepingHours"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter average hours"
                    value={formData.sleepingHours}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    step="0.5"
                    className={`bg-gray-800 border-gray-700 ${isMobile ? "h-12 text-base" : ""}`}
                  />
                </FormField>
              </div>

              <div className={`flex ${isMobile ? "flex-col gap-3" : "justify-between"}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("advanced")}
                  className={isMobile ? "h-12 text-base w-full" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {isMobile && (
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Get Prediction"}
                  </Button>
                )}
              </div>
            </TabsContent>

            {!isMobile || activeTab === "basic" ? (
              <Button
                type="submit"
                className={`w-full bg-red-600 hover:bg-red-700 text-white ${isMobile ? "h-12 text-base" : ""}`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Calculate Risk"}
              </Button>
            ) : null}
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
