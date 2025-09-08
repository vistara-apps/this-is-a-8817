import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuthStore } from '../../stores/authStore'
import { usePathStore } from '../../stores/pathStore'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { ModuleBuilder } from './ModuleBuilder'
import { Plus, Save } from 'lucide-react'

export const PathBuilder = () => {
  const { user } = useAuthStore()
  const { createPath, updatePath } = usePathStore()
  const [pathData, setPathData] = useState({
    title: '',
    description: '',
    fee: 0,
    creatorId: user?.userId
  })
  const [currentPath, setCurrentPath] = useState(null)
  const [modules, setModules] = useState([])

  const handlePathSubmit = (e) => {
    e.preventDefault()
    if (currentPath) {
      updatePath(currentPath, { ...pathData, modules })
    } else {
      const pathId = createPath({ ...pathData, modules })
      setCurrentPath(pathId)
    }
    alert('Path saved successfully!')
  }

  const handleChange = (e) => {
    setPathData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addModule = () => {
    const newModule = {
      moduleId: Date.now().toString(),
      title: `Module ${modules.length + 1}`,
      order: modules.length,
      resourceType: 'text',
      resourceURL: '',
      content: '',
      milestones: []
    }
    setModules(prev => [...prev, newModule])
  }

  const updateModule = (moduleId, updates) => {
    setModules(prev => prev.map(module =>
      module.moduleId === moduleId ? { ...module, ...updates } : module
    ))
  }

  const deleteModule = (moduleId) => {
    setModules(prev => prev.filter(module => module.moduleId !== moduleId))
  }

  const reorderModules = (dragIndex, hoverIndex) => {
    const dragModule = modules[dragIndex]
    const newModules = [...modules]
    newModules.splice(dragIndex, 1)
    newModules.splice(hoverIndex, 0, dragModule)
    
    // Update order
    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      order: index
    }))
    
    setModules(reorderedModules)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePathSubmit} className="space-y-4">
              <div>
                <label className="block caption text-text-secondary mb-2">
                  Path Title
                </label>
                <Input
                  name="title"
                  value={pathData.title}
                  onChange={handleChange}
                  placeholder="Enter path title"
                  required
                />
              </div>

              <div>
                <label className="block caption text-text-secondary mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={pathData.description}
                  onChange={handleChange}
                  placeholder="Describe what learners will gain from this path"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block caption text-text-secondary mb-2">
                  Fee (USD) - Leave 0 for free
                </label>
                <Input
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pathData.fee}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              <Button type="submit" className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Path</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Modules</CardTitle>
              <Button onClick={addModule} size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Module</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module, index) => (
                <ModuleBuilder
                  key={module.moduleId}
                  module={module}
                  index={index}
                  onUpdate={updateModule}
                  onDelete={deleteModule}
                  onReorder={reorderModules}
                />
              ))}
              {modules.length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                  <p className="caption">No modules yet. Add your first module to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  )
}