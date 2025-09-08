import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth-token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials) {
    try {
      const response = await this.client.post('/auth/login', credentials)
      if (response.data.token) {
        localStorage.setItem('auth-token', response.data.token)
      }
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async register(userData) {
    try {
      const response = await this.client.post('/auth/register', userData)
      if (response.data.token) {
        localStorage.setItem('auth-token', response.data.token)
      }
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout')
      localStorage.removeItem('auth-token')
    } catch (error) {
      // Even if logout fails on server, clear local token
      localStorage.removeItem('auth-token')
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/auth/me')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Learning Path endpoints
  async getPaths(filters = {}) {
    try {
      const response = await this.client.get('/paths', { params: filters })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getPath(pathId) {
    try {
      const response = await this.client.get(`/paths/${pathId}`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createPath(pathData) {
    try {
      const response = await this.client.post('/paths', pathData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updatePath(pathId, updates) {
    try {
      const response = await this.client.put(`/paths/${pathId}`, updates)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deletePath(pathId) {
    try {
      await this.client.delete(`/paths/${pathId}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getCreatorPaths(creatorId) {
    try {
      const response = await this.client.get(`/creators/${creatorId}/paths`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Module endpoints
  async addModule(pathId, moduleData) {
    try {
      const response = await this.client.post(`/paths/${pathId}/modules`, moduleData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateModule(pathId, moduleId, updates) {
    try {
      const response = await this.client.put(`/paths/${pathId}/modules/${moduleId}`, updates)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deleteModule(pathId, moduleId) {
    try {
      await this.client.delete(`/paths/${pathId}/modules/${moduleId}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async reorderModules(pathId, moduleOrder) {
    try {
      const response = await this.client.put(`/paths/${pathId}/modules/reorder`, { moduleOrder })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Enrollment endpoints
  async enrollInPath(pathId, paymentData = null) {
    try {
      const response = await this.client.post(`/paths/${pathId}/enroll`, { paymentData })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getUserEnrollments(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/enrollments`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateProgress(pathId, milestoneId, progressData) {
    try {
      const response = await this.client.post(`/paths/${pathId}/progress`, {
        milestoneId,
        ...progressData
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Badge endpoints
  async getUserBadges(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/badges`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async awardBadge(userId, pathId, milestoneId) {
    try {
      const response = await this.client.post('/badges', {
        userId,
        pathId,
        milestoneId
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Forum endpoints
  async getForumPosts(pathId = null) {
    try {
      const params = pathId ? { pathId } : {}
      const response = await this.client.get('/forum/posts', { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createForumPost(postData) {
    try {
      const response = await this.client.post('/forum/posts', postData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async addComment(postId, commentData) {
    try {
      const response = await this.client.post(`/forum/posts/${postId}/comments`, commentData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // File upload endpoints
  async uploadFile(file, type = 'resource') {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Analytics endpoints
  async getPathAnalytics(pathId) {
    try {
      const response = await this.client.get(`/paths/${pathId}/analytics`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getCreatorAnalytics(creatorId) {
    try {
      const response = await this.client.get(`/creators/${creatorId}/analytics`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Search endpoints
  async searchPaths(query, filters = {}) {
    try {
      const response = await this.client.get('/search/paths', {
        params: { q: query, ...filters }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // User profile endpoints
  async updateUserProfile(userId, profileData) {
    try {
      const response = await this.client.put(`/users/${userId}/profile`, profileData)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData()
      formData.append('profilePicture', file)

      const response = await this.client.post(`/users/${userId}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Notification endpoints
  async getNotifications(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/notifications`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async markNotificationRead(notificationId) {
    try {
      await this.client.put(`/notifications/${notificationId}/read`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  // Error handling helper
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0
      }
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1
      }
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Create singleton instance
const apiService = new ApiService()

export default apiService
