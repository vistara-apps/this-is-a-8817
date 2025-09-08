/**
 * Search and filtering utilities for learning paths
 */

/**
 * Filter paths based on search criteria
 */
export const filterPaths = (paths, filters) => {
  if (!paths || paths.length === 0) return []

  let filteredPaths = [...paths]

  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase().trim()
    filteredPaths = filteredPaths.filter(path => 
      path.title.toLowerCase().includes(query) ||
      path.description.toLowerCase().includes(query) ||
      path.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      path.creatorName?.toLowerCase().includes(query)
    )
  }

  // Price range filter
  if (filters.priceRange && filters.priceRange.length > 0) {
    filteredPaths = filteredPaths.filter(path => {
      const price = path.fee || 0
      return filters.priceRange.some(range => {
        switch (range) {
          case 'free':
            return price === 0
          case 'under-10':
            return price > 0 && price < 10
          case '10-25':
            return price >= 10 && price <= 25
          case '25-50':
            return price >= 25 && price <= 50
          case '50-100':
            return price >= 50 && price <= 100
          case 'over-100':
            return price > 100
          default:
            return true
        }
      })
    })
  }

  // Difficulty filter
  if (filters.difficulty && filters.difficulty.length > 0) {
    filteredPaths = filteredPaths.filter(path => 
      filters.difficulty.includes(path.difficulty?.toLowerCase())
    )
  }

  // Duration filter
  if (filters.duration && filters.duration.length > 0) {
    filteredPaths = filteredPaths.filter(path => {
      const duration = path.estimatedDuration || 0 // in hours
      return filters.duration.some(dur => {
        switch (dur) {
          case 'short':
            return duration < 2
          case 'medium':
            return duration >= 2 && duration <= 10
          case 'long':
            return duration > 10
          default:
            return true
        }
      })
    })
  }

  // Category filter
  if (filters.category) {
    filteredPaths = filteredPaths.filter(path => 
      path.category?.toLowerCase() === filters.category.toLowerCase()
    )
  }

  // Rating filter
  if (filters.rating && filters.rating > 0) {
    filteredPaths = filteredPaths.filter(path => 
      (path.averageRating || 0) >= filters.rating
    )
  }

  return filteredPaths
}

/**
 * Sort paths based on sort criteria
 */
export const sortPaths = (paths, sortBy = 'relevance', searchQuery = '') => {
  if (!paths || paths.length === 0) return []

  const sortedPaths = [...paths]

  switch (sortBy) {
    case 'newest':
      return sortedPaths.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )

    case 'oldest':
      return sortedPaths.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      )

    case 'price-low':
      return sortedPaths.sort((a, b) => (a.fee || 0) - (b.fee || 0))

    case 'price-high':
      return sortedPaths.sort((a, b) => (b.fee || 0) - (a.fee || 0))

    case 'popular':
      return sortedPaths.sort((a, b) => 
        (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      )

    case 'rating':
      return sortedPaths.sort((a, b) => 
        (b.averageRating || 0) - (a.averageRating || 0)
      )

    case 'relevance':
    default:
      if (searchQuery) {
        return sortByRelevance(sortedPaths, searchQuery)
      }
      // Default to popularity if no search query
      return sortedPaths.sort((a, b) => 
        (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      )
  }
}

/**
 * Sort paths by relevance to search query
 */
const sortByRelevance = (paths, query) => {
  const queryLower = query.toLowerCase().trim()
  
  return paths.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, queryLower)
    const scoreB = calculateRelevanceScore(b, queryLower)
    return scoreB - scoreA
  })
}

/**
 * Calculate relevance score for a path based on search query
 */
