import { useState, useCallback } from 'react'
import apiService from '../services/api'

/**
 * Custom hook for API operations with loading states and error handling
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (apiCall, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall(...args)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    execute,
    clearError
  }
}

/**
 * Hook for authentication operations
 */
export const useAuth = () => {
  const { loading, error, execute, clearError } = useApi()

  const login = useCallback(async (credentials) => {
    return execute(apiService.login, credentials)
  }, [execute])

  const register = useCallback(async (userData) => {
    return execute(apiService.register, userData)
  }, [execute])

  const logout = useCallback(async () => {
    return execute(apiService.logout)
  }, [execute])

  const getCurrentUser = useCallback(async () => {
    return execute(apiService.getCurrentUser)
  }, [execute])

  return {
    login,
    register,
    logout,
    getCurrentUser,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for learning path operations
 */
export const usePaths = () => {
  const { loading, error, execute, clearError } = useApi()

  const getPaths = useCallback(async (filters = {}) => {
    return execute(apiService.getPaths, filters)
  }, [execute])

  const getPath = useCallback(async (pathId) => {
    return execute(apiService.getPath, pathId)
  }, [execute])

  const createPath = useCallback(async (pathData) => {
    return execute(apiService.createPath, pathData)
  }, [execute])

  const updatePath = useCallback(async (pathId, updates) => {
    return execute(apiService.updatePath, pathId, updates)
  }, [execute])

  const deletePath = useCallback(async (pathId) => {
    return execute(apiService.deletePath, pathId)
  }, [execute])

  const getCreatorPaths = useCallback(async (creatorId) => {
    return execute(apiService.getCreatorPaths, creatorId)
  }, [execute])

  const searchPaths = useCallback(async (query, filters = {}) => {
    return execute(apiService.searchPaths, query, filters)
  }, [execute])

  return {
    getPaths,
    getPath,
    createPath,
    updatePath,
    deletePath,
    getCreatorPaths,
    searchPaths,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for module operations
 */
export const useModules = () => {
  const { loading, error, execute, clearError } = useApi()

  const addModule = useCallback(async (pathId, moduleData) => {
    return execute(apiService.addModule, pathId, moduleData)
  }, [execute])

  const updateModule = useCallback(async (pathId, moduleId, updates) => {
    return execute(apiService.updateModule, pathId, moduleId, updates)
  }, [execute])

  const deleteModule = useCallback(async (pathId, moduleId) => {
    return execute(apiService.deleteModule, pathId, moduleId)
  }, [execute])

  const reorderModules = useCallback(async (pathId, moduleOrder) => {
    return execute(apiService.reorderModules, pathId, moduleOrder)
  }, [execute])

  return {
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for enrollment and progress operations
 */
export const useEnrollments = () => {
  const { loading, error, execute, clearError } = useApi()

  const enrollInPath = useCallback(async (pathId, paymentData = null) => {
    return execute(apiService.enrollInPath, pathId, paymentData)
  }, [execute])

  const getUserEnrollments = useCallback(async (userId) => {
    return execute(apiService.getUserEnrollments, userId)
  }, [execute])

  const updateProgress = useCallback(async (pathId, milestoneId, progressData) => {
    return execute(apiService.updateProgress, pathId, milestoneId, progressData)
  }, [execute])

  return {
    enrollInPath,
    getUserEnrollments,
    updateProgress,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for badge operations
 */
export const useBadges = () => {
  const { loading, error, execute, clearError } = useApi()

  const getUserBadges = useCallback(async (userId) => {
    return execute(apiService.getUserBadges, userId)
  }, [execute])

  const awardBadge = useCallback(async (userId, pathId, milestoneId) => {
    return execute(apiService.awardBadge, userId, pathId, milestoneId)
  }, [execute])

  return {
    getUserBadges,
    awardBadge,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for forum operations
 */
export const useForum = () => {
  const { loading, error, execute, clearError } = useApi()

  const getForumPosts = useCallback(async (pathId = null) => {
    return execute(apiService.getForumPosts, pathId)
  }, [execute])

  const createForumPost = useCallback(async (postData) => {
    return execute(apiService.createForumPost, postData)
  }, [execute])

  const addComment = useCallback(async (postId, commentData) => {
    return execute(apiService.addComment, postId, commentData)
  }, [execute])

  return {
    getForumPosts,
    createForumPost,
    addComment,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for file upload operations
 */
export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const { loading, error, execute, clearError } = useApi()

  const uploadFile = useCallback(async (file, type = 'resource', onProgress = null) => {
    setUploadProgress(0)
    
    // Create a custom axios config for progress tracking
    const config = {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(progress)
        if (onProgress) onProgress(progress)
      }
    }

    try {
      const result = await execute(apiService.uploadFile, file, type, config)
      setUploadProgress(100)
      return result
    } catch (err) {
      setUploadProgress(0)
      throw err
    }
  }, [execute])

  const uploadProfilePicture = useCallback(async (userId, file, onProgress = null) => {
    return uploadFile(file, 'profile', onProgress).then(result => 
      execute(apiService.uploadProfilePicture, userId, file)
    )
  }, [execute, uploadFile])

  return {
    uploadFile,
    uploadProfilePicture,
    uploadProgress,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for analytics operations
 */
export const useAnalytics = () => {
  const { loading, error, execute, clearError } = useApi()

  const getPathAnalytics = useCallback(async (pathId) => {
    return execute(apiService.getPathAnalytics, pathId)
  }, [execute])

  const getCreatorAnalytics = useCallback(async (creatorId) => {
    return execute(apiService.getCreatorAnalytics, creatorId)
  }, [execute])

  return {
    getPathAnalytics,
    getCreatorAnalytics,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for user profile operations
 */
export const useUserProfile = () => {
  const { loading, error, execute, clearError } = useApi()

  const updateUserProfile = useCallback(async (userId, profileData) => {
    return execute(apiService.updateUserProfile, userId, profileData)
  }, [execute])

  return {
    updateUserProfile,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for notification operations
 */
export const useNotifications = () => {
  const { loading, error, execute, clearError } = useApi()

  const getNotifications = useCallback(async (userId) => {
    return execute(apiService.getNotifications, userId)
  }, [execute])

  const markNotificationRead = useCallback(async (notificationId) => {
    return execute(apiService.markNotificationRead, notificationId)
  }, [execute])

  return {
    getNotifications,
    markNotificationRead,
    loading,
    error,
    clearError
  }
}

/**
 * Hook for health check
 */
export const useHealthCheck = () => {
  const { loading, error, execute, clearError } = useApi()

  const checkHealth = useCallback(async () => {
    return execute(apiService.healthCheck)
  }, [execute])

  return {
    checkHealth,
    loading,
    error,
    clearError
  }
}
