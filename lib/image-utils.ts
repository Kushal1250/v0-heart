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
export async function resizeImageDataUrl(dataUrl: string, maxDimension = 1200, quality = 0.8): Promise<string> {
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
