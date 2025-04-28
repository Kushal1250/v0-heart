"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, AlertCircle, CheckCircle2, AlertTriangle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import PdfGenerator from "@/components/pdf-generator"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EmailShareModalProps {
  assessmentData: any
  patientName?: string
}

export default function EmailShareModal({ assessmentData, patientName = "Patient" }: EmailShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [emailData, setEmailData] = useState({
    to: "",
    subject: `Health Assessment Results`,
    message: `I'm sharing my health assessment results. Please review the attached information.`,
    includePdfAttachment: true,
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "config-error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [emailConfigStatus, setEmailConfigStatus] = useState<null | "valid" | "invalid">(null)

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
        setStatus("config-error")
      }
    } catch (error) {
      setEmailConfigStatus("invalid")
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

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          assessmentData: assessmentData,
          includePdfAttachment: emailData.includePdfAttachment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setStatus("success")

      // Reset form after success
      setTimeout(() => {
        if (status === "success") {
          setIsOpen(false)
          setStatus("idle")
          setEmailData({
            to: "",
            subject: `Health Assessment Results`,
            message: `I'm sharing my health assessment results. Please review the attached information.`,
            includePdfAttachment: true,
          })
        }
      }, 3000)
    } catch (error) {
      console.error("Error sending email:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  // Generate a filename for the PDF based on date and risk level
  const pdfFileName = `health-assessment-${assessmentData.result.risk}-risk-${new Date().toISOString().split("T")[0]}`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-10 px-4">
          <Mail className="h-4 w-4" />
          <span>Email Results</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[450px] p-4 ${isMobile ? "w-[95%] rounded-lg" : ""}`} closeButton={false}>
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle>Share Results</DialogTitle>
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
          <div className="py-4">
            <Alert className="bg-green-900/20 border-green-600">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>Your assessment results have been sent successfully.</AlertDescription>
            </Alert>
          </div>
        ) : status === "config-error" ? (
          <div className="py-4">
            <Alert className="bg-red-900/20 border-red-600">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertTitle>Email Configuration Error</AlertTitle>
              <AlertDescription>The email service is not properly configured.</AlertDescription>
            </Alert>
            <div className="mt-4">
              <PdfGenerator contentRef={{ current: null }} fileName={pdfFileName} assessmentData={assessmentData} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            {status === "error" && (
              <Alert className="bg-red-900/20 border-red-600 py-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage || "Failed to send email. Please try again."}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="to" className="text-sm block mb-1.5">
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
                className="bg-gray-800 border-gray-700 h-11 w-full"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm block mb-1.5">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={emailData.subject}
                onChange={handleChange}
                required
                className="bg-gray-800 border-gray-700 h-11 w-full"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm block mb-1.5">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={emailData.message}
                onChange={handleChange}
                rows={isMobile ? 3 : 2}
                className="bg-gray-800 border-gray-700 resize-none w-full min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox"
                    id="includePdfAttachment"
                    name="includePdfAttachment"
                    checked={emailData.includePdfAttachment}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-700 bg-gray-800 h-5 w-5"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <Label htmlFor="includePdfAttachment" className="text-sm">
                    Include PDF attachment
                  </Label>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3 mt-2 text-xs">
                <p className="text-yellow-500 font-medium">Tip: Check spam folder if email not received</p>
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-2 mt-2 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-500">Important Note</p>
                    <p className="text-gray-300 mt-1">
                      If the recipient doesn't receive the email, check spam folder or use PDF download instead.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`${isMobile ? "pt-4 grid grid-cols-1 gap-2" : "pt-2 flex justify-end gap-2"}`}>
              {isMobile ? (
                <>
                  <Button type="submit" disabled={status === "loading"} className="h-12 text-base w-full">
                    {status === "loading" ? (
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      "Send Email"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={status === "loading"}
                    className="h-12 text-base w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={status === "loading"}
                    className="h-9"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={status === "loading"} className="h-9">
                    {status === "loading" ? "Sending..." : "Send Email"}
                  </Button>
                </>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
