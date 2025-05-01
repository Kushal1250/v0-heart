"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserDetailsModalProps {
  user: {
    id: string
    name: string
    email: string
    password: string
    phone: string
    role: string
    provider: string
    created_at: string
  }
  onClose: () => void
  onMakeAdmin: (userId: string) => void
  onResetPassword: (userId: string) => void
  onDelete: (userId: string) => void
}

export function UserDetailsModal({ user, onClose, onMakeAdmin, onResetPassword, onDelete }: UserDetailsModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const formattedDate = new Date(user.created_at).toLocaleString()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full text-white">
        <h2 className="text-xl font-bold mb-4">User Details</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span>{user.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span>{user.email}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Password</span>
            <div className="flex items-center">
              <div className="bg-gray-800 rounded px-2 py-1 mr-2">
                {showPassword ? user.password : "•".repeat(Math.min(8, user.password.length))}
              </div>
              <button
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span>{user.phone || "Not provided"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span className="bg-gray-800 rounded px-2 py-0.5">{user.role}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Provider</span>
            <span className="bg-gray-800 rounded px-2 py-0.5">{user.provider}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Created</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {user.role !== "admin" && (
            <Button variant="outline" className="flex-1" onClick={() => onMakeAdmin(user.id)}>
              Make Admin
            </Button>
          )}

          <Button variant="outline" className="flex-1" onClick={() => onResetPassword(user.id)}>
            Reset Password
          </Button>

          <Button variant="destructive" className="flex-1" onClick={() => onDelete(user.id)}>
            Delete
          </Button>

          <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
