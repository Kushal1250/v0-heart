"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Database,
  FileText,
  User,
  Shield,
  Mail,
  MessageSquare,
  Activity,
  BarChart2,
  AlertTriangle,
  Settings,
} from "lucide-react"

export default function SystemPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/user")
        const data = await response.json()

        if (data.user && data.user.role === "admin") {
          setIsAdmin(true)
        } else {
          setError("Not authenticated as admin. Please login again.")
          setTimeout(() => {
            router.push("/admin-login?redirect=/admin/system")
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setError("Error checking admin status")
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0a14]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-gray-400">Loading system page...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 bg-[#0a0a14] text-white min-h-screen">
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-md">
          <p className="text-red-200">You do not have permission to access this page.</p>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push("/admin-login?redirect=/admin/system")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Login as Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-[#0a0a14] text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">System Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Management */}
        <div className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
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
              <Database className="h-5 w-5 mr-2" />
              Run Migration
            </Link>
            <Link
              href="/admin/database-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <FileText className="h-5 w-5 mr-2" />
              Database Diagnostics
            </Link>
          </div>
        </div>

        {/* Authentication Systems */}
        <div className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
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
              <User className="h-5 w-5 mr-2" />
              Fix Verification System
            </Link>
            <Link
              href="/admin/reset-token-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Shield className="h-5 w-5 mr-2" />
              Fix Password Reset System
            </Link>
          </div>
        </div>

        {/* Notification Services */}
        <div className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
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
              <Mail className="h-5 w-5 mr-2" />
              Email Settings
            </Link>
            <Link
              href="/admin/sms-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              SMS Settings
            </Link>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">System Diagnostics</h2>
          <p className="text-gray-400 text-sm mb-4">Debug and repair tools</p>

          <div className="space-y-3">
            <Link
              href="/admin/diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Activity className="h-5 w-5 mr-2" />
              General Diagnostics
            </Link>
            <Link
              href="/admin/email-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Diagnostics
            </Link>
            <Link
              href="/admin/sms-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              SMS Diagnostics
            </Link>
            <Link
              href="/admin/fix-issues"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Fix System Issues
            </Link>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="p-6 bg-[#0f0f1a] border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-1">Admin Tools</h2>
          <p className="text-gray-400 text-sm mb-4">Additional administrative tools</p>

          <div className="space-y-3">
            <Link
              href="/admin/system-health"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              System Health
            </Link>
            <Link
              href="/admin/detailed-db-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Database className="h-5 w-5 mr-2" />
              Detailed DB Diagnostics
            </Link>
            <Link
              href="/admin/reset-token-diagnostics"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Shield className="h-5 w-5 mr-2" />
              Reset Token Diagnostics
            </Link>
            <Link
              href="/admin/fix-database"
              className="flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252547] text-white py-2 px-4 rounded w-full"
            >
              <Settings className="h-5 w-5 mr-2" />
              Fix Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
