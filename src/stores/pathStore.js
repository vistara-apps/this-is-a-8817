import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePathStore = create(
  persist(
    (set, get) => ({
      paths: [],
      enrollments: [],
      badges: [],
      forumPosts: [],

      // Path management
      createPath: (pathData) => {
        const newPath = {
          pathId: Date.now().toString(),
          createdAt: new Date().toISOString(),
          modules: [],
          ...pathData,
        }
        set(state => ({
          paths: [...state.paths, newPath]
        }))
        return newPath.pathId
      },

      updatePath: (pathId, updates) => {
        set(state => ({
          paths: state.paths.map(path =>
            path.pathId === pathId ? { ...path, ...updates } : path
          )
        }))
      },

      deletePath: (pathId) => {
        set(state => ({
          paths: state.paths.filter(path => path.pathId !== pathId)
        }))
      },

      // Module management
      addModule: (pathId, moduleData) => {
        const newModule = {
          moduleId: Date.now().toString(),
          pathId,
          order: get().paths.find(p => p.pathId === pathId)?.modules.length || 0,
          ...moduleData,
        }
        
        set(state => ({
          paths: state.paths.map(path =>
            path.pathId === pathId
              ? { ...path, modules: [...path.modules, newModule] }
              : path
          )
        }))
        return newModule.moduleId
      },

      updateModule: (pathId, moduleId, updates) => {
        set(state => ({
          paths: state.paths.map(path =>
            path.pathId === pathId
              ? {
                  ...path,
                  modules: path.modules.map(module =>
                    module.moduleId === moduleId ? { ...module, ...updates } : module
                  )
                }
              : path
          )
        }))
      },

      deleteModule: (pathId, moduleId) => {
        set(state => ({
          paths: state.paths.map(path =>
            path.pathId === pathId
              ? {
                  ...path,
                  modules: path.modules.filter(module => module.moduleId !== moduleId)
                }
              : path
          )
        }))
      },

      reorderModules: (pathId, newOrder) => {
        set(state => ({
          paths: state.paths.map(path =>
            path.pathId === pathId
              ? { ...path, modules: newOrder }
              : path
          )
        }))
      },

      // Enrollment management
      enrollInPath: (userId, pathId) => {
        const existingEnrollment = get().enrollments.find(
          e => e.userId === userId && e.pathId === pathId
        )
        
        if (!existingEnrollment) {
          const newEnrollment = {
            enrollmentId: Date.now().toString(),
            userId,
            pathId,
            progressPercentage: 0,
            completedMilestones: [],
            enrolledAt: new Date().toISOString(),
          }
          
          set(state => ({
            enrollments: [...state.enrollments, newEnrollment]
          }))
        }
      },

      updateProgress: (userId, pathId, milestoneId) => {
        set(state => {
          const enrollments = state.enrollments.map(enrollment => {
            if (enrollment.userId === userId && enrollment.pathId === pathId) {
              const completedMilestones = [...enrollment.completedMilestones]
              if (!completedMilestones.includes(milestoneId)) {
                completedMilestones.push(milestoneId)
              }
              
              const path = state.paths.find(p => p.pathId === pathId)
              const totalMilestones = path?.modules.reduce((acc, module) => 
                acc + (module.milestones?.length || 0), 0) || 1
              const progressPercentage = Math.round((completedMilestones.length / totalMilestones) * 100)
              
              return {
                ...enrollment,
                completedMilestones,
                progressPercentage,
              }
            }
            return enrollment
          })
          
          return { enrollments }
        })
      },

      // Badge management
      awardBadge: (userId, pathId, milestoneId) => {
        const existingBadge = get().badges.find(
          b => b.userId === userId && b.pathId === pathId && b.milestoneId === milestoneId
        )
        
        if (!existingBadge) {
          const newBadge = {
            badgeId: Date.now().toString(),
            userId,
            pathId,
            milestoneId,
            earnedAt: new Date().toISOString(),
          }
          
          set(state => ({
            badges: [...state.badges, newBadge]
          }))
        }
      },

      // Forum management
      createForumPost: (postData) => {
        const newPost = {
          postId: Date.now().toString(),
          createdAt: new Date().toISOString(),
          comments: [],
          ...postData,
        }
        
        set(state => ({
          forumPosts: [...state.forumPosts, newPost]
        }))
      },

      addComment: (postId, commentData) => {
        const newComment = {
          commentId: Date.now().toString(),
          postId,
          createdAt: new Date().toISOString(),
          ...commentData,
        }
        
        set(state => ({
          forumPosts: state.forumPosts.map(post =>
            post.postId === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          )
        }))
      },

      // Getters
      getPathsByCreator: (creatorId) => {
        return get().paths.filter(path => path.creatorId === creatorId)
      },

      getEnrollmentsByUser: (userId) => {
        return get().enrollments.filter(enrollment => enrollment.userId === userId)
      },

      getBadgesByUser: (userId) => {
        return get().badges.filter(badge => badge.userId === userId)
      },

      getForumPostsByPath: (pathId) => {
        return get().forumPosts.filter(post => post.pathId === pathId)
      },
    }),
    {
      name: 'path-storage',
    }
  )
)