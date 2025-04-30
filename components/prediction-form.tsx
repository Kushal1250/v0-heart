"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"

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

  // Add the necessary imports for the multi-step form
  // Add state for tracking the current step
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Function to navigate between steps
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const [isPredicting, setIsPredicting] = useState(false)

  // Modify the form to use steps
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Heart Health Assessment</CardTitle>
        <CardDescription>Enter your health information to get a heart disease risk assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded">{error}</div>}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 ${
                    idx + 1 <= currentStep ? "bg-blue-500" : "bg-gray-200"
                  } ${idx > 0 ? "ml-1" : ""}`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Personal Info</span>
              <span>Health Metrics</span>
              <span>Medical History</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            {currentStep === 1 && "Step 1: Personal Information"}
            {currentStep === 2 && "Step 2: Health Metrics"}
            {currentStep === 3 && "Step 3: Medical History"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="18"
                      max="100"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="sex"
                      name="sex"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.sex}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Health Metrics */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="trestbps" className="block text-sm font-medium text-gray-700">
                      Resting Blood Pressure (mm Hg)
                    </label>
                    <input
                      id="trestbps"
                      name="trestbps"
                      type="number"
                      min="60"
                      max="250"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.trestbps}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="chol" className="block text-sm font-medium text-gray-700">
                      Serum Cholesterol (mg/dl)
                    </label>
                    <input
                      id="chol"
                      name="chol"
                      type="number"
                      min="100"
                      max="600"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.chol}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fbs" className="block text-sm font-medium text-gray-700">
                      Fasting Blood Sugar &gt; 120 mg/dl
                    </label>
                    <select
                      id="fbs"
                      name="fbs"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.fbs}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="restecg" className="block text-sm font-medium text-gray-700">
                      Resting ECG Results
                    </label>
                    <select
                      id="restecg"
                      name="restecg"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.restecg}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="0">Normal</option>
                      <option value="1">ST-T Wave Abnormality</option>
                      <option value="2">Left Ventricular Hypertrophy</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    onClick={goToPrevStep}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Medical History */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="thalach" className="block text-sm font-medium text-gray-700">
                      Maximum Heart Rate
                    </label>
                    <input
                      id="thalach"
                      name="thalach"
                      type="number"
                      min="60"
                      max="220"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.thalach}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="exang" className="block text-sm font-medium text-gray-700">
                      Exercise Induced Angina
                    </label>
                    <select
                      id="exang"
                      name="exang"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.exang}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="oldpeak" className="block text-sm font-medium text-gray-700">
                      ST Depression Induced by Exercise
                    </label>
                    <input
                      id="oldpeak"
                      name="oldpeak"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.oldpeak}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="slope" className="block text-sm font-medium text-gray-700">
                      Slope of Peak Exercise ST Segment
                    </label>
                    <select
                      id="slope"
                      name="slope"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.slope}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="0">Upsloping</option>
                      <option value="1">Flat</option>
                      <option value="2">Downsloping</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ca" className="block text-sm font-medium text-gray-700">
                      Number of Major Vessels Colored by Fluoroscopy
                    </label>
                    <select
                      id="ca"
                      name="ca"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.ca}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="thal" className="block text-sm font-medium text-gray-700">
                      Thalassemia
                    </label>
                    <select
                      id="thal"
                      name="thal"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.thal}
                      onChange={handleChange}
                    >
                      <option value="">Select Option</option>
                      <option value="1">Normal</option>
                      <option value="2">Fixed Defect</option>
                      <option value="3">Reversible Defect</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    onClick={goToPrevStep}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={isPredicting}
                  >
                    {isPredicting ? "Processing..." : "Get Assessment"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
          {isSubmitting ? "Processing..." : "Get Assessment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
