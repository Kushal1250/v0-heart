"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Heart, Info, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import PdfGenerator from "@/components/pdf-generator"
import EmailShareModal from "@/components/email-share-modal"
import DirectShareOptions from "@/components/direct-share-options"
import { useMediaQuery } from "@/hooks/use-media-query"
import { jsPDF } from "jspdf"
import { saveToHistory } from "@/lib/history-storage"
import { fetchWithAuth } from "@/lib/api-utils"
import { useAuth } from "@/lib/auth-context"
import { getCurrentUserEmail } from "@/lib/user-specific-storage"

interface PredictionResult {
  id?: string // Add optional id field to check if it's from history
  date?: string // Add optional date field to check if it's from history
  age: string
  sex: string
  trestbps: string
  chol: string
  cp: string
  fbs: string
  restecg: string
  thalach: string
  exang: string
  oldpeak: string
  slope: string
  ca: string
  thal: string
  result: {
    risk: "low" | "moderate" | "high"
    score: number
    hasDisease: boolean
  }
  foodHabits: string
  junkFoodConsumption: string
  sleepingHours: string
}

// Helper function to get human-readable values
const getReadableValue = (field: string, value: string): string => {
  const mappings: Record<string, Record<string, string>> = {
    sex: { "0": "Female", "1": "Male" },
    cp: { "0": "Typical angina", "1": "Atypical angina", "2": "Non-anginal pain", "3": "Asymptomatic" },
    fbs: { "0": "≤ 120 mg/dl", "1": "> 120 mg/dl" },
    restecg: { "0": "Normal", "1": "ST-T wave abnormality", "2": "Left ventricular hypertrophy" },
    exang: { "0": "No", "1": "Yes" },
    slope: { "0": "Upsloping", "1": "Flat", "2": "Downsloping" },
    thal: { "0": "Normal", "1": "Fixed defect", "2": "Reversible defect" },
  }

  if (field in mappings && value in mappings[field]) {
    return mappings[field][value]
  }

  return value
}

