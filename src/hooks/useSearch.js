import { useState, useEffect, useCallback, useMemo } from 'react'
import { usePaths } from './useApi'
import { 
  filterPaths, 
  sortPaths, 
  getSearchSuggestions,
  saveSearchToHistory,
  getSearchHistory,
  formatResultsCount,
  getFilterSummary,
  debounce
} from '../utils/searchUtils'

/**
 * Custom hook for search functionality
 */
export const useSearch = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters)
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { getPaths, searchPaths, loading, error } = usePaths()

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      setIsSearching(true)
      try {
        if (searchFilters.query) {
          // Save to search history
          saveSearchToHistory(searchFilters.query, searchFilters)
          setSearchHistory(getSearchHistory())
        }
      } catch (err) {
        console.warn('Search failed:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  // Update filters and trigger search
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    debouncedSearch(updatedFilters)
  }, [filters, debouncedSearch])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {}
    setFilters(clearedFilters)
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  // Get suggestions for current query
  const updateSuggestions = useCallback(async (query, allPaths) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const pathSuggestions = getSearchSuggestions(allPaths, query, 5)
    setSuggestions(pathSuggestions)
    setShowSuggestions(pathSuggestions.length > 0)
  }, [])

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false)
  }, [])

  // Select suggestion
  const selectSuggestion = useCallback((suggestion) => {
    updateFilters({ query: suggestion })
    setShowSuggestions(false)
  }, [updateFilters])

  // Search from history
  const searchFromHistory = useCallback((historyItem) => {
    setFilters({ ...historyItem.filters, query: historyItem.query })
    debouncedSearch({ ...historyItem.filters, query: historyItem.query })
  }, [debouncedSearch])

  return {
    // State
    filters,
    isSearching: isSearching || loading,
    error,
    searchHistory,
    suggestions,
    showSuggestions,

    // Actions
    updateFilters,
    clearFilters,
    updateSuggestions,
    hideSuggestions,
    selectSuggestion,
    searchFromHistory
  }
}

/**
 * Hook for client-side search and filtering
 */
export const useClientSearch = (paths = [], initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter and sort paths
  const { filteredPaths, sortedPaths, resultsCount } = useMemo(() => {
    const filtered = filterPaths(paths, filters)
    const sorted = sortPaths(filtered, filters.sortBy, filters.query)
    
    return {
      filteredPaths: filtered,
      sortedPaths: sorted,
      resultsCount: sorted.length
    }
  }, [paths, filters])

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Save search to history if there's a query
    if (updatedFilters.query) {
      saveSearchToHistory(updatedFilters.query, updatedFilters)
    }
  }, [filters])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
    setSuggestions([])
    setShowSuggestions(false)
  }, [])

  // Update suggestions
  const updateSuggestions = useCallback((query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const pathSuggestions = getSearchSuggestions(paths, query, 5)
    setSuggestions(pathSuggestions)
    setShowSuggestions(pathSuggestions.length > 0)
  }, [paths])

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false)
  }, [])

  // Select suggestion
  const selectSuggestion = useCallback((suggestion) => {
    updateFilters({ query: suggestion })
    setShowSuggestions(false)
  }, [updateFilters])

  // Get formatted results text
  const resultsText = useMemo(() => {
    return formatResultsCount(resultsCount, filters.query)
  }, [resultsCount, filters.query])

  // Get filter summary
  const filterSummary = useMemo(() => {
    return getFilterSummary(filters)
  }, [filters])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key]
      return value && (
        (typeof value === 'string' && value.trim() !== '') ||
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'number' && value > 0)
      )
    })
  }, [filters])

  return {
    // Results
    paths: sortedPaths,
    filteredPaths,
    resultsCount,
    resultsText,
    filterSummary,
    hasActiveFilters,

    // State
    filters,
    suggestions,
    showSuggestions,

    // Actions
    updateFilters,
    clearFilters,
    updateSuggestions,
    hideSuggestions,
    selectSuggestion
  }
}

/**
 * Hook for search analytics
 */
export const useSearchAnalytics = (timeframe = '30d') => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // This would typically call an API endpoint
      // For now, using mock data from searchUtils
      const { getSearchAnalytics } = await import('../utils/searchUtils')
      const data = getSearchAnalytics([], timeframe)
      setAnalytics(data)
    } catch (err) {
      setError(err.message || 'Failed to load search analytics')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    reload: loadAnalytics
  }
}

/**
 * Hook for popular searches
 */
export const usePopularSearches = () => {
  const [popularSearches, setPopularSearches] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const { getPopularSearchTerms } = require('../utils/searchUtils')
      setPopularSearches(getPopularSearchTerms())
      setLoading(false)
    }, 500)
  }, [])

  return {
    popularSearches,
    loading
  }
}

/**
 * Hook for search suggestions with caching
 */
export const useSearchSuggestions = (query, paths = []) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Debounced suggestion update
  const debouncedUpdateSuggestions = useCallback(
    debounce((searchQuery, allPaths) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      
      // Simulate API delay
      setTimeout(() => {
        const pathSuggestions = getSearchSuggestions(allPaths, searchQuery, 8)
        setSuggestions(pathSuggestions)
        setLoading(false)
      }, 100)
    }, 200),
    []
  )

  useEffect(() => {
    debouncedUpdateSuggestions(query, paths)
  }, [query, paths, debouncedUpdateSuggestions])

  return {
    suggestions,
    loading
  }
}
