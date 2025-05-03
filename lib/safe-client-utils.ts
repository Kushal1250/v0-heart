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
    return safeClientOperation(() => localStorage.getItem(key)) ?? null
  },

  setItem: (key: string, value: string): void => {
    safeClientOperation(() => localStorage.setItem(key, value))
  },

  removeItem: (key: string): void => {
    safeClientOperation(() => localStorage.removeItem(key))
  },
}

/**
 * Safely access sessionStorage with fallbacks
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    return safeClientOperation(() => sessionStorage.getItem(key)) ?? null
  },

  setItem: (key: string, value: string): void => {
    safeClientOperation(() => sessionStorage.setItem(key, value))
  },

  removeItem: (key: string): void => {
    safeClientOperation(() => sessionStorage.removeItem(key))
  },
}
