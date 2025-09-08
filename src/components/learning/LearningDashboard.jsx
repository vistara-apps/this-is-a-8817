import React from 'react'
import { usePathStore } from '../../stores/pathStore'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import { BookOpen, Award, Clock, Play } from 'lucide-react'

export const LearningDashboard = () => {
  const { user } = useAuthStore()
  const { paths, enrollments, badges, updateProgress, awardBadge } = usePathStore()

  const userEnrollments = enrollments.filter(e => e.userId === user?.userId)
  const userBadges = badges.filter(b => b.userId === user?.userId)

  const getEnrolledPath = (enrollment) => {
    return paths.find(p => p.pathId === enrollment.pathId)
  }

  const continueModule = (enrollment) => {
    const path = getEnrolledPath(enrollment)
    if (!path) return

    // Find first incomplete module
    const incompleteModule = path.modules?.find(module => {
      const milestones = module.milestones || []
      return milestones.some(milestone => 
        !enrollment.completedMilestones.includes(milestone.milestoneId)
      )
    })

    if (incompleteModule) {
      // Simulate completing the first incomplete milestone
      const incompleteMilestone = incompleteModule.milestones?.find(milestone =>
        !enrollment.completedMilestones.includes(milestone.milestoneId)
      )
      
      if (incompleteMilestone) {
        updateProgress(user.userId, enrollment.pathId, incompleteMilestone.milestoneId)
        awardBadge(user.userId, enrollment.pathId, incompleteMilestone.milestoneId)
        alert(`Milestone completed: ${incompleteMilestone.title}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading1 text-text-primary">My Learning</h1>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="heading2 text-primary">{userEnrollments.length}</div>
            <div className="caption text-text-secondary">Active Paths</div>
          </div>
          <div className="text-center">
            <div className="heading2 text-accent">{userBadges.length}</div>
            <div className="caption text-text-secondary">Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Active Learning Paths */}
      <div className="space-y-4">
        <h2 className="heading2 text-text-primary">Continue Learning</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {userEnrollments.map((enrollment) => {
            const path = getEnrolledPath(enrollment)
            if (!path) return null

            return (
              <Card key={enrollment.enrollmentId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          {enrollment.progressPercentage}% Complete
                        </Badge>
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <Clock className="h-4 w-4" />
                          <span className="caption">{path.modules?.length || 0} modules</span>
                        </div>
                      </div>
                    </div>
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProgressBar value={enrollment.progressPercentage} />
                  
                  <div className="space-y-2">
                    <p className="caption text-text-secondary">Recent milestones:</p>
                    {enrollment.completedMilestones.slice(-2).map((milestoneId) => {
                      // Find milestone details
                      const milestone = path.modules?.flatMap(m => m.milestones || [])
                        .find(m => m.milestoneId === milestoneId)
                      
                      return milestone ? (
                        <div key={milestoneId} className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-accent" />
                          <span className="caption text-text-primary">{milestone.title}</span>
                        </div>
                      ) : null
                    })}
                  </div>

                  <Button 
                    onClick={() => continueModule(enrollment)}
                    className="w-full flex items-center space-x-2"
                    disabled={enrollment.progressPercentage === 100}
                  >
                    <Play className="h-4 w-4" />
                    <span>
                      {enrollment.progressPercentage === 100 ? 'Completed' : 'Continue Learning'}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {userEnrollments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">You haven't enrolled in any learning paths yet.</p>
              <Button variant="outline" className="mt-4">
                <a href="#browse">Browse Paths</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Badges Section */}
      {userBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="heading2 text-text-primary">Your Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userBadges.map((badge) => {
              const path = paths.find(p => p.pathId === badge.pathId)
              const milestone = path?.modules?.flatMap(m => m.milestones || [])
                .find(m => m.milestoneId === badge.milestoneId)
              
              return (
                <Card key={badge.badgeId} className="text-center p-4">
                  <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="caption font-semibold text-text-primary">
                    {milestone?.title || 'Achievement'}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {path?.title}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}