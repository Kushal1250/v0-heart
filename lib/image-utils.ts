/**
 * Utility functions for image processing
 */

/**
 * Resizes an image data URL to a maximum width/height while maintaining aspect ratio
 * @param dataUrl The original image data URL
 * @param maxDimension Maximum width or height in pixels
 * @param quality JPEG quality (0-1)
 * @returns A promise that resolves to the resized image data URL
 */
export async function resizeImageDataUrl(dataUrl: string, maxDimension = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // For better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        // Convert back to data URL
        const resizedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(resizedDataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = dataUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Checks if an image data URL is valid
 * @param dataUrl The image data URL to validate
 * @returns A promise that resolves to a boolean indicating if the image is valid
 */
export async function isValidImageDataUrl(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      resolve(false)
      return
    }

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

/**
 * Converts a File object to a data URL
 * @param file The file to convert
 * @returns A promise that resolves to the data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Creates a placeholder image URL
 * @param width Width of the placeholder image
 * @param height Height of the placeholder image
 * @param text Text to display in the placeholder
 * @returns A placeholder image URL
 */
export function createPlaceholderImage(width = 200, height = 200, text = "user profile"): string {
  return `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(text)}`
}
