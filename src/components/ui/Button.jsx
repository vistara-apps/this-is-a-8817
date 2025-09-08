import React from 'react'

export const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    default: 'bg-primary text-white hover:bg-blue-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-border bg-surface hover:bg-gray-100',
    ghost: 'hover:bg-gray-100'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8',
    icon: 'h-10 w-10'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}