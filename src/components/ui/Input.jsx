import React from 'react'

export const Input = React.forwardRef(({ 
  className = '', 
  type = 'text',
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})

export const Textarea = React.forwardRef(({ 
  className = '', 
  ...props 
}, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})