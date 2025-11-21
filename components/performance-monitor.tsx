"use client"

import { useEffect } from "react"

export function PerformanceMonitor() {
  useEffect(() => {
    // Core Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry.startTime
          console.log("[v0] LCP:", lcp)

          // Track LCP in analytics
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "web_vitals", {
              event_category: "Web Vitals",
              event_label: "LCP",
              value: Math.round(lcp),
              custom_parameter_1: lcp < 2500 ? "good" : lcp < 4000 ? "needs_improvement" : "poor",
            })
          }
        }
      })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
          console.log("[v0] FID:", fid)

          if (typeof window.gtag !== "undefined") {
            window.gtag("event", "web_vitals", {
              event_category: "Web Vitals",
              event_label: "FID",
              value: Math.round(fid),
              custom_parameter_1: fid < 100 ? "good" : fid < 300 ? "needs_improvement" : "poor",
            })
          }
        }
      })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }

        console.log("[v0] CLS:", clsValue)

        if (typeof window.gtag !== "undefined") {
          window.gtag("event", "web_vitals", {
            event_category: "Web Vitals",
            event_label: "CLS",
            value: Math.round(clsValue * 1000),
            custom_parameter_1: clsValue < 0.1 ? "good" : clsValue < 0.25 ? "needs_improvement" : "poor",
          })
        }
      })

      try {
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
        fidObserver.observe({ type: "first-input", buffered: true })
        clsObserver.observe({ type: "layout-shift", buffered: true })
      } catch (error) {
        console.log("[v0] Performance Observer not supported:", error)
      }
    }

    // Page load performance
    const trackPageLoad = () => {
      if (typeof window !== "undefined" && window.performance) {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming

        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          windowLoad: navigation.loadEventEnd - navigation.navigationStart,
        }

        console.log("[v0] Page Load Metrics:", metrics)

        // Track in analytics
        if (typeof window.gtag !== "undefined") {
          Object.entries(metrics).forEach(([key, value]) => {
            window.gtag("event", "page_performance", {
              event_category: "Performance",
              event_label: key.toUpperCase(),
              value: Math.round(value),
            })
          })
        }
      }
    }

    // Initialize monitoring
    if (typeof window !== "undefined") {
      observeWebVitals()

      if (document.readyState === "complete") {
        trackPageLoad()
      } else {
        window.addEventListener("load", trackPageLoad)
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("load", trackPageLoad)
      }
    }
  }, [])

  return null
}
