/**
 * Client-side validation utilities
 * These functions are safe to use in client components
 */

/**
 * Validates if an email address is in a valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates if a phone number is in a valid format
 * This is a basic validation that just checks for minimum length
 */
export function isValidPhone(phone: string): boolean {
  // Basic phone validation - should have at least 10 digits and start with + for international format
  const phoneDigits = phone.replace(/\D/g, "")
  return phoneDigits.length >= 10 && phone.includes("+")
}

/**
 * Formats a phone number for display
 * This is a simple formatter that adds parentheses and hyphens
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Format based on length
  if (digits.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // Format as +1 (XXX) XXX-XXXX
    return `+1 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`
  }

  // Return as is if it doesn't match expected formats
  return phone
}

// Update the isStrongPassword function to check for all requirements
export function isStrongPassword(password: string): boolean {
  const minLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
}

// Add a function to check individual password requirements
export function checkPasswordRequirements(password: string): {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
} {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }
}
