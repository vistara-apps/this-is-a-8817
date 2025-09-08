import React from 'react'
import { AlertCircle, XCircle, AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'

const ERROR_TYPES = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500'
  },
  info: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  }
}

export const ErrorMessage = ({
  type = 'error',
  title,
  message,
  details,
  onRetry,
  onDismiss,
  showRetry = false,
  showDismiss = false,
  className = '',
  compact = false
}) => {
  const config = ERROR_TYPES[type] || ERROR_TYPES.error
  const Icon = config.icon

  if (compact) {
    return (
      <div className={`
        flex items-center space-x-2 p-2 rounded-md
        ${config.bgColor} ${config.borderColor} border
        ${className}
      `}>
        <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconColor}`} />
        <span className={`text-sm ${config.textColor}`}>
          {message || title}
        </span>
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-auto ${config.textColor} hover:opacity-70`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <Card className={`${config.borderColor} border ${className}`}>
      <CardContent className={`${config.bgColor} p-4`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`font-medium ${config.textColor} mb-1`}>
                {title}
              </h3>
            )}
            
            {message && (
              <p className={`text-sm ${config.textColor} ${title ? 'opacity-90' : ''}`}>
                {message}
              </p>
            )}
            
            {details && (
              <details className="mt-2">
                <summary className={`cursor-pointer text-sm ${config.textColor} opacity-75 hover:opacity-100`}>
                  Show details
                </summary>
                <div className={`mt-2 text-xs ${config.textColor} opacity-75`}>
                  <pre className="whitespace-pre-wrap font-mono">
                    {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              </details>
            )}
            
            {(showRetry || showDismiss) && (
              <div className="flex items-center space-x-2 mt-3">
                {showRetry && onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                    className="flex items-center space-x-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry</span>
                  </Button>
                )}
                
                {showDismiss && onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className={config.textColor}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {showDismiss && onDismiss && !showRetry && (
            <button
              onClick={onDismiss}
              className={`${config.textColor} hover:opacity-70`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specific error message components
export const NetworkError = ({ onRetry, onDismiss, ...props }) => (
  <ErrorMessage
    type="error"
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    onDismiss={onDismiss}
    showRetry={!!onRetry}
    showDismiss={!!onDismiss}
    {...props}
  />
)

export const ValidationError = ({ errors = [], onDismiss, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Validation Error"
    message={Array.isArray(errors) ? errors.join(', ') : errors}
    onDismiss={onDismiss}
    showDismiss={!!onDismiss}
    {...props}
  />
)

export const NotFoundError = ({ resource = 'Resource', onGoBack, ...props }) => (
  <ErrorMessage
    type="info"
    title={`${resource} Not Found`}
    message={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`}
    onRetry={onGoBack}
    showRetry={!!onGoBack}
    {...props}
  />
)

export const PermissionError = ({ action = 'perform this action', onDismiss, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Permission Denied"
    message={`You don't have permission to ${action}. Please contact an administrator if you believe this is an error.`}
    onDismiss={onDismiss}
    showDismiss={!!onDismiss}
    {...props}
  />
)

export const ServerError = ({ onRetry, onDismiss, ...props }) => (
  <ErrorMessage
    type="error"
    title="Server Error"
    message="Something went wrong on our end. Our team has been notified and is working to fix the issue."
    onRetry={onRetry}
    onDismiss={onDismiss}
    showRetry={!!onRetry}
    showDismiss={!!onDismiss}
    {...props}
  />
)

// Hook for managing error states
export const useErrorMessage = () => {
  const [error, setError] = React.useState(null)

  const showError = React.useCallback((errorData) => {
    if (typeof errorData === 'string') {
      setError({ message: errorData })
    } else {
      setError(errorData)
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const showNetworkError = React.useCallback((onRetry) => {
    setError({
      type: 'network',
      onRetry
    })
  }, [])

  const showValidationError = React.useCallback((errors) => {
    setError({
      type: 'validation',
      errors
    })
  }, [])

  const showPermissionError = React.useCallback((action) => {
    setError({
      type: 'permission',
      action
    })
  }, [])

  const showServerError = React.useCallback((onRetry) => {
    setError({
      type: 'server',
      onRetry
    })
  }, [])

  const renderError = React.useCallback(() => {
    if (!error) return null

    const commonProps = {
      onDismiss: clearError,
      ...error
    }

    switch (error.type) {
      case 'network':
        return <NetworkError {...commonProps} />
      case 'validation':
        return <ValidationError {...commonProps} />
      case 'permission':
        return <PermissionError {...commonProps} />
      case 'server':
        return <ServerError {...commonProps} />
      default:
        return <ErrorMessage {...commonProps} />
    }
  }, [error, clearError])

  return {
    error,
    showError,
    clearError,
    showNetworkError,
    showValidationError,
    showPermissionError,
    showServerError,
    renderError
  }
}
