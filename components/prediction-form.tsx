"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"

const defaultFormData = {
  age: "",
  sex: "",
  cp: "",
  trestbps: "",
  chol: "",
  fbs: "",
  restecg: "",
  thalach: "",
  exang: "",
  oldpeak: "",
  slope: "",
  ca: "",
  thal: "",
  foodHabits: "mixed",
  junkFoodConsumption: "moderate",
  sleepingHours: "7",
}

export function PredictionForm() {
  const [formData, setFormData] = useState(defaultFormData)
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset form
      setFormData(defaultFormData)
      alert("Form submitted successfully!")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Heart Health Assessment</CardTitle>
        <CardDescription>Enter your health information to get a heart disease risk assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Gender</Label>
            <Select name="sex" value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Male</SelectItem>
                <SelectItem value="0">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trestbps">Resting Blood Pressure (mm Hg)</Label>
            <Input
              id="trestbps"
              name="trestbps"
              type="number"
              placeholder="e.g., 120"
              value={formData.trestbps}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chol">Cholesterol (mg/dl)</Label>
            <Input
              id="chol"
              name="chol"
              type="number"
              placeholder="e.g., 200"
              value={formData.chol}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cp">Chest Pain Type</Label>
            <Select name="cp" value={formData.cp} onValueChange={(value) => handleSelectChange("cp", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="restecg">Resting ECG Results</Label>
            <Select
              name="restecg"
              value={formData.restecg}
              onValueChange={(value) => handleSelectChange("restecg", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
            <Label htmlFor="thalach">Maximum Heart Rate</Label>
            <Input
              id="thalach"
              name="thalach"
              type="number"
              placeholder="e.g., 150"
              value={formData.thalach}
              onChange={handleInputChange}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="exang">Exercise Induced Angina</Label>
            <Select name="exang" value={formData.exang} onValueChange={(value) => handleSelectChange("exang", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slope">Slope of Peak Exercise ST Segment</Label>
            <Select name="slope" value={formData.slope} onValueChange={(value) => handleSelectChange("slope", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
              <SelectTrigger className="bg-gray-800 border-gray-700">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="thal">Thalassemia</Label>
            <Select name="thal" value={formData.thal} onValueChange={(value) => handleSelectChange("thal", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foodHabits">Food Habits</Label>
            <Select
              name="foodHabits"
              value={formData.foodHabits}
              onValueChange={(value) => handleSelectChange("foodHabits", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
              <SelectTrigger className="bg-gray-800 border-gray-700">
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
            <SelectTrigger className="bg-gray-800 border-gray-700">
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
      <CardFooter>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Processing..." : "Get Assessment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
