"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText } from "lucide-react"

interface PdfPreviewModalProps {
  pdfUrl: string
  fileName: string
}

export default function PdfPreviewModal({ pdfUrl, fileName }: PdfPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Preview PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]" closeButton={false}>
        <DialogHeader>
          <DialogTitle>PDF Preview: {fileName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 h-[60vh] border rounded">
          <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
