"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, AlertCircle, CheckCircle2, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EmailPdfButtonProps {
  assessmentData: any
  patientName?: string
}

export default function EmailPdfButton({ assessmentData, patientName = "Patient" }: EmailPdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [emailData, setEmailData] = useState({
    to: "",
    subject: `Health Assessment Results for ${patientName}`,
    message: `I'm sharing my health assessment results. Please review the attached PDF report.`,
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEmailData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

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

      // Use the API route that includes PDF attachment
      const response = await fetch("/api/email-with-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          message: emailData.message,
          assessmentData,
          userName: patientName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }

      setStatus("success")

      // Reset form after success
      setTimeout(() => {
        setIsOpen(false)
        setStatus("idle")
        setEmailData({
          to: "",
          subject: `Health Assessment Results for ${patientName}`,
          message: `I'm sharing my health assessment results. Please review the attached PDF report.`,
        })
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
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Email Assessment Results</DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your assessment results have been sent successfully with a PDF attachment.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage || "Failed to send email. Please try again."}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="to">Recipient Email</Label>
              <Input
                id="to"
                name="to"
                type="email"
                placeholder="doctor@example.com"
                value={emailData.to}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address of your healthcare provider or recipient
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={emailData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" value={emailData.message} onChange={handleChange} rows={3} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">PDF Attachment</p>
                  <p className="text-xs text-blue-700 mt-1">
                    A PDF version of the assessment results will be automatically attached to the email for easy viewing
                    and printing.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={status === "loading"}>
                Cancel
              </Button>
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </span>
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