// Function to open desktop sharing options
const openDesktopShareOptions = (pdfBlob: Blob, filename: string) => {
  // Create object URL for the PDF
  const pdfUrl = URL.createObjectURL(pdfBlob)

  // Create a modal or popup with sharing options
  const shareOptions = document.createElement("div")
  shareOptions.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  shareOptions.innerHTML = `
    <div class="bg-gray-900 p-6 rounded-lg max-w-md w-full border border-gray-800">
      <h3 class="text-xl font-semibold mb-4">Share Options</h3>
      <p class="text-gray-400 mb-4">Choose how you'd like to share your assessment:</p>
      <div class="flex flex-col gap-3">
        <a href="mailto:?subject=Health Assessment Results&body=Please find my health assessment results attached." class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-5 w-5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Email PDF
        </a>
        <a href="${pdfUrl}" download="${filename}" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download PDF
        </a>
        <button id="close-share-options" class="mt-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md">Close</button>
      </div>
    </div>
  `

  document.body.appendChild(shareOptions)

  // Add event listener to close button
  document.getElementById("close-share-options")?.addEventListener("click", () => {
    document.body.removeChild(shareOptions)
    URL.revokeObjectURL(pdfUrl)
  })
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const resultContentRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [assessmentDate] = useState(new Date())

  useEffect(() => {
    const loadPredictionResult = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check if we have an ID from the URL query params
        const idFromQuery = searchParams?.get("id")

        if (idFromQuery && isAuthenticated) {
          // If we have an ID and user is authenticated, fetch from API
          const response = await fetchWithAuth(`/api/user/predictions/${idFromQuery}`)

          if (response.ok) {
            const data = await response.json()
            setPredictionResult(data)
          } else {
            // If API call fails, try to get from localStorage as fallback
            const storedResult = localStorage.getItem("predictionResult")
            if (storedResult) {
              setPredictionResult(JSON.parse(storedResult))
            } else {
              throw new Error("Failed to load assessment result")
            }
          }
        } else {
          // No ID or not authenticated, try localStorage
          const storedResult = localStorage.getItem("predictionResult")
          if (storedResult) {
            setPredictionResult(JSON.parse(storedResult))
          } else {
            throw new Error("No assessment result found")
          }
        }
      } catch (error) {
        console.error("Error loading prediction result:", error)
        setError(error instanceof Error ? error.message : "Failed to load assessment result. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadPredictionResult()
  }, [searchParams, isAuthenticated])

  // Modified useEffect to only save to history if it's a new assessment (not from history)
  useEffect(() => {
    // Save to history when result is loaded, but only if it's not already from history
    if (predictionResult && !predictionResult.id && !predictionResult.date) {
      saveToHistory(predictionResult)
    }
  }, [predictionResult])

  // Save assessment to history
  useEffect(() => {
    if (predictionResult && predictionResult.result) {
      try {
        const email = getCurrentUserEmail()
        if (email) {
          console.log("Saving assessment to history for:", email)
          saveToHistory(email, {
            ...predictionResult,
            timestamp: Date.now(),
          })
        }

        // Also attempt to save to server if user is logged in
        if (user?.id) {
          //saveAssessmentToServer(predictionResult); // Assuming this function exists elsewhere
        }
      } catch (error) {
        console.error("Failed to save assessment to history:", error)
      }
    }
  }, [predictionResult, user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-pulse">Loading assessment result...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/predict">Take New Assessment</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!predictionResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="rounded-full bg-yellow-100 p-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find any assessment results to display.</p>
              <Button asChild>
                <Link href="/predict">Take an Assessment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isHighRisk = predictionResult.result.risk === "high"
  const isModerateRisk = predictionResult.result.risk === "moderate"
  const riskScore = predictionResult.result.score

  // Determine key risk factors
  const keyRiskFactors = []

  if (Number.parseInt(predictionResult.age) > 55) {
    keyRiskFactors.push("Age above 55")
  }

  if (predictionResult.sex === "1") {
    keyRiskFactors.push("Male gender")
  }

  if (Number.parseInt(predictionResult.chol) > 240) {
    keyRiskFactors.push("High cholesterol")
  }

  if (Number.parseInt(predictionResult.trestbps) > 140) {
    keyRiskFactors.push("High blood pressure")
  }

  if (predictionResult.cp === "1" || predictionResult.cp === "2") {
    keyRiskFactors.push("Chest pain")
  }

  if (predictionResult.exang === "1") {
    keyRiskFactors.push("Exercise induced angina")
  }

  // Format date and time for display
  const formattedDate = assessmentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = assessmentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Generate a filename for the PDF based on date and risk level
  const pdfFileName = `health-assessment-${predictionResult.result.risk}-risk-${assessmentDate.toISOString().split("T")[0]}`

  // Function to handle mobile PDF sharing
  const handleMobilePdfShare = async () => {
    try {
      // Show loading state
      const button = document.getElementById("mobile-share-pdf-button")
      if (button) {
        button.textContent = "Generating..."
        button.setAttribute("disabled", "true")
      }

      // Generate PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      })

      // Set font
      pdf.setFont("helvetica")

      // Add title
      pdf.setFontSize(20)
      pdf.setTextColor(0, 0, 0)
      pdf.text("Health Assessment Results", 20, 20)

      // Add patient name if available
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Patient: ${user?.name || "Anonymous User"}`, 20, 30)

      // Add patient phone if available
      if (user?.phone) {
        pdf.text(`Phone: ${user.phone}`, 20, 35)
      }

      // Add date and time
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on ${formattedDate} at ${formattedTime}`, 20, user?.phone ? 40 : 35)

      // Add risk level
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      const riskLevel = predictionResult.result.risk.charAt(0).toUpperCase() + predictionResult.result.risk.slice(1)
      pdf.text(`Risk Level: ${riskLevel}`, 20, user?.phone ? 50 : 45)

      // Add risk score
      pdf.setFontSize(14)
      pdf.text(`Risk Score: ${predictionResult.result.score}%`, 20, user?.phone ? 60 : 55)

      // Add basic health metrics
      let yPos = user?.phone ? 70 : 65
      pdf.setFontSize(16)
      pdf.text("Basic Health Metrics:", 20, yPos)
      yPos += 10
      pdf.setFontSize(12)
      pdf.text(`Age: ${predictionResult.age} years`, 25, yPos)
      yPos += 6
      pdf.text(`Gender: ${getReadableValue("sex", predictionResult.sex)}`, 25, yPos)
      yPos += 6
      pdf.text(`Blood Pressure: ${predictionResult.trestbps} mm Hg`, 25, yPos)
      yPos += 6
      pdf.text(`Cholesterol: ${predictionResult.chol} mg/dl`, 25, yPos)

      // Add advanced parameters
      yPos += 10
      pdf.setFontSize(16)
      pdf.text("Advanced Parameters:", 20, yPos)
      yPos += 10
      pdf.setFontSize(12)
      pdf.text(`Chest Pain Type: ${getReadableValue("cp", predictionResult.cp)}`, 25, yPos)
      yPos += 6
      pdf.text(`Fasting Blood Sugar: ${getReadableValue("fbs", predictionResult.fbs)}`, 25, yPos)
      yPos += 6
      pdf.text(`Resting ECG: ${getReadableValue("restecg", predictionResult.restecg)}`, 25, yPos)
      yPos += 6
      pdf.text(`Max Heart Rate: ${predictionResult.thalach || "N/A"}`, 25, yPos)
      yPos += 6
      pdf.text(`Exercise Induced Angina: ${getReadableValue("exang", predictionResult.exang)}`, 25, yPos)
      yPos += 6
      pdf.text(`ST Depression: ${predictionResult.oldpeak || "N/A"}`, 25, yPos)
      yPos += 6
      pdf.text(`ST Slope: ${getReadableValue("slope", predictionResult.slope) || "N/A"}`, 25, yPos)
      yPos += 6
      pdf.text(`Number of Major Vessels: ${predictionResult.ca || "N/A"}`, 25, yPos)
      yPos += 6
      pdf.text(`Thalassemia: ${getReadableValue("thal", predictionResult.thal) || "N/A"}`, 25, yPos)

      // Add lifestyle factors
      yPos += 10
      pdf.setFontSize(16)
      pdf.text("Lifestyle Factors:", 20, yPos)
      yPos += 10
      pdf.setFontSize(12)

      // Format food habits
      const foodHabits =
        predictionResult.foodHabits === "vegetarian"
          ? "Vegetarian"
          : predictionResult.foodHabits === "non-vegetarian"
            ? "Non-Vegetarian"
            : "Mixed Diet"

      // Format junk food consumption
      const junkFood =
        predictionResult.junkFoodConsumption === "low"
          ? "Low (rarely)"
          : predictionResult.junkFoodConsumption === "moderate"
            ? "Moderate (weekly)"
            : "High (daily)"

      pdf.text(`Food Habits: ${foodHabits}`, 25, yPos)
      yPos += 6
      pdf.text(`Junk Food Consumption: ${junkFood}`, 25, yPos)
      yPos += 6
      pdf.text(`Sleeping Hours: ${predictionResult.sleepingHours || "N/A"} hours/day`, 25, yPos)

      // Add disclaimer
      yPos += 15
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, yPos)

      // Convert to blob
      const pdfBlob = new Blob([pdf.output("arraybuffer")], { type: "application/pdf" })

      // Create file from blob
      const pdfFile = new File([pdfBlob], pdfFileName + ".pdf", { type: "application/pdf" })

      // Check if we can share files
      const shareData = {
        title: "Health Assessment Results",
        text: "My heart health assessment results",
        files: [pdfFile],
      }

      // Use native share API
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else if (navigator.share) {
        // Fallback to sharing just text
        await navigator.share({
          title: "Health Assessment Results",
          text: "My heart health assessment results. Please download the PDF for details.",
        })

        // Also download the PDF since we couldn't share it directly
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const link = document.createElement("a")
        link.href = pdfUrl
        link.download = pdfFileName + ".pdf"
        link.click()
        URL.revokeObjectURL(pdfUrl)
      } else {
        // Fallback for browsers that don't support file sharing
        openDesktopShareOptions(pdfBlob, pdfFileName + ".pdf")
      }
    } catch (error) {
      console.error("Error sharing PDF:", error)
      alert("Could not share PDF. Downloading instead...")

      // Fallback to regular download
      if (resultContentRef.current) {
        const button = document.getElementById("download-pdf-button")
        if (button) button.click()
      }
    } finally {
      // Reset button state
      const button = document.getElementById("mobile-share-pdf-button")
      if (button) {
        button.textContent = "Share PDF"
        button.removeAttribute("disabled")
      }
    }
  }

  // Create a simple text representation of the assessment
  const getTextSummary = (assessmentData: PredictionResult) => {
    const riskLevel = assessmentData.result.risk
    const riskScore = assessmentData.result.score

    // Format food habits
    const foodHabits =
      assessmentData.foodHabits === "vegetarian"
        ? "Vegetarian"
        : assessmentData.foodHabits === "non-vegetarian"
          ? "Non-Vegetarian"
          : "Mixed Diet"

    // Format junk food consumption
    const junkFood =
      assessmentData.junkFoodConsumption === "low"
        ? "Low (rarely)"
        : assessmentData.junkFoodConsumption === "moderate"
          ? "Moderate (weekly)"
          : "High (daily)"

    // Get readable values for categorical fields
    const getReadableValue = (field: string, value: string) => {
      const mappings = {
        sex: { "0": "Female", "1": "Male" },
        cp: { "0": "Typical angina", "1": "Atypical angina", "2": "Non-anginal pain", "3": "Asymptomatic" },
        fbs: { "0": "≤ 120 mg/dl", "1": "> 120 mg/dl" },
        restecg: { "0": "Normal", "1": "ST-T wave abnormality", "2": "Left ventricular hypertrophy" },
        exang: { "0": "No", "1": "Yes" },
        slope: { "0": "Upsloping", "1": "Flat", "2": "Downsloping" },
        thal: { "0": "Normal", "1": "Fixed defect", "2": "Reversible defect" },
      }

      if (field in mappings && value in mappings[field]) {
        return mappings[field][value]
      }
      return value
    }

    return `
HEART ASSESSMENT RESULTS

Patient: ${user?.name || "Anonymous User"}
${user?.phone ? `Phone: ${user.phone}` : ""}
Date: ${formattedDate}
Time: ${formattedTime}

Risk Level: ${riskLevel.toUpperCase()}
Risk Score: ${riskScore}%

Basic Health Metrics:
- Age: ${assessmentData.age} years
- Gender: ${getReadableValue("sex", assessmentData.sex)}
- Blood Pressure: ${assessmentData.trestbps} mm Hg
- Cholesterol: ${assessmentData.chol} mg/dl

Advanced Parameters:
- Chest Pain Type: ${getReadableValue("cp", assessmentData.cp)}
- Fasting Blood Sugar: ${getReadableValue("fbs", assessmentData.fbs)}
- Resting ECG: ${getReadableValue("restecg", assessmentData.restecg)}
- Max Heart Rate: ${assessmentData.thalach || "N/A"}
- Exercise Induced Angina: ${getReadableValue("exang", assessmentData.exang)}
- ST Depression: ${assessmentData.oldpeak || "N/A"}
- ST Slope: ${getReadableValue("slope", assessmentData.slope) || "N/A"}
- Number of Major Vessels: ${assessmentData.ca || "N/A"}
- Thalassemia: ${getReadableValue("thal", assessmentData.thal)}

Lifestyle Factors:
- Food Habits: ${foodHabits}
- Junk Food Consumption: ${junkFood}
- Sleeping Hours: ${assessmentData.sleepingHours || "N/A"} hours/day

Assessment generated by HeartPredict on ${formattedDate} at ${formattedTime}
`.trim()
  }

  const data = {
    ...predictionResult,
    userName: user?.name || "Anonymous User",
    userPhone: user?.phone || "Not provided",
  }

  // Return your existing results page UI here
  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back button and share button for mobile */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/predict")}
            className="flex items-center"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isMobile ? "Back" : "Back to Prediction Form"}
          </Button>

          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="h-9 w-9 rounded-full"
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share results</span>
            </Button>
          )}
        </div>

        {/* Mobile share options */}
        {isMobile && showShareOptions && (
          <div className="mb-6 flex flex-wrap gap-3 justify-center p-4 bg-gray-50 rounded-lg">
            <EmailShareModal
              assessmentData={predictionResult}
              userName={user?.name}
              userPhone={user?.phone}
              assessmentDate={assessmentDate}
            />
            <PdfGenerator
              contentRef={resultContentRef}
              fileName={pdfFileName}
              assessmentData={predictionResult}
              userName={user?.name}
              userPhone={user?.phone}
              assessmentDate={assessmentDate}
            />
            <Button
              variant="outline"
              className="flex items-center gap-2 h-11 w-full sm:w-auto"
              onClick={handleMobilePdfShare}
              id="mobile-share-pdf-button"
            >
              <Share2 className="h-4 w-4" />
              Share PDF
            </Button>
          </div>
        )}

        <Card
          ref={resultContentRef}
          className={`border w-full max-w-full sm:max-w-3xl mx-auto ${isHighRisk ? "border-red-600" : isModerateRisk ? "border-yellow-600" : "border-green-600"}`}
        >
          <CardHeader
            className={`${isHighRisk ? "bg-red-950/30" : isModerateRisk ? "bg-yellow-950/30" : "bg-green-950/30"} rounded-t-lg ${isMobile ? "p-4" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className={`${isMobile ? "text-xl" : "text-2xl"}`}>Your Health Assessment</CardTitle>
                <p className="text-gray-400 text-sm md:text-base">Based on the information you provided</p>
              </div>
              {isHighRisk && <AlertTriangle className="h-6 w-6 text-red-500" />}
            </div>
          </CardHeader>
          <CardContent className={`${isMobile ? "p-4" : "pt-6"}`}>
            {/* Patient info section */}
            <div className="mb-6 bg-gray-800/50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="font-medium">{user?.name || "Anonymous User"}</p>
                  {user?.phone && (
                    <>
                      <p className="text-xs text-gray-400 mt-2">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="font-medium">
                    {formattedDate}, {formattedTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 ${
                  isHighRisk ? "bg-red-950/30" : isModerateRisk ? "bg-yellow-950/30" : "bg-green-950/30"
                }`}
              >
                <Heart
                  className={`h-8 w-8 md:h-10 md:w-10 ${
                    isHighRisk ? "text-red-500" : isModerateRisk ? "text-yellow-500" : "text-green-500"
                  }`}
                />
              </div>

              <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold mb-2 text-center`}>
                {isHighRisk
                  ? "Higher Risk Detected"
                  : isModerateRisk
                    ? "Moderate Risk Detected"
                    : "Lower Risk Detected"}
              </h2>
              <p className="text-gray-400 text-center mb-4 text-sm md:text-base">
                Our model predicts a {predictionResult.result.risk} likelihood based on your health metrics.
              </p>

              <div className="w-full mt-2 mb-4">
                <div className="flex justify-between mb-1 text-xs md:text-sm">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
                <Progress
                  value={riskScore}
                  className={`h-2 md:h-3 ${
                    isHighRisk ? "bg-red-950/30" : isModerateRisk ? "bg-yellow-950/30" : "bg-green-950/30"
                  }`}
                  indicatorClassName={`${
                    isHighRisk ? "bg-red-500" : isModerateRisk ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
                <div className="text-center mt-1">
                  <span className="text-xs md:text-sm font-medium">{riskScore}% Risk Score</span>
                </div>
              </div>
            </div>

            {keyRiskFactors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center">
                  <Info className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-400" />
                  Key Risk Factors Identified:
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-sm md:text-base">
                  {keyRiskFactors.map((factor, index) => (
                    <li key={index} className="text-gray-300">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="text-lg md:text-xl font-semibold mb-4">Your Health Information:</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 mb-6">
              <div className="bg-gray-800 p-3 md:p-4 rounded-md">
                <p className="text-gray-400 text-xs md:text-sm">Age</p>
                <p className="text-base md:text-xl font-medium">{predictionResult.age} years</p>
              </div>
              <div className="bg-gray-800 p-3 md:p-4 rounded-md">
                <p className="text-gray-400 text-xs md:text-sm">Gender</p>
                <p className="text-base md:text-xl font-medium">{getReadableValue("sex", predictionResult.sex)}</p>
              </div>
              <div className="bg-gray-800 p-3 md:p-4 rounded-md">
                <p className="text-gray-400 text-xs md:text-sm">Cholesterol</p>
                <p className="text-base md:text-xl font-medium">{predictionResult.chol} mg/dl</p>
              </div>
              <div className="bg-gray-800 p-3 md:p-4 rounded-md">
                <p className="text-gray-400 text-xs md:text-sm">Blood Pressure</p>
                <p className="text-base md:text-xl font-medium">{predictionResult.trestbps} mm Hg</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold mb-3">Cardiac Assessment:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Chest Pain Type</p>
                  <p className="text-sm md:text-base font-medium">{getReadableValue("cp", predictionResult.cp)}</p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Fasting Blood Sugar</p>
                  <p className="text-sm md:text-base font-medium">{getReadableValue("fbs", predictionResult.fbs)}</p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Resting ECG</p>
                  <p className="text-sm md:text-base font-medium">
                    {getReadableValue("restecg", predictionResult.restecg)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Max Heart Rate</p>
                  <p className="text-sm md:text-base font-medium">{predictionResult.thalach || "N/A"}</p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Exercise Induced Angina</p>
                  <p className="text-sm md:text-base font-medium">
                    {getReadableValue("exang", predictionResult.exang)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">ST Depression</p>
                  <p className="text-sm md:text-base font-medium">{predictionResult.oldpeak || "N/A"}</p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">ST Slope</p>
                  <p className="text-sm md:text-base font-medium">
                    {getReadableValue("slope", predictionResult.slope) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Major Vessels</p>
                  <p className="text-sm md:text-base font-medium">{predictionResult.ca || "N/A"}</p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Thalassemia</p>
                  <p className="text-sm md:text-base font-medium">
                    {getReadableValue("thal", predictionResult.thal) || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Add the new lifestyle metrics to the results page */}
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-semibold mb-3">Lifestyle Factors:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Food Habits</p>
                  <p className="text-sm md:text-base font-medium">
                    {predictionResult.foodHabits === "vegetarian"
                      ? "Vegetarian"
                      : predictionResult.foodHabits === "non-vegetarian"
                        ? "Non-Vegetarian"
                        : "Mixed Diet"}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Junk Food Consumption</p>
                  <p className="text-sm md:text-base font-medium">
                    {predictionResult.junkFoodConsumption === "low"
                      ? "Low (rarely)"
                      : predictionResult.junkFoodConsumption === "moderate"
                        ? "Moderate (weekly)"
                        : "High (daily)"}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-2 md:p-3 rounded-md">
                  <p className="text-xs md:text-sm text-gray-400">Sleeping Hours</p>
                  <p className="text-sm md:text-base font-medium">{predictionResult.sleepingHours || "N/A"} hours</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-950/30 p-3 md:p-4 rounded-md">
              <h4 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Important Note</h4>
              <p className="text-xs md:text-sm text-gray-400">
                This assessment is based on a predictive model and should not replace professional medical advice.
                Please consult with a healthcare provider for a comprehensive evaluation.
              </p>
            </div>

            <div className="mt-4 md:mt-6 text-center text-xs text-gray-500">
              Assessment generated on {formattedDate} at {formattedTime}
            </div>
          </CardContent>
        </Card>

        {/* Desktop share options */}
        {!isMobile && (
          <div className="mt-6 space-y-6">
            <DirectShareOptions
              assessmentData={predictionResult}
              userName={user?.name}
              userPhone={user?.phone}
              assessmentDate={assessmentDate}
            />

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Share Your Results</h3>
              <p className="text-gray-400 mb-4">
                Want to share these results with your healthcare provider? You can download a PDF report or send the
                results directly via email.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <EmailShareModal
                  assessmentData={predictionResult}
                  userName={user?.name}
                  userPhone={user?.phone}
                  assessmentDate={assessmentDate}
                />
                <PdfGenerator
                  contentRef={resultContentRef}
                  fileName={pdfFileName}
                  assessmentData={predictionResult}
                  userName={user?.name}
                  userPhone={user?.phone}
                  assessmentDate={assessmentDate}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile floating action button for new assessment */}
        {isMobile && (
          <div className="fixed bottom-6 right-6 z-10">
            <Button
              onClick={() => router.push("/predict")}
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
            >
              <Heart className="h-6 w-6" />
              <span className="sr-only">New Assessment</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
