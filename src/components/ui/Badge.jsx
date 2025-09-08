import React from 'react'

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'
  
  const variants = {
    default: 'bg-primary text-white',
    secondary: 'bg-gray-100 text-text-primary',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
  }
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}