/**
 * Utility functions for image processing and handling
 */

/**
 * Resizes an image data URL to the specified dimensions
 * @param dataUrl - The data URL of the image
 * @param maxWidth - Maximum width of the resized image
 * @param maxHeight - Maximum height of the resized image
 * @param quality - Quality of the output image (0-1)
 * @returns A promise that resolves to the resized image data URL
 */
export async function resizeImageDataUrl(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to data URL
        const resizedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(resizedDataUrl)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = dataUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Checks if a string is a valid image data URL
 * @param dataUrl - The string to check
 * @returns Boolean indicating if the string is a valid image data URL
 */
export function isValidImageDataUrl(dataUrl: string): boolean {
  if (!dataUrl) return false

  // Check if it's a data URL
  if (!dataUrl.startsWith("data:image/")) return false

  // Check if it has the correct format
  const regex = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/
  return regex.test(dataUrl)
}

/**
 * Converts a File object to a data URL
 * @param file - The File object to convert
 * @returns A promise that resolves to the data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert file to data URL"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Creates a placeholder image URL with the specified dimensions and query
 * @param width - Width of the placeholder image
 * @param height - Height of the placeholder image
 * @param query - Query to describe the image content
 * @returns The placeholder image URL
 */
export function createPlaceholderImage(width = 400, height = 400, query = "abstract profile picture"): string {
  return `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(query)}`
}

/**
 * Adds a cache-busting parameter to an image URL
 * @param url - The image URL
 * @returns The URL with a cache-busting parameter
 */
export function addCacheBuster(url: string): string {
  if (!url) return url

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}t=${Date.now()}`
}
