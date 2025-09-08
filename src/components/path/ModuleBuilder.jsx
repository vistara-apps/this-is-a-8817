import React, { useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { GripVertical, Trash2, Plus, Award } from 'lucide-react'

const ItemTypes = {
  MODULE: 'module'
}

export const ModuleBuilder = ({ module, index, onUpdate, onDelete, onReorder }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [milestoneTitle, setMilestoneTitle] = useState('')

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MODULE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: ItemTypes.MODULE,
    hover: (item) => {
      if (item.index !== index) {
        onReorder(item.index, index)
        item.index = index
      }
    },
  })

  const handleModuleChange = (field, value) => {
    onUpdate(module.moduleId, { [field]: value })
  }

  const addMilestone = () => {
    if (milestoneTitle.trim()) {
      const newMilestone = {
        milestoneId: Date.now().toString(),
        title: milestoneTitle,
        description: '',
        isBadgeAwarded: true
      }
      const updatedMilestones = [...(module.milestones || []), newMilestone]
      onUpdate(module.moduleId, { milestones: updatedMilestones })
      setMilestoneTitle('')
    }
  }

  const deleteMilestone = (milestoneId) => {
    const updatedMilestones = module.milestones.filter(m => m.milestoneId !== milestoneId)
    onUpdate(module.moduleId, { milestones: updatedMilestones })
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card variant="interactive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GripVertical className="h-5 w-5 text-text-secondary cursor-move" />
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <Badge variant="secondary">Module {index + 1}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(module.moduleId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div>
              <label className="block caption text-text-secondary mb-2">
                Module Title
              </label>
              <Input
                value={module.title}
                onChange={(e) => handleModuleChange('title', e.target.value)}
                placeholder="Enter module title"
              />
            </div>

            <div>
              <label className="block caption text-text-secondary mb-2">
                Resource Type
              </label>
              <select
                value={module.resourceType}
                onChange={(e) => handleModuleChange('resourceType', e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="text">Text Content</option>
                <option value="video">Video</option>
                <option value="link">External Link</option>
                <option value="document">Document</option>
              </select>
            </div>

            {module.resourceType === 'text' && (
              <div>
                <label className="block caption text-text-secondary mb-2">
                  Content
                </label>
                <Textarea
                  value={module.content || ''}
                  onChange={(e) => handleModuleChange('content', e.target.value)}
                  placeholder="Enter your lesson content here..."
                  rows={4}
                />
              </div>
            )}

            {(module.resourceType === 'video' || module.resourceType === 'link' || module.resourceType === 'document') && (
              <div>
                <label className="block caption text-text-secondary mb-2">
                  Resource URL
                </label>
                <Input
                  value={module.resourceURL || ''}
                  onChange={(e) => handleModuleChange('resourceURL', e.target.value)}
                  placeholder="Enter URL to resource"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="caption font-semibold text-text-primary">Milestones</h4>
              </div>
              
              <div className="space-y-2">
                {module.milestones?.map((milestone) => (
                  <div key={milestone.milestoneId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-accent" />
                      <span className="caption">{milestone.title}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMilestone(milestone.milestoneId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 mt-3">
                <Input
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Add milestone..."
                  size="sm"
                />
                <Button size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}