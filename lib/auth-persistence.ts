/**
 * Utility functions to help with authentication persistence
 */

// Function to check if the session is valid based on localStorage
export function isSessionValid(): boolean {
  try {
    const userExpiry = localStorage.getItem("userExpiry")
    if (!userExpiry) return false

    const expiryTime = Number.parseInt(userExpiry, 10)
    return new Date().getTime() < expiryTime
  } catch (error) {
    console.error("Error checking session validity:", error)
    return false
  }
}

// Function to refresh the session expiry time
export function refreshSessionExpiry(): void {
  try {
    // Set expiry to 2 hours from now
    localStorage.setItem("userExpiry", (new Date().getTime() + 2 * 60 * 60 * 1000).toString())
  } catch (error) {
    console.error("Error refreshing session expiry:", error)
  }
}

// Function to get cached user data
export function getCachedUser() {
  try {
    const cachedUser = localStorage.getItem("user")
    return cachedUser ? JSON.parse(cachedUser) : null
  } catch (error) {
    console.error("Error getting cached user:", error)
    return null
  }
}

// Function to clear all auth-related data
export function clearAuthData(): void {
  localStorage.removeItem("user")
  localStorage.removeItem("userExpiry")
  document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
}
