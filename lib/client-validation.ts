/**
 * Client-side validation functions that don't require server modules
 */

/**
 * Validate if a phone number is in a valid format (client-side version)
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone is valid
 */
export function isValidPhone(phone: string): boolean {
  // Basic validation - should have at least 10 digits
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10
}

/**
 * Format a phone number to E.164 format (+1234567890) (client-side version)
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneToE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // If the number doesn't start with a country code, add +1 (US/Canada)
  if (!phone.startsWith("+")) {
    // If it's a 10-digit number, assume US/Canada and add +1
    if (digits.length === 10) {
      return `+1${digits}`
    }
    // If it already has a country code (11+ digits), add +
    return `+${digits}`
  }

  return phone // Already in E.164 format
}

/**
 * Validate if an email is in a valid format
 * @param email Email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
