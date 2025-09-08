import React, { useState, useCallback, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  Clock,
  Star,
  BookOpen,
  User
} from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant', icon: Star },
  { value: 'newest', label: 'Newest First', icon: Clock },
  { value: 'oldest', label: 'Oldest First', icon: Clock },
  { value: 'price-low', label: 'Price: Low to High', icon: DollarSign },
  { value: 'price-high', label: 'Price: High to Low', icon: DollarSign },
  { value: 'popular', label: 'Most Popular', icon: User },
  { value: 'rating', label: 'Highest Rated', icon: Star }
]

const PRICE_RANGES = [
  { value: 'free', label: 'Free', min: 0, max: 0 },
  { value: 'under-10', label: 'Under $10', min: 0, max: 10 },
  { value: '10-25', label: '$10 - $25', min: 10, max: 25 },
  { value: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { value: 'over-100', label: 'Over $100', min: 100, max: null }
]

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' }
]

const DURATION_RANGES = [
  { value: 'short', label: 'Under 2 hours', max: 2 },
  { value: 'medium', label: '2-10 hours', min: 2, max: 10 },
  { value: 'long', label: '10+ hours', min: 10 }
]

export const SearchFilters = ({
  onFiltersChange,
  initialFilters = {},
  showAdvanced = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '')
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'relevance')
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [])
  const [difficulty, setDifficulty] = useState(initialFilters.difficulty || [])
  const [duration, setDuration] = useState(initialFilters.duration || [])
  const [category, setCategory] = useState(initialFilters.category || '')
  const [rating, setRating] = useState(initialFilters.rating || 0)
  const [isExpanded, setIsExpanded] = useState(showAdvanced)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFiltersChange()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle other filter changes immediately
  useEffect(() => {
    handleFiltersChange()
  }, [sortBy, priceRange, difficulty, duration, category, rating])

  const handleFiltersChange = useCallback(() => {
    const filters = {
      query: searchQuery.trim(),
      sortBy,
      priceRange,
      difficulty,
      duration,
      category,
      rating
    }

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === '' || 
          (Array.isArray(filters[key]) && filters[key].length === 0) ||
          filters[key] === 0) {
        delete filters[key]
      }
    })

    onFiltersChange?.(filters)
  }, [searchQuery, sortBy, priceRange, difficulty, duration, category, rating, onFiltersChange])

  const handlePriceRangeToggle = useCallback((range) => {
    setPriceRange(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    )
  }, [])

  const handleDifficultyToggle = useCallback((level) => {
    setDifficulty(prev => 
      prev.includes(level)
        ? prev.filter(d => d !== level)
        : [...prev, level]
    )
  }, [])

  const handleDurationToggle = useCallback((dur) => {
    setDuration(prev => 
      prev.includes(dur)
        ? prev.filter(d => d !== dur)
        : [...prev, dur]
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setSortBy('relevance')
    setPriceRange([])
    setDifficulty([])
    setDuration([])
    setCategory('')
    setRating(0)
  }, [])

  const getActiveFilterCount = useCallback(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (sortBy !== 'relevance') count++
    if (priceRange.length > 0) count++
    if (difficulty.length > 0) count++
    if (duration.length > 0) count++
    if (category) count++
    if (rating > 0) count++
    return count
  }, [searchQuery, sortBy, priceRange, difficulty, duration, category, rating])

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          type="text"
          placeholder="Search learning paths..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters and Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-text-secondary hover:text-text-primary"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div>
              <h4 className="font-medium text-text-primary mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Price Range
              </h4>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(range => (
                  <Button
                    key={range.value}
                    variant={priceRange.includes(range.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePriceRangeToggle(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <h4 className="font-medium text-text-primary mb-3 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Difficulty Level
              </h4>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_LEVELS.map(level => (
                  <Button
                    key={level.value}
                    variant={difficulty.includes(level.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDifficultyToggle(level.value)}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h4 className="font-medium text-text-primary mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration
              </h4>
              <div className="flex flex-wrap gap-2">
                {DURATION_RANGES.map(dur => (
                  <Button
                    key={dur.value}
                    variant={duration.includes(dur.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDurationToggle(dur.value)}
                  >
                    {dur.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <h4 className="font-medium text-text-primary mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Minimum Rating
              </h4>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(stars => (
                  <Button
                    key={stars}
                    variant={rating >= stars ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRating(rating === stars ? 0 : stars)}
                    className="flex items-center space-x-1"
                  >
                    <Star className="h-3 w-3" />
                    <span>{stars}+</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <h4 className="font-medium text-text-primary mb-3">Category</h4>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
                <option value="personal-development">Personal Development</option>
                <option value="language">Language Learning</option>
                <option value="music">Music</option>
                <option value="art">Art</option>
                <option value="health">Health & Fitness</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchQuery.trim() && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {sortBy !== 'relevance' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              <button
                onClick={() => setSortBy('relevance')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {priceRange.map(range => (
            <Badge key={range} variant="secondary" className="flex items-center space-x-1">
              <span>{PRICE_RANGES.find(p => p.value === range)?.label}</span>
              <button
                onClick={() => handlePriceRangeToggle(range)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {difficulty.map(level => (
            <Badge key={level} variant="secondary" className="flex items-center space-x-1">
              <span>{DIFFICULTY_LEVELS.find(d => d.value === level)?.label}</span>
              <button
                onClick={() => handleDifficultyToggle(level)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {duration.map(dur => (
            <Badge key={dur} variant="secondary" className="flex items-center space-x-1">
              <span>{DURATION_RANGES.find(d => d.value === dur)?.label}</span>
              <button
                onClick={() => handleDurationToggle(dur)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {category && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Category: {category}</span>
              <button
                onClick={() => setCategory('')}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {rating > 0 && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{rating}+ Stars</span>
              <button
                onClick={() => setRating(0)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
