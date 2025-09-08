import React from 'react'
import { usePathStore } from '../../stores/pathStore'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { BookOpen, Users, Edit, Trash2, DollarSign } from 'lucide-react'

export const MyPaths = () => {
  const { user } = useAuthStore()
  const { paths, enrollments, deletePath } = usePathStore()

  const myPaths = paths.filter(path => path.creatorId === user?.userId)

  const getEnrollmentCount = (pathId) => {
    return enrollments.filter(e => e.pathId === pathId).length
  }

  const getRevenue = (path) => {
    const enrollmentCount = getEnrollmentCount(path.pathId)
    return (path.fee || 0) * enrollmentCount
  }

  const handleDeletePath = (pathId) => {
    if (window.confirm('Are you sure you want to delete this path?')) {
      deletePath(pathId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading1 text-text-primary">My Learning Paths</h1>
        <Button>
          <a href="#create">Create New Path</a>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <div className="heading2 text-text-primary">{myPaths.length}</div>
                <div className="caption text-text-secondary">Total Paths</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <div className="heading2 text-text-primary">
                  {myPaths.reduce((total, path) => total + getEnrollmentCount(path.pathId), 0)}
                </div>
                <div className="caption text-text-secondary">Total Learners</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="heading2 text-text-primary">
                  ${myPaths.reduce((total, path) => total + getRevenue(path), 0).toFixed(2)}
                </div>
                <div className="caption text-text-secondary">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paths List */}
      <div className="space-y-4">
        {myPaths.map((path) => (
          <Card key={path.pathId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                  <div className="flex items-center space-x-3 mt-3">
                    {path.fee > 0 ? (
                      <Badge variant="default" className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{path.fee}</span>
                      </Badge>
                    ) : (
                      <Badge variant="success">Free</Badge>
                    )}
                    <Badge variant="secondary">
                      {path.modules?.length || 0} modules
                    </Badge>
                    <Badge variant="secondary">
                      {getEnrollmentCount(path.pathId)} learners
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="caption text-text-secondary">Created</p>
                  <p className="text-text-primary">
                    {new Date(path.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="caption text-text-secondary">Revenue</p>
                  <p className="text-text-primary">${getRevenue(path).toFixed(2)}</p>
                </div>
                <div>
                  <p className="caption text-text-secondary">Avg. Progress</p>
                  <p className="text-text-primary">
                    {enrollments.filter(e => e.pathId === path.pathId).length > 0
                      ? Math.round(
                          enrollments
                            .filter(e => e.pathId === path.pathId)
                            .reduce((sum, e) => sum + e.progressPercentage, 0) /
                          enrollments.filter(e => e.pathId === path.pathId).length
                        )
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeletePath(path.pathId)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}

        {myPaths.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">You haven't created any learning paths yet.</p>
              <Button>
                <a href="#create">Create Your First Path</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}