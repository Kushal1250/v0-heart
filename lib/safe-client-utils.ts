/**
 * Safely executes a function only on the client side
 * @param fn Function to execute
 * @returns The result of the function or undefined if not on client
 */
export function safeClientOperation<T>(fn: () => T): T | undefined {
  if (typeof window !== "undefined") {
    try {
      return fn()
    } catch (error) {
      console.error("Safe client operation failed:", error)
      return undefined
    }
  }
  return undefined
}

/**
 * Safely access localStorage with fallbacks
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    return (
      safeClientOperation(() => {
        try {
          return localStorage.getItem(key)
        } catch (e) {
          console.error("localStorage.getItem failed:", e)
          return null
        }
      }) ?? null
    )
  },

  setItem: (key: string, value: string): void => {
    safeClientOperation(() => {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        console.error("localStorage.setItem failed:", e)
      }
    })
  },

  removeItem: (key: string): void => {
    safeClientOperation(() => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error("localStorage.removeItem failed:", e)
      }
    })
  },
}

/**
 * Safely access sessionStorage with fallbacks
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    return (
      safeClientOperation(() => {
        try {
          return sessionStorage.getItem(key)
        } catch (e) {
          console.error("sessionStorage.getItem failed:", e)
          return null
        }
      }) ?? null
    )
  },

  setItem: (key: string, value: string): void => {
    safeClientOperation(() => {
      try {
        sessionStorage.setItem(key, value)
      } catch (e) {
        console.error("sessionStorage.setItem failed:", e)
      }
    })
  },

  removeItem: (key: string): void => {
    safeClientOperation(() => {
      try {
        sessionStorage.removeItem(key)
      } catch (e) {
        console.error("sessionStorage.removeItem failed:", e)
      }
    })
  },
}
