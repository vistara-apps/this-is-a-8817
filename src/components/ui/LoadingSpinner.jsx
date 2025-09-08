import React from 'react'
import { Loader2 } from 'lucide-react'

export const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  text = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && (
          <p className="text-text-secondary text-sm">{text}</p>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  showAvatar = false,
  showButton = false 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-4 bg-gray-200 rounded ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
          {showButton && (
            <div className="h-8 w-20 bg-gray-200 rounded mt-3"></div>
          )}
        </div>
      </div>
    </div>
  )
}

export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <SkeletonLoader lines={3} showButton />
    </div>
  )
}

export const PathCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Image placeholder */}
        <div className="h-48 bg-gray-200"></div>
        
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          
          {/* Meta info */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Button */}
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export const ListSkeleton = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonLoader key={index} lines={2} showAvatar />
      ))}
    </div>
  )
}
