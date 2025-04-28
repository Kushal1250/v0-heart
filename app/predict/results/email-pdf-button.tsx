"use client"

import EmailPdfShareModal from "@/components/email-pdf-share-modal"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EmailPdfButtonProps {
  assessmentData: any
}

export default function EmailPdfButton({ assessmentData }: EmailPdfButtonProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")

  return <EmailPdfShareModal assessmentData={assessmentData} />
}
