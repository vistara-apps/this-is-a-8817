import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './Button'
import { Card, CardHeader, CardTitle, CardContent } from './Card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    })

    // Log to error reporting service
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    console.error('Error Boundary caught an error:', {
      error: error.toString(),
      errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // Example: Send to error reporting service
    // errorReportingService.captureException(error, {
    //   extra: errorInfo,
    //   tags: {
    //     component: 'ErrorBoundary',
    //     errorId: this.state.errorId
    //   }
    // })
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state
    const bugReport = {
      errorId,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Create mailto link with bug report
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`)
    const body = encodeURIComponent(`
Please describe what you were doing when this error occurred:

[Your description here]

---
Technical Details:
${JSON.stringify(bugReport, null, 2)}
    `)
    
    window.open(`mailto:support@pathways.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state
      const { fallback: CustomFallback, showDetails = false } = this.props

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            onReportBug={this.handleReportBug}
          />
        )
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-text-secondary mb-4">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
                
                {errorId && (
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-text-secondary">
                      Error ID: <code className="font-mono text-text-primary">{errorId}</code>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReportBug}
                  className="flex items-center space-x-2"
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Bug</span>
                </Button>
              </div>

              {showDetails && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                    Show technical details
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg overflow-auto">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-text-primary mb-1">Error:</h4>
                        <pre className="text-xs text-red-600 whitespace-pre-wrap">
                          {error.toString()}
                        </pre>
                      </div>
                      
                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-sm text-text-primary mb-1">Stack Trace:</h4>
                          <pre className="text-xs text-text-secondary whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-sm text-text-primary mb-1">Component Stack:</h4>
                          <pre className="text-xs text-text-secondary whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error boundary (for functional components)
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error, errorInfo = {}) => {
    setError({ error, errorInfo })
    
    // Log to console and error reporting service
    console.error('Error captured:', error, errorInfo)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error.error
    }
  }, [error])

  return {
    captureError,
    resetError
  }
}
