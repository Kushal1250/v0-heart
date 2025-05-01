"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SystemPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()

        if (data.user && data.user.role === "admin") {
          setIsAdmin(true)
        } else {
          router.push("/admin-login")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/admin-login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <div className="container mx-auto p-4 bg-[#0a0a14] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">System Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Management */}
        <Card className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">Database Management</h2>
          <p className="text-gray-400 text-sm mb-4">Manage database and migrations</p>

          <div className="flex justify-between items-center mb-2">
            <span>Database Status:</span>
            <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">Unknown</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span>Last Migration:</span>
            <span className="text-gray-400">Unknown</span>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/migrate"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Run Migration
            </Link>
            <Link
              href="/admin/database-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Database Diagnostics
            </Link>
          </div>
        </Card>

        {/* Authentication Systems */}
        <Card className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">Authentication Systems</h2>
          <p className="text-gray-400 text-sm mb-4">Fix auth related issues</p>

          <div className="flex justify-between items-center mb-2">
            <span>Verification System:</span>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-xs">Not Configured</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span>Password Reset System:</span>
            <span className="bg-green-900 text-white px-2 py-1 rounded text-xs">Active</span>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/verification-settings"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Fix Verification System
            </Link>
            <Link
              href="/admin/reset-token-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Fix Password Reset System
            </Link>
          </div>
        </Card>

        {/* Notification Services */}
        <Card className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">Notification Services</h2>
          <p className="text-gray-400 text-sm mb-4">Manage email and SMS services</p>

          <div className="flex justify-between items-center mb-2">
            <span>Email Service:</span>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-xs">Not Configured</span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span>SMS Service:</span>
            <span className="bg-red-900 text-white px-2 py-1 rounded text-xs">Not Configured</span>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/email-settings"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Settings
            </Link>
            <Link
              href="/admin/sms-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              SMS Settings
            </Link>
          </div>
        </Card>

        {/* System Diagnostics */}
        <Card className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">System Diagnostics</h2>
          <p className="text-gray-400 text-sm mb-4">Debug and repair tools</p>

          <div className="space-y-3">
            <Link
              href="/admin/diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              General Diagnostics
            </Link>
            <Link
              href="/admin/email-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Diagnostics
            </Link>
            <Link
              href="/admin/sms-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              SMS Diagnostics
            </Link>
            <Link
              href="/admin/fix-issues"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Fix System Issues
            </Link>
          </div>
        </Card>

        {/* Admin Tools */}
        <Card className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">Admin Tools</h2>
          <p className="text-gray-400 text-sm mb-4">Additional administrative tools</p>

          <div className="space-y-3">
            <Link
              href="/admin/system-health"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              System Health
            </Link>
            <Link
              href="/admin/detailed-db-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              Detailed DB Diagnostics
            </Link>
            <Link
              href="/admin/reset-token-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Reset Token Diagnostics
            </Link>
            <Link
              href="/admin/fix-database"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Fix Database
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
