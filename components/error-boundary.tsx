"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    })

    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleRefresh = (): void => {
    // Clear any cached error state
    try {
      sessionStorage.removeItem("lastError")
      localStorage.removeItem("errorState")
    } catch (e) {
      // Ignore errors in private browsing mode
    }

    // Reload the page
    window.location.reload()
  }

  private handleGoHome = (): void => {
    // Navigate to home page
    window.location.href = "/"
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6 text-center">
              We're sorry, but an error occurred while loading the application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleRefresh} className="flex items-center justify-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleGoHome}>
                Go to Home Page
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded overflow-auto text-sm">
                <p className="font-bold text-red-600">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-gray-700 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
