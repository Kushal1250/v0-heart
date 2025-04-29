"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { changeUserEmail } from "@/lib/simplified-history"

interface EmailChangeFormProps {
  currentEmail: string
  onEmailChange: (newEmail: string) => void
  compact?: boolean
}

export function EmailChangeForm({ currentEmail, onEmailChange, compact = false }: EmailChangeFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [email, setEmail] = useState(currentEmail)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email cannot be empty")
      return
    }

    const success = changeUserEmail(email)

    if (success) {
      onEmailChange(email)
      setIsEditing(false)
      setError("")
    } else {
      setError("Failed to change email")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEmail(currentEmail)
    setError("")
  }

  if (!isEditing) {
    return (
      <div className="flex items-center">
        <span className={compact ? "text-sm" : ""}>{currentEmail}</span>
        <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setIsEditing(true)}>
          Change
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className={compact ? "h-8 text-sm" : ""}
          autoFocus
        />
        <Button type="submit" size={compact ? "sm" : "default"}>
          Save
        </Button>
        <Button type="button" variant="outline" size={compact ? "sm" : "default"} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </form>
  )
}
