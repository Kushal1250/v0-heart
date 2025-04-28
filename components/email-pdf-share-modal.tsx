"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, AlertCircle, CheckCircle2, FileText, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EmailPdfShareModalProps {
  assessmentData: any
  patientName?: string
  userPhone?: string
  assessmentDate?: Date
}

export default function EmailPdfShareModal({
  assessmentData,
  patientName = "Patient",
  userPhone = "",
  assessmentDate = new Date(),
}: EmailPdfShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [emailData, setEmailData] = useState({
    to: "",
    subject: `Health Assessment Results with PDF`,
    message: `I'm sharing my health assessment results. Please review the attached information and PDF report.`,
    includeFullData: true,
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "config-error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [emailConfigStatus, setEmailConfigStatus] = useState<null | "valid" | "invalid">(null)
  const [configError, setConfigError] = useState("")

  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Check email configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      checkEmailConfig()
    }
  }, [isOpen])

  const checkEmailConfig = async () => {
    try {
      const response = await fetch("/api/email-test")
      const data = await response.json()

      if (data.status === "success") {
        setEmailConfigStatus("valid")
      } else {
        setEmailConfigStatus("invalid")
        setConfigError(data.message || "Email configuration is invalid")
        setStatus("config-error")
      }
    } catch (error) {
      setEmailConfigStatus("invalid")
      setConfigError("Failed to check email configuration")
      setStatus("config-error")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEmailData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setEmailData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")
    setErrorDetails("")

    try {
      // Validate email
      if (!emailData.to || !/^\S+@\S+\.\S+$/.test(emailData.to)) {
        throw new Error("Valid recipient email is required")
      }

      // Validate subject
      if (!emailData.subject || emailData.subject.trim().length === 0) {
        throw new Error("Email subject is required")
      }

      // Validate assessment data
      if (!assessmentData) {
        throw new Error("Assessment data is required")
      }

      // Use the new API route that includes PDF attachment
      const response = await fetch("/api/email-with-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          assessmentData: emailData.includeFullData ? assessmentData : null,
          userName: patientName,
          userPhone: userPhone,
          assessmentDate: assessmentDate.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }

      const data = await response.json()

      setStatus("success")

      // Reset form after success
      setTimeout(() => {
        if (status === "success") {
          setIsOpen(false)
          setStatus("idle")
          setEmailData({
            to: "",
            subject: `Health Assessment Results with PDF`,
            message: `I'm sharing my health assessment results. Please review the attached information and PDF report.`,
            includeFullData: true,
          })
        }
      }, 3000)
    } catch (error) {
      console.error("Error sending email:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-11">
          <FileText className="h-4 w-4 mr-1" />
          <Mail className="h-4 w-4" />
          {isMobile ? "Email PDF" : "Email with PDF"}
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[500px] ${isMobile ? "w-[95%] p-4 rounded-lg" : ""}`} closeButton={false}>
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle>{isMobile ? "Share Results" : "Share Results with PDF Attachment"}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-6">
            <Alert className="bg-green-900/20 border-green-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your assessment results have been sent successfully with a PDF attachment.
              </AlertDescription>
            </Alert>
          </div>
        ) : status === "config-error" ? (
          <div className="py-6 space-y-4">
            <Alert className="bg-red-900/20 border-red-600">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Email Configuration Error</AlertTitle>
              <AlertDescription>{configError || "The email service is not properly configured."}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {status === "error" && (
              <Alert className="bg-red-900/20 border-red-600">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage || "Failed to send email. Please try again."}</AlertDescription>
                {errorDetails && (
                  <details className="mt-2 text-xs">
                    <summary>Technical details</summary>
                    <p className="mt-1">{errorDetails}</p>
                  </details>
                )}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="to" className="text-sm">
                Recipient Email
              </Label>
              <Input
                id="to"
                name="to"
                type="email"
                inputMode="email"
                placeholder="doctor@example.com"
                value={emailData.to}
                onChange={handleChange}
                required
                className="bg-gray-800 border-gray-700 h-11"
                autoComplete="email"
              />
              {!isMobile && (
                <p className="text-xs text-gray-400">
                  Enter the email address of your healthcare provider or recipient
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={emailData.subject}
                onChange={handleChange}
                required
                className="bg-gray-800 border-gray-700 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={emailData.message}
                onChange={handleChange}
                rows={isMobile ? 2 : 3}
                className="bg-gray-800 border-gray-700 resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="includeFullData"
                  name="includeFullData"
                  checked={emailData.includeFullData}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-700 bg-gray-800 h-5 w-5"
                />
              </div>
              <div className="ml-2 text-sm leading-6">
                <Label htmlFor="includeFullData" className="text-sm">
                  Include detailed health metrics
                </Label>
              </div>
            </div>

            {isMobile ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-2 mt-2 text-xs">
                <p className="text-yellow-500 font-medium">Tip: Check spam folder if email not received</p>
              </div>
            ) : (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-md p-3 mt-2">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-500">PDF Attachment</p>
                    <p className="text-xs text-gray-300 mt-1">
                      A PDF version of the assessment results will be automatically attached to the email for easy
                      viewing and printing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`${isMobile ? "pt-4 grid grid-cols-1 gap-2" : "pt-2 flex flex-col gap-3"}`}>
              <Button
                type="submit"
                disabled={status === "loading"}
                className={`${isMobile ? "h-12 text-base" : "py-6 text-base font-medium"} bg-red-600 hover:bg-red-700 w-full`}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 mr-1" />
                    <Mail className="h-5 w-5" />
                    {isMobile ? "Send Email" : "Send Assessment with PDF"}
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={status === "loading"}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
