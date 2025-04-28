/**
 * Safely parses JSON from a response, with error handling
 */
export async function safeParseJSON(response: Response) {
  try {
    return await response.json()
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
      const errorData = await response.json()
      if (errorData && errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
      // If JSON parsing fails, use the default error message
    }

    throw new Error(errorMessage)
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    throw new Error("Failed to parse response data")
  }
}
