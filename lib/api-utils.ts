/**
 * Safely parses JSON from a response, with error handling
 */
export async function safeParseJSON(response: Response) {
  try {
    // Check if the response is empty
    const text = await response.text()
    if (!text || text.trim() === "") {
      console.error("Empty response received")
      return null
    }

    // Parse the text as JSON
    return JSON.parse(text)
  } catch (error) {
    console.error("Error parsing JSON response:", error)
    return null
  }
}

/**
 * Handles API responses with proper error handling
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`

    try {
      // Get the response text first
      const text = await response.text()

      // Only try to parse as JSON if there's content
      if (text && text.trim() !== "") {
        try {
          const errorData = JSON.parse(text)
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          // If JSON parsing fails, use the text as the error message
          errorMessage = text || errorMessage
        }
      }
    } catch (e) {
      // If text extraction fails, use the default error message
    }

    throw new Error(errorMessage)
  }

  try {
    // Get the response text first
    const text = await response.text()

    // Check if the response is empty
    if (!text || text.trim() === "") {
      throw new Error("Empty response received from server")
    }

    // Parse the text as JSON
    return JSON.parse(text) as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse response data: Invalid JSON")
    }
    throw error
  }
}

/**
 * Makes an authenticated fetch request with the session token
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Get the session token from cookies
  const cookies = document.cookie.split(";")
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("session="))
  const sessionToken = sessionCookie ? sessionCookie.trim().split("=")[1] : null

  // Prepare headers with authentication
  const headers = new Headers(options.headers || {})
  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`)
  }

  // Return the fetch with updated options
  return fetch(url, {
    ...options,
    headers,
  })
}
