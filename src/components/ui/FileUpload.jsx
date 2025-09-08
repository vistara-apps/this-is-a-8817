import React, { useState, useRef, useCallback } from 'react'
import { useFileUpload } from '../../hooks/useApi'
import { Button } from './Button'
import { ProgressBar } from './ProgressBar'
import { Upload, X, File, Image, Video, FileText, ExternalLink } from 'lucide-react'

const ACCEPTED_FILE_TYPES = {
  image: {
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: Image,
    label: 'Images'
  },
  video: {
    accept: 'video/*',
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: Video,
    label: 'Videos'
  },
  document: {
    accept: '.pdf,.doc,.docx,.txt,.md',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: FileText,
    label: 'Documents'
  },
  any: {
    accept: '*/*',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: File,
    label: 'Files'
  }
}

export const FileUpload = ({ 
  onFileUploaded, 
  onError,
  acceptedTypes = ['any'],
  multiple = false,
  className = '',
  disabled = false,
  children
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const { uploadFile, uploadProgress, loading, error } = useFileUpload()
  const inputRef = useRef(null)

  const getAcceptString = useCallback(() => {
    return acceptedTypes.map(type => ACCEPTED_FILE_TYPES[type]?.accept || '*/*').join(',')
  }, [acceptedTypes])

  const getMaxSize = useCallback(() => {
    return Math.max(...acceptedTypes.map(type => ACCEPTED_FILE_TYPES[type]?.maxSize || 0))
  }, [acceptedTypes])

  const validateFile = useCallback((file) => {
    const maxSize = getMaxSize()
    
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }

    const isValidType = acceptedTypes.some(type => {
      const config = ACCEPTED_FILE_TYPES[type]
      if (type === 'any') return true
      
      if (type === 'image') return file.type.startsWith('image/')
      if (type === 'video') return file.type.startsWith('video/')
      if (type === 'document') {
        const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md']
        return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      }
      
      return false
    })

    if (!isValidType) {
      const typeLabels = acceptedTypes.map(type => ACCEPTED_FILE_TYPES[type]?.label).join(', ')
      return `Please select a valid file type: ${typeLabels}`
    }

    return null
  }, [acceptedTypes, getMaxSize])

  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files)
    const validFiles = []
    const errors = []

    // Validate all files first
    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    // Report validation errors
    if (errors.length > 0) {
      onError?.(errors.join('\n'))
      return
    }

    // Upload valid files
    setUploadingFiles(validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    })))

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          const result = await uploadFile(file, 'resource', (progress) => {
            setUploadingFiles(prev => prev.map((item, i) => 
              i === index ? { ...item, progress } : item
            ))
          })

          setUploadingFiles(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'completed', result } : item
          ))

          return result
        } catch (err) {
          setUploadingFiles(prev => prev.map((item, i) => 
            i === index ? { ...item, status: 'error', error: err.message } : item
          ))
          throw err
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const successfulUploads = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)

      if (successfulUploads.length > 0) {
        onFileUploaded?.(multiple ? successfulUploads : successfulUploads[0])
      }

      // Clear uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([])
      }, 2000)

    } catch (err) {
      onError?.(err.message || 'Upload failed')
    }
  }, [uploadFile, validateFile, multiple, onFileUploaded, onError])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles, disabled])

  const handleInputChange = useCallback((e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = ''
  }, [handleFiles])

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    if (file.name.toLowerCase().match(/\.(pdf|doc|docx|txt|md)$/)) return FileText
    return File
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={getAcceptString()}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {children || (
          <>
            <Upload className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-primary font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-text-secondary caption">
              Supports: {acceptedTypes.map(type => ACCEPTED_FILE_TYPES[type]?.label).join(', ')}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              Max size: {formatFileSize(getMaxSize())}
            </p>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((item, index) => {
            const IconComponent = getFileIcon(item.file)
            
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-surface rounded-lg border">
                <IconComponent className="h-5 w-5 text-text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="caption font-medium text-text-primary truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatFileSize(item.file.size)}
                  </p>
                  {item.status === 'uploading' && (
                    <ProgressBar value={item.progress} className="mt-1" />
                  )}
                  {item.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                  {item.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-1">Upload complete</p>
                  )}
                </div>
                {item.status === 'completed' && (
                  <div className="text-green-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error.message || error}
        </div>
      )}
    </div>
  )
}

export const URLInput = ({ 
  onUrlAdded, 
  placeholder = "Enter URL...",
  className = '',
  disabled = false 
}) => {
  const [url, setUrl] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const validateUrl = useCallback((urlString) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!url.trim()) return
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // Basic URL validation - in a real app, you might want to check if the URL is accessible
      onUrlAdded?.({
        url: url.trim(),
        type: 'link',
        name: url.trim()
      })
      setUrl('')
    } catch (err) {
      setError('Invalid URL')
    } finally {
      setIsValidating(false)
    }
  }, [url, validateUrl, onUrlAdded])

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1">
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isValidating}
              className="flex h-10 w-full rounded-md border border-border bg-surface pl-10 pr-3 py-2 text-sm placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={!url.trim() || isValidating || disabled}
          size="sm"
        >
          {isValidating ? 'Validating...' : 'Add URL'}
        </Button>
      </form>
    </div>
  )
}
