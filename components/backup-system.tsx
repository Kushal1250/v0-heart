"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Download, RotateCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function BackupSystem() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const { toast } = useToast()

  const handleBackup = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/backup-system", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create backup")
      }

      const data = await response.json()
      setLastBackup(new Date().toLocaleString())

      toast({
        title: "Backup created successfully",
        description: `Backup ID: ${data.backupId}`,
      })
    } catch (error) {
      console.error("Backup error:", error)
      toast({
        title: "Backup failed",
        description: "There was an error creating the backup.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">System Backup</CardTitle>
        <CardDescription>Create and manage system backups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last backup:</span>
            <span className="text-sm font-medium">{lastBackup || "No recent backups"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create System Backup</AlertDialogTitle>
              <AlertDialogDescription>
                This will create a backup of all system settings and configurations. This process may take a few moments
                to complete.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBackup} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Backup"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