const calculateRelevanceScore = (path, query) => {
  let score = 0
  
  // Title match (highest weight)
  if (path.title.toLowerCase().includes(query)) {
    score += 10
    // Exact title match gets bonus
    if (path.title.toLowerCase() === query) {
      score += 20
    }
    // Title starts with query gets bonus
    if (path.title.toLowerCase().startsWith(query)) {
      score += 10
    }
  }

  // Description match
  if (path.description.toLowerCase().includes(query)) {
    score += 5
  }

  // Tags match
  if (path.tags) {
    path.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        score += 3
      }
      if (tag.toLowerCase() === query) {
        score += 5
      }
    })
  }

  // Creator name match
  if (path.creatorName?.toLowerCase().includes(query)) {
    score += 2
  }

  // Category match
  if (path.category?.toLowerCase().includes(query)) {
    score += 3
  }

  // Boost score based on popularity and rating
  score += (path.enrollmentCount || 0) * 0.1
  score += (path.averageRating || 0) * 2

  return score
}

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = (paths, query, maxSuggestions = 5) => {
  if (!query || query.length < 2) return []

  const queryLower = query.toLowerCase().trim()
  const suggestions = new Set()

  paths.forEach(path => {
    // Title suggestions
    if (path.title.toLowerCase().includes(queryLower)) {
      suggestions.add(path.title)
    }

    // Tag suggestions
    if (path.tags) {
      path.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag)
        }
      })
    }

    // Category suggestions
    if (path.category?.toLowerCase().includes(queryLower)) {
      suggestions.add(path.category)
    }

    // Creator suggestions
    if (path.creatorName?.toLowerCase().includes(queryLower)) {
      suggestions.add(path.creatorName)
    }
  })

  return Array.from(suggestions)
    .slice(0, maxSuggestions)
    .sort((a, b) => a.length - b.length) // Shorter suggestions first
}

/**
 * Highlight search terms in text
 */
export const highlightSearchTerms = (text, query) => {
  if (!query || !text) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Get popular search terms (mock implementation)
 */
export const getPopularSearchTerms = () => {
  return [
    'React',
    'JavaScript',
    'Python',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Digital Marketing',
    'Business Strategy',
    'Personal Development'
  ]
}

/**
 * Save search to history (localStorage)
 */
export const saveSearchToHistory = (query, filters = {}) => {
  if (!query.trim()) return

  try {
    const history = getSearchHistory()
    const searchItem = {
      query: query.trim(),
      filters,
      timestamp: new Date().toISOString()
    }

    // Remove duplicate if exists
    const filteredHistory = history.filter(item => item.query !== searchItem.query)
    
    // Add to beginning and limit to 10 items
    const updatedHistory = [searchItem, ...filteredHistory].slice(0, 10)
    
    localStorage.setItem('pathways-search-history', JSON.stringify(updatedHistory))
  } catch (error) {
    console.warn('Failed to save search to history:', error)
  }
}

/**
 * Get search history from localStorage
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('pathways-search-history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.warn('Failed to load search history:', error)
    return []
  }
}

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('pathways-search-history')
  } catch (error) {
    console.warn('Failed to clear search history:', error)
  }
}

/**
 * Get search analytics (for creators)
 */
export const getSearchAnalytics = (paths, timeframe = '30d') => {
  // This would typically come from backend analytics
  // Mock implementation for now
  return {
    totalSearches: 1250,
    topQueries: [
      { query: 'React', count: 156 },
      { query: 'JavaScript', count: 134 },
      { query: 'Python', count: 98 },
      { query: 'Web Development', count: 87 },
      { query: 'Data Science', count: 76 }
    ],
    searchTrends: [
      { date: '2024-01-01', searches: 45 },
      { date: '2024-01-02', searches: 52 },
      { date: '2024-01-03', searches: 38 },
      { date: '2024-01-04', searches: 61 },
      { date: '2024-01-05', searches: 49 }
    ],
    conversionRate: 0.23, // 23% of searches lead to enrollments
    avgResultsPerSearch: 8.5
  }
}

/**
 * Debounce function for search input
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format search results count
 */
export const formatResultsCount = (count, query) => {
  if (count === 0) {
    return query ? `No results found for "${query}"` : 'No learning paths found'
  }
  
  if (count === 1) {
    return query ? `1 result for "${query}"` : '1 learning path found'
  }
  
  return query 
    ? `${count.toLocaleString()} results for "${query}"`
    : `${count.toLocaleString()} learning paths found`
}

/**
 * Get filter summary text
 */
export const getFilterSummary = (filters) => {
  const parts = []
  
  if (filters.priceRange?.length > 0) {
    parts.push(`${filters.priceRange.length} price range${filters.priceRange.length > 1 ? 's' : ''}`)
  }
  
  if (filters.difficulty?.length > 0) {
    parts.push(`${filters.difficulty.length} difficulty level${filters.difficulty.length > 1 ? 's' : ''}`)
  }
  
  if (filters.duration?.length > 0) {
    parts.push(`${filters.duration.length} duration${filters.duration.length > 1 ? 's' : ''}`)
  }
  
  if (filters.category) {
    parts.push(`${filters.category} category`)
  }
  
  if (filters.rating > 0) {
    parts.push(`${filters.rating}+ star rating`)
  }
  
  if (parts.length === 0) return ''
  
  return `Filtered by: ${parts.join(', ')}`
}
