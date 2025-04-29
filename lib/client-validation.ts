/**
 * Client-side validation utilities
 * These functions are safe to use in client components
 */

/**
 * Validates if a phone number is in a valid format
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone is valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false

  // Basic validation - should have at least 10 digits
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10
}

/**
 * Validates if an email is in a valid format
 * @param email Email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formats a phone number for display
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return ""

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
  }

  // If it's not a 10-digit number, just return it with spaces
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ")
}
