export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now()

  const result = fn()

  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now()
      console.log(`[v0] ${name} took ${end - start} milliseconds`)
    })
  } else {
    const end = performance.now()
    console.log(`[v0] ${name} took ${end - start} milliseconds`)
  }
}

export function preloadResource(href: string, as: string) {
  if (typeof document !== "undefined") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }
}

export function prefetchPage(href: string) {
  if (typeof document !== "undefined") {
    const link = document.createElement("link")
    link.rel = "prefetch"
    link.href = href
    document.head.appendChild(link)
  }
}

export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  startTimer(name: string): void {
    this.metrics.set(name, performance.now())
  }

  endTimer(name: string): number {
    const start = this.metrics.get(name)
    if (!start) {
      console.warn(`[v0] Timer ${name} was not started`)
      return 0
    }

    const duration = performance.now() - start
    this.metrics.delete(name)
    console.log(`[v0] ${name}: ${duration.toFixed(2)}ms`)

    return duration
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }
}
