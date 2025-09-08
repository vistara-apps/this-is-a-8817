import React, { useState, useCallback } from 'react'
import { FileUpload, URLInput } from '../ui/FileUpload'
import { Button } from '../ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'
import { 
  Upload, 
  Link, 
  Youtube, 
  FileText, 
  Image, 
  Video, 
  Trash2,
  Eye,
  Download,
  ExternalLink
} from 'lucide-react'

const RESOURCE_TYPES = {
  file: {
    label: 'Upload File',
    icon: Upload,
    description: 'Upload documents, images, or videos from your device'
  },
  url: {
    label: 'External Link',
    icon: Link,
    description: 'Link to external resources, websites, or documents'
  },
  youtube: {
    label: 'YouTube Video',
    icon: Youtube,
    description: 'Embed YouTube videos directly in your module'
  },
  text: {
    label: 'Text Content',
    icon: FileText,
    description: 'Add rich text content directly in the module'
  }
}

const getResourceIcon = (resource) => {
  if (resource.type === 'file') {
    if (resource.mimeType?.startsWith('image/')) return Image
    if (resource.mimeType?.startsWith('video/')) return Video
    return FileText
  }
  if (resource.type === 'youtube') return Youtube
  if (resource.type === 'url') return ExternalLink
  return FileText
}

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url)
}

export const ResourceUploader = ({ 
  onResourceAdded, 
  onResourceRemoved,
  resources = [],
  className = '',
  maxResources = 10
}) => {
  const [activeTab, setActiveTab] = useState('file')
  const [error, setError] = useState('')

  const handleFileUploaded = useCallback((uploadResult) => {
    const resource = {
      id: Date.now().toString(),
      type: 'file',
      name: uploadResult.originalName || uploadResult.filename,
      url: uploadResult.url,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      uploadedAt: new Date().toISOString()
    }
    
    onResourceAdded?.(resource)
    setError('')
  }, [onResourceAdded])

  const handleUrlAdded = useCallback((urlData) => {
    let resource
    
    if (isYouTubeUrl(urlData.url)) {
      const videoId = extractYouTubeId(urlData.url)
      if (!videoId) {
        setError('Invalid YouTube URL')
        return
      }
      
      resource = {
        id: Date.now().toString(),
        type: 'youtube',
        name: `YouTube Video`,
        url: urlData.url,
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        addedAt: new Date().toISOString()
      }
    } else {
      resource = {
        id: Date.now().toString(),
        type: 'url',
        name: urlData.name || urlData.url,
        url: urlData.url,
        addedAt: new Date().toISOString()
      }
    }
    
    onResourceAdded?.(resource)
    setError('')
  }, [onResourceAdded])

  const handleRemoveResource = useCallback((resourceId) => {
    onResourceRemoved?.(resourceId)
  }, [onResourceRemoved])

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canAddMore = resources.length < maxResources

  return (
    <div className={className}>
      {/* Resource Upload Interface */}
      {canAddMore && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Add Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="file" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Link</span>
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center space-x-2">
                  <Youtube className="h-4 w-4" />
                  <span>YouTube</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-4">
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onError={setError}
                  acceptedTypes={['document', 'image', 'video']}
                  multiple={false}
                />
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <div className="space-y-3">
                  <p className="text-text-secondary caption">
                    Add links to external resources, websites, or online documents
                  </p>
                  <URLInput
                    onUrlAdded={handleUrlAdded}
                    placeholder="https://example.com/resource"
                  />
                </div>
              </TabsContent>

              <TabsContent value="youtube" className="mt-4">
                <div className="space-y-3">
                  <p className="text-text-secondary caption">
                    Embed YouTube videos directly in your learning module
                  </p>
                  <URLInput
                    onUrlAdded={handleUrlAdded}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resource List */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Learning Resources</CardTitle>
              <Badge variant="secondary">
                {resources.length} / {maxResources}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resources.map((resource) => {
                const IconComponent = getResourceIcon(resource)
                
                return (
                  <div
                    key={resource.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IconComponent className="h-5 w-5 text-text-secondary flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="caption font-medium text-text-primary truncate">
                          {resource.name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        {resource.size && (
                          <span className="text-xs text-text-secondary">
                            {formatFileSize(resource.size)}
                          </span>
                        )}
                        {resource.mimeType && (
                          <span className="text-xs text-text-secondary">
                            {resource.mimeType}
                          </span>
                        )}
                        <span className="text-xs text-text-secondary">
                          Added {new Date(resource.addedAt || resource.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Preview/View Button */}
                      {resource.type === 'youtube' && resource.embedUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(resource.url, '_blank')}
                          title="View on YouTube"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {resource.type === 'url' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(resource.url, '_blank')}
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {resource.type === 'file' && resource.url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(resource.url, '_blank')}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveResource(resource.id)}
                        title="Remove resource"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {!canAddMore && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Maximum number of resources reached ({maxResources}). Remove some resources to add new ones.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {resources.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="caption">No resources added yet</p>
          <p className="text-xs mt-1">Add files, links, or YouTube videos to enhance your learning module</p>
        </div>
      )}
    </div>
  )
}

// Simple Tabs component implementation (if not already available)
const Tabs = ({ value, onValueChange, children, className = '' }) => (
  <div className={className} data-value={value} data-onchange={onValueChange}>
    {children}
  </div>
)

const TabsList = ({ children, className = '' }) => (
  <div className={`flex space-x-1 bg-gray-100 p-1 rounded-lg ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, className = '' }) => {
  const tabs = React.useContext(TabsContext) || {}
  const isActive = tabs.value === value
  
  return (
    <button
      className={`
        flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-white text-text-primary shadow-sm' 
          : 'text-text-secondary hover:text-text-primary'
        }
        ${className}
      `}
      onClick={() => tabs.onValueChange?.(value)}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className = '' }) => {
  const tabs = React.useContext(TabsContext) || {}
  if (tabs.value !== value) return null
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Context for tabs (simple implementation)
const TabsContext = React.createContext()

// Override the Tabs component to provide context
export const TabsProvider = ({ value, onValueChange, children, className = '' }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={className}>
      {children}
    </div>
  </TabsContext.Provider>
)

// Export the enhanced Tabs components
export { TabsProvider as Tabs, TabsList, TabsTrigger, TabsContent }
