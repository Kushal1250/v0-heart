"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { saveAssessment } from "@/lib/save-assessment"
import { useToast } from "@/hooks/use-toast"

interface PredictionFormProps {
  onSubmit?: (data: any) => void
  initialData?: any
}

export function PredictionForm({ onSubmit, initialData }: PredictionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")

  const [formData, setFormData] = useState({
    age: initialData?.age || "",
    sex: initialData?.sex || "",
    cp: initialData?.cp || "",
    trestbps: initialData?.trestbps || "",
    chol: initialData?.chol || "",
    fbs: initialData?.fbs || "",
    restecg: initialData?.restecg || "",
    thalach: initialData?.thalach || "",
    exang: initialData?.exang || "",
    oldpeak: initialData?.oldpeak || "",
    slope: initialData?.slope || "",
    ca: initialData?.ca || "",
    thal: initialData?.thal || "",
    email: initialData?.email || "",
  })

  const saveCurrentEmail = (email: string) => {
    try {
      localStorage.setItem("lastUsedEmail", email)
    } catch (error) {
      console.error("Error saving email to localStorage:", error)
    }
  }

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("lastUsedEmail")
      if (savedEmail) {
        setCurrentEmail(savedEmail)
        setFormData((prev) => ({ ...prev, email: savedEmail }))
      }
    } catch (error) {
      console.error("Error retrieving email from localStorage:", error)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save the email for future use
      if (formData.email) {
        saveCurrentEmail(formData.email)
      }

      // Convert form data to appropriate types
      const processedData = {
        ...formData,
        age: Number.parseInt(formData.age),
        trestbps: Number.parseInt(formData.trestbps),
        chol: Number.parseInt(formData.chol),
        thalach: Number.parseInt(formData.thalach),
        oldpeak: Number.parseFloat(formData.oldpeak),
        ca: Number.parseInt(formData.ca),
      }

      // If onSubmit prop is provided, call it with the form data
      if (onSubmit) {
        onSubmit(processedData)
        return
      }

      // Otherwise, make the API call directly
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit prediction")
      }

      const result = await response.json()

      // Save to history
      await saveAssessment(processedData, result.prediction)

      // Redirect to results page
      router.push(`/predict/results/${result.id}`)
    } catch (error) {
      console.error("Error submitting prediction:", error)
      toast({
        title: "Error",
        description: "Failed to submit prediction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select name="sex" value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Male</SelectItem>
              <SelectItem value="0">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cp">Chest Pain Type</Label>
          <Select name="cp" value={formData.cp} onValueChange={(value) => handleSelectChange("cp", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chest pain type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Typical Angina</SelectItem>
              <SelectItem value="1">Atypical Angina</SelectItem>
              <SelectItem value="2">Non-anginal Pain</SelectItem>
              <SelectItem value="3">Asymptomatic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="trestbps">Resting Blood Pressure (mm Hg)</Label>
          <Input
            id="trestbps"
            name="trestbps"
            type="number"
            placeholder="Enter resting blood pressure"
            value={formData.trestbps}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chol">Serum Cholesterol (mg/dl)</Label>
          <Input
            id="chol"
            name="chol"
            type="number"
            placeholder="Enter cholesterol level"
            value={formData.chol}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fbs">Fasting Blood Sugar {">"}120 mg/dl</Label>
          <Select name="fbs" value={formData.fbs} onValueChange={(value) => handleSelectChange("fbs", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fasting blood sugar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Yes</SelectItem>
              <SelectItem value="0">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="restecg">Resting ECG Results</Label>
          <Select
            name="restecg"
            value={formData.restecg}
            onValueChange={(value) => handleSelectChange("restecg", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ECG results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Normal</SelectItem>
              <SelectItem value="1">ST-T Wave Abnormality</SelectItem>
              <SelectItem value="2">Left Ventricular Hypertrophy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thalach">Maximum Heart Rate</Label>
          <Input
            id="thalach"
            name="thalach"
            type="number"
            placeholder="Enter maximum heart rate"
            value={formData.thalach}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exang">Exercise Induced Angina</Label>
          <Select name="exang" value={formData.exang} onValueChange={(value) => handleSelectChange("exang", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select exercise induced angina" />
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
            placeholder="Enter ST depression"
            value={formData.oldpeak}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slope">Slope of Peak Exercise ST Segment</Label>
          <Select name="slope" value={formData.slope} onValueChange={(value) => handleSelectChange("slope", value)}>
            <SelectTrigger>
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
          <Label htmlFor="ca">Number of Major Vessels Colored by Fluoroscopy</Label>
          <Select name="ca" value={formData.ca} onValueChange={(value) => handleSelectChange("ca", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select number of vessels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thal">Thalassemia</Label>
          <Select name="thal" value={formData.thal} onValueChange={(value) => handleSelectChange("thal", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select thalassemia type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Normal</SelectItem>
              <SelectItem value="2">Fixed Defect</SelectItem>
              <SelectItem value="3">Reversible Defect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email for results"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Assessment"}
      </Button>
    </form>
  )
}

export default PredictionForm
