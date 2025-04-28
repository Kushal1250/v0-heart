"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ArrowRight } from "lucide-react"

interface AssessmentConfirmationProps {
  onConfirm: () => void
}

export function AssessmentConfirmation({ onConfirm }: AssessmentConfirmationProps) {
  const router = useRouter()

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Create New Health Assessment</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This assessment will help you understand your heart health risk factors and provide personalized
              recommendations.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Health Assessment</AlertDialogTitle>
                <AlertDialogDescription>
                  Would you like to proceed with creating a new health assessment? This will help us evaluate your heart
                  disease risk.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>Yes, Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="text-sm text-gray-500">
            <p>The assessment takes approximately 2-3 minutes to complete.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
