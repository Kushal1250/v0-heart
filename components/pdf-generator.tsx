"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useMediaQuery } from "@/hooks/use-media-query"

interface PdfGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>
  fileName?: string
  assessmentData?: any // Add this prop
}

export default function PdfGenerator({
  contentRef,
  fileName = "health-assessment-results",
  assessmentData,
}: PdfGeneratorProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")

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
    const currentDate = new Date().toLocaleDateString()
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Generated on ${currentDate}. This assessment is not a medical diagnosis.`,
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

    // Add date
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30)

    // Add risk level
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    const riskLevel = data.result.risk.charAt(0).toUpperCase() + data.result.risk.slice(1)
    pdf.text(`Risk Level: ${riskLevel}`, 20, 45)

    // Add risk score
    pdf.setFontSize(14)
    pdf.text(`Risk Score: ${data.result.score}%`, 20, 55)

    // Add health metrics section
    pdf.setFontSize(16)
    pdf.text("Health Metrics", 20, 70)

    // Draw a line
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 72, 190, 72)

    // Add metrics
    pdf.setFontSize(12)
    let y = 80

    // Helper function to add a metric
    const addMetric = (label: string, value: string) => {
      pdf.setTextColor(80, 80, 80)
      pdf.text(label, 20, y)
      pdf.setTextColor(0, 0, 0)
      pdf.text(value, 80, y)
      y += 10
    }

    // Add all metrics
    addMetric("Age:", `${assessmentData.age} years`)
    addMetric("Gender:", assessmentData.sex === "1" ? "Male" : "Female")
    addMetric("Blood Pressure:", `${assessmentData.trestbps} mm Hg`)
    addMetric("Cholesterol:", `${assessmentData.chol} mg/dl`)
    addMetric(
      "Chest Pain Type:",
      (() => {
        const types = ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"]
        return types[Number.parseInt(assessmentData.cp)] || assessmentData.cp
      })(),
    )
    addMetric("Fasting Blood Sugar:", assessmentData.fbs === "1" ? "Above 120 mg/dl" : "Below 120 mg/dl")

    if (assessmentData.thalach) {
      addMetric("Max Heart Rate:", assessmentData.thalach)
    }

    addMetric("Exercise Induced Angina:", assessmentData.exang === "1" ? "Yes" : "No")

    // Add advanced parameters
    if (assessmentData.restecg) {
      const restecgValues = ["Normal", "ST-T wave abnormality", "Left ventricular hypertrophy"]
      addMetric("Resting ECG:", restecgValues[Number.parseInt(assessmentData.restecg)] || assessmentData.restecg)
    }

    if (assessmentData.oldpeak) {
      addMetric("ST Depression:", assessmentData.oldpeak)
    }

    if (assessmentData.slope) {
      const slopeValues = ["Upsloping", "Flat", "Downsloping"]
      addMetric("ST Slope:", slopeValues[Number.parseInt(assessmentData.slope)] || assessmentData.slope)
    }

    if (assessmentData.ca) {
      addMetric("Number of Major Vessels:", assessmentData.ca)
    }

    if (assessmentData.thal) {
      const thalValues = ["Normal", "Fixed defect", "Reversible defect"]
      addMetric("Thalassemia:", thalValues[Number.parseInt(assessmentData.thal)] || assessmentData.thal)
    }

    // Add lifestyle metrics
    if (assessmentData.foodHabits) {
      const foodHabitsText =
        assessmentData.foodHabits === "vegetarian"
          ? "Vegetarian"
          : assessmentData.foodHabits === "non-vegetarian"
            ? "Non-Vegetarian"
            : "Mixed Diet"
      addMetric("Food Habits:", foodHabitsText)
    }

    if (assessmentData.junkFoodConsumption) {
      const junkFoodText =
        assessmentData.junkFoodConsumption === "low"
          ? "Low (rarely)"
          : assessmentData.junkFoodConsumption === "moderate"
            ? "Moderate (weekly)"
            : "High (daily)"
      addMetric("Junk Food Consumption:", junkFoodText)
    }

    if (assessmentData.sleepingHours) {
      addMetric("Sleeping Hours:", `${assessmentData.sleepingHours} hours/day`)
    }

    // Add disclaimer
    y += 10
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, y)

    // Add footer
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Generated by HeartPredict on ${new Date().toLocaleDateString()}`, 20, pdf.internal.pageSize.height - 10)

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
