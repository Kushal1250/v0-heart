"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useMediaQuery } from "@/hooks/use-media-query"

interface PdfGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>
  fileName: string
  assessmentData: any
  userName?: string
  userPhone?: string
  assessmentDate?: Date
}

// Define the component function
function PdfGenerator({
  contentRef,
  fileName = "health-assessment-results",
  assessmentData,
  userName,
  userPhone,
  assessmentDate = new Date(),
}: PdfGeneratorProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")

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

  const generatePDF = async () => {
    try {
      // Show loading state
      const button = document.getElementById("download-pdf-button")
      if (button) {
        button.textContent = "Generating PDF..."
        button.setAttribute("disabled", "true")
      }

      // If we have a contentRef with current element, use that
      if (contentRef.current) {
        await generatePdfFromElement(contentRef.current)
      }
      // Otherwise, if we have assessmentData, generate PDF from that
      else if (assessmentData) {
        await generatePdfFromData(assessmentData)
      } else {
        throw new Error("No content to generate PDF from")
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating your PDF. Please try again.")
    } finally {
      // Reset button state
      const button = document.getElementById("download-pdf-button")
      if (button) {
        button.textContent = isMobile ? "Download PDF" : "Download PDF Report"
        button.removeAttribute("disabled")
      }
    }
  }

  const generatePdfFromElement = async (element: HTMLElement) => {
    // Create a clone of the content to modify for PDF
    const contentClone = element.cloneNode(true) as HTMLElement

    // Apply some PDF-specific styling
    const buttons = contentClone.querySelectorAll("button")
    buttons.forEach((button) => button.remove())

    // Set background color for PDF
    contentClone.style.backgroundColor = "#121212"
    contentClone.style.padding = "20px"
    contentClone.style.borderRadius = "0"

    // Temporarily append the clone to the document for html2canvas
    contentClone.style.position = "absolute"
    contentClone.style.left = "-9999px"
    document.body.appendChild(contentClone)

    // Generate canvas from the content
    const canvas = await html2canvas(contentClone, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: "#121212",
      logging: false,
      allowTaint: true,
    })

    // Remove the clone
    document.body.removeChild(contentClone)

    // Calculate PDF dimensions (A4 format)
    const imgWidth = 210 // mm (A4 width)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
    })

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

    // Add footer with date and disclaimer
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Generated on ${formattedDate} at ${formattedTime}. This assessment is not a medical diagnosis.`,
      10,
      pdf.internal.pageSize.height - 10,
    )

    // Save the PDF
    pdf.save(`${fileName}.pdf`)
  }

  const generatePdfFromData = async (data: any) => {
    // Create PDF directly from the data
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

    // Add patient information section
    let yPos = 35

    // Add patient name if available
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Patient: ${userName || "Anonymous User"}`, 20, yPos)
    yPos += 7

    // Add patient phone if available
    if (userPhone) {
      pdf.text(`Phone: ${userPhone}`, 20, yPos)
      yPos += 7
    }

    // Add date and time
    pdf.text(`Generated on ${formattedDate} at ${formattedTime}`, 20, yPos)
    yPos += 12

    // Add risk level
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    const riskLevel = data.result.risk.charAt(0).toUpperCase() + data.result.risk.slice(1)
    pdf.text(`Risk Level: ${riskLevel}`, 20, yPos)
    yPos += 8

    // Add risk score
    pdf.setFontSize(14)
    pdf.text(`Risk Score: ${data.result.score}%`, 20, yPos)
    yPos += 15

    // Add basic health metrics section
    pdf.setFontSize(16)
    pdf.text("Basic Health Metrics", 20, yPos)
    yPos += 2

    // Draw a line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, yPos, 190, yPos)
    yPos += 8

    // Add metrics
    pdf.setFontSize(12)

    // Helper function to add a metric
    const addMetric = (label: string, value: string) => {
      pdf.setTextColor(80, 80, 80)
      pdf.text(label, 20, yPos)
      pdf.setTextColor(0, 0, 0)
      pdf.text(value, 80, yPos)
      yPos += 7
    }

    // Basic Health Metrics
    addMetric("Age:", `${data.age} years`)
    addMetric("Gender:", data.sex === "1" ? "Male" : "Female")
    addMetric("Blood Pressure:", `${data.trestbps} mm Hg`)
    addMetric("Cholesterol:", `${data.chol} mg/dl`)
    yPos += 5

    // Advanced Parameters section
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Advanced Parameters", 20, yPos)
    yPos += 2

    // Draw a line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, yPos, 190, yPos)
    yPos += 8

    // Reset font for metrics
    pdf.setFontSize(12)

    // Chest Pain and Related Metrics
    addMetric(
      "Chest Pain Type:",
      (() => {
        const types = ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"]
        return types[Number.parseInt(data.cp)] || data.cp
      })(),
    )
    addMetric("Fasting Blood Sugar:", data.fbs === "1" ? "Above 120 mg/dl" : "Below 120 mg/dl")

    // Add advanced parameters
    if (data.restecg) {
      const restecgValues = ["Normal", "ST-T wave abnormality", "Left ventricular hypertrophy"]
      addMetric("Resting ECG:", restecgValues[Number.parseInt(data.restecg)] || data.restecg)
    }

    if (data.thalach) {
      addMetric("Max Heart Rate:", data.thalach)
    }

    addMetric("Exercise Induced Angina:", data.exang === "1" ? "Yes" : "No")

    if (data.oldpeak) {
      addMetric("ST Depression:", data.oldpeak)
    }

    if (data.slope) {
      const slopeValues = ["Upsloping", "Flat", "Downsloping"]
      addMetric("ST Slope:", slopeValues[Number.parseInt(data.slope)] || data.slope)
    }

    if (data.ca) {
      addMetric("Number of Major Vessels:", data.ca)
    }

    if (data.thal) {
      const thalValues = ["Normal", "Fixed defect", "Reversible defect"]
      addMetric("Thalassemia:", thalValues[Number.parseInt(data.thal)] || data.thal)
    }
    yPos += 5

    // Add lifestyle section header
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Lifestyle Factors", 20, yPos)
    yPos += 2

    // Draw a line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, yPos, 190, yPos)
    yPos += 8

    pdf.setFontSize(12)

    // Add lifestyle metrics
    if (data.foodHabits) {
      const foodHabitsText =
        data.foodHabits === "vegetarian"
          ? "Vegetarian"
          : data.foodHabits === "non-vegetarian"
            ? "Non-Vegetarian"
            : "Mixed Diet"
      addMetric("Food Habits:", foodHabitsText)
    }

    if (data.junkFoodConsumption) {
      const junkFoodText =
        data.junkFoodConsumption === "low"
          ? "Low (rarely)"
          : data.junkFoodConsumption === "moderate"
            ? "Moderate (weekly)"
            : "High (daily)"
      addMetric("Junk Food Consumption:", junkFoodText)
    }

    if (data.sleepingHours) {
      addMetric("Sleeping Hours:", `${data.sleepingHours} hours/day`)
    } else {
      addMetric("Sleeping Hours:", "N/A hours/day")
    }

    // Add disclaimer
    yPos += 10
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, yPos)

    // Add footer
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Generated by HeartPredict on ${formattedDate} at ${formattedTime}`, 20, pdf.internal.pageSize.height - 10)

    // Save the PDF
    pdf.save(`${fileName}.pdf`)
  }

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      className="flex items-center gap-2 w-full h-11"
      id="download-pdf-button"
    >
      <Download className="h-4 w-4" />
      {isMobile ? "Download PDF" : "Download PDF Report"}
    </Button>
  )
}

// Export both as default and named export to support both import styles
export default PdfGenerator
export { PdfGenerator as PDFGenerator }
