"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneVerification } from "@/components/phone-verification"
import { TwoFactorAuth } from "@/components/two-factor-auth"
import { Shield, Mail, Phone, CheckCircle2 } from "lucide-react"

interface UserSecurityInfo {
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
}

export function SecuritySettingsSection() {
  const [securityInfo, setSecurityInfo] = useState<UserSecurityInfo>({
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSecurityInfo = async () => {
      try {
        const response = await fetch("/api/user/security-info")
        if (response.ok) {
          const data = await response.json()
          setSecurityInfo(data)
        }
      } catch (error) {
        console.error("Error fetching security info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityInfo()
  }, [])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>Manage your account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 py-4 border-b">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${securityInfo.twoFactorEnabled ? "text-green-500" : "text-red-500"}`}>
              {securityInfo.twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
            {/* Use the TwoFactorAuth component with proper props */}
            <TwoFactorAuth isEnabled={securityInfo.twoFactorEnabled} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 py-4 border-b">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email Verification
            </h3>
            <p className="text-sm text-muted-foreground">Verify your email address</p>
          </div>
          <div className="flex items-center gap-2">
            {securityInfo.emailVerified ? (
              <span className="flex items-center text-green-500 text-sm">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Verified
              </span>
            ) : (
              <button className="text-sm text-blue-500 hover:underline">Verify Email</button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 py-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium flex items-center">
              <Phone className="mr-2 h-4 w-4" />
              Phone Verification
            </h3>
            <p className="text-sm text-muted-foreground">Verify your phone number</p>
          </div>
          <div className="flex items-center gap-2">
            {securityInfo.phoneVerified ? (
              <span className="flex items-center text-green-500 text-sm">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Verified
              </span>
            ) : (
              <PhoneVerification />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
