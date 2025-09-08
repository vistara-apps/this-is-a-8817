import React, { useState } from 'react'
import { usePathStore } from '../../stores/pathStore'
import { useAuthStore } from '../../stores/authStore'
import { usePaymentContext } from '../../hooks/usePaymentContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import { Search, Clock, Star, DollarSign } from 'lucide-react'

export const PathBrowser = () => {
  const { paths, enrollInPath } = usePathStore()
  const { user } = useAuthStore()
  const { createSession } = usePaymentContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentLoading, setPaymentLoading] = useState({})

  const filteredPaths = paths.filter(path =>
    path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    path.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnroll = async (path) => {
    if (path.fee > 0) {
      try {
        setPaymentLoading(prev => ({ ...prev, [path.pathId]: true }))
        await createSession(`$${path.fee}`)
        enrollInPath(user.userId, path.pathId)
        alert('Payment successful! You are now enrolled in this path.')
      } catch (error) {
        alert('Payment failed. Please try again.')
        console.error('Payment error:', error)
      } finally {
        setPaymentLoading(prev => ({ ...prev, [path.pathId]: false }))
      }
    } else {
      enrollInPath(user.userId, path.pathId)
      alert('Successfully enrolled in free path!')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading1 text-text-primary">Browse Learning Paths</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <Card key={path.pathId} variant="interactive">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </div>
                {path.fee > 0 ? (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{path.fee}</span>
                  </Badge>
                ) : (
                  <Badge variant="success">Free</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{path.modules?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="caption text-text-secondary">Modules:</p>
                  <div className="space-y-1">
                    {path.modules?.slice(0, 3).map((module, index) => (
                      <div key={module.moduleId} className="text-sm text-text-primary">
                        {index + 1}. {module.title}
                      </div>
                    ))}
                    {path.modules?.length > 3 && (
                      <div className="text-sm text-text-secondary">
                        +{path.modules.length - 3} more modules
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                onClick={() => handleEnroll(path)}
                disabled={paymentLoading[path.pathId]}
                className="w-full"
              >
                {paymentLoading[path.pathId] 
                  ? 'Processing...' 
                  : path.fee > 0 
                    ? `Enroll for $${path.fee}` 
                    : 'Enroll for Free'
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPaths.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No learning paths found.</p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}