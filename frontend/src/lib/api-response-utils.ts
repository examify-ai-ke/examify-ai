/**
 * Utility functions for parsing API responses consistently
 * Handles different response structures from the backend API
 */

export interface APIResponse<T> {
  data?: {
    data?: {
      items?: T[]
      total?: number
    } | T[]
  } | T[]
  error?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  total?: number
  page?: number
  size?: number
}

/**
 * Parse question sets response from different API response structures
 * Handles various nesting patterns: data.data.items, data.items, direct array, data.data
 */
export function parseQuestionSetsResponse<T>(response: APIResponse<T>): T[] {
  console.log('🔍 Parsing question sets response:', {
    hasData: !!response.data,
    dataType: typeof response.data,
    isArray: Array.isArray(response.data),
    hasError: !!response.error
  })

  if (response.error) {
    console.warn('⚠️ API response contains error:', response.error)
    return []
  }

  if (!response.data) {
    console.warn('⚠️ No data in API response')
    return []
  }

  let questionSets: T[] = []

  // Handle nested structure: data.data.items
  if (typeof response.data === 'object' && 'data' in response.data && response.data.data) {
    const nestedData = response.data.data
    if (typeof nestedData === 'object' && 'items' in nestedData && Array.isArray(nestedData.items)) {
      questionSets = nestedData.items
      console.log('✅ Extracted from data.data.items:', questionSets.length, 'items')
    } else if (Array.isArray(nestedData)) {
      questionSets = nestedData
      console.log('✅ Extracted from data.data (array):', questionSets.length, 'items')
    }
  }
  // Handle structure: data.items
  else if (typeof response.data === 'object' && 'items' in response.data && Array.isArray(response.data.items)) {
    questionSets = response.data.items
    console.log('✅ Extracted from data.items:', questionSets.length, 'items')
  }
  // Handle direct array: data (array)
  else if (Array.isArray(response.data)) {
    questionSets = response.data
    console.log('✅ Extracted from data (direct array):', questionSets.length, 'items')
  }
  // Fallback: empty array
  else {
    console.warn('⚠️ Unrecognized response structure, returning empty array')
    console.log('Response data structure:', JSON.stringify(response.data, null, 2))
  }

  return questionSets
}

/**
 * Parse paginated response and extract items with metadata
 */
export function parsePaginatedResponse<T>(response: APIResponse<T>): PaginatedResponse<T> {
  const items = parseQuestionSetsResponse(response)
  
  let total: number | undefined
  let page: number | undefined
  let size: number | undefined

  // Try to extract pagination metadata
  if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data) {
    const nestedData = response.data.data
    if (typeof nestedData === 'object' && 'total' in nestedData) {
      total = nestedData.total as number
    }
    if (typeof nestedData === 'object' && 'page' in nestedData) {
      page = nestedData.page as number
    }
    if (typeof nestedData === 'object' && 'size' in nestedData) {
      size = nestedData.size as number
    }
  }

  return {
    items,
    total,
    page,
    size
  }
}

/**
 * Log API response structure for debugging
 */
export function logResponseStructure(response: any, context: string = 'API Response'): void {
  console.group(`🔍 ${context} Structure Analysis`)
  
  console.log('Response type:', typeof response)
  console.log('Has data:', !!response?.data)
  console.log('Has error:', !!response?.error)
  
  if (response?.data) {
    console.log('Data type:', typeof response.data)
    console.log('Data is array:', Array.isArray(response.data))
    
    if (typeof response.data === 'object' && !Array.isArray(response.data)) {
      console.log('Data keys:', Object.keys(response.data))
      
      if ('data' in response.data) {
        console.log('Nested data type:', typeof response.data.data)
        console.log('Nested data is array:', Array.isArray(response.data.data))
        
        if (typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          console.log('Nested data keys:', Object.keys(response.data.data))
        }
      }
    }
  }
  
  if (response?.error) {
    console.log('Error details:', response.error)
  }
  
  console.groupEnd()
}

/**
 * Validate question set data structure
 */
export function validateQuestionSetData(questionSet: any): boolean {
  if (!questionSet || typeof questionSet !== 'object') {
    return false
  }

  // Required fields
  if (!questionSet.id || typeof questionSet.id !== 'string') {
    return false
  }

  // Optional but expected fields should have correct types if present
  if (questionSet.title !== null && questionSet.title !== undefined && typeof questionSet.title !== 'string') {
    return false
  }

  if (questionSet.slug !== null && questionSet.slug !== undefined && typeof questionSet.slug !== 'string') {
    return false
  }

  if (questionSet.questions_count !== null && questionSet.questions_count !== undefined && typeof questionSet.questions_count !== 'number') {
    return false
  }

  if (questionSet.exam_papers_count !== null && questionSet.exam_papers_count !== undefined && typeof questionSet.exam_papers_count !== 'number') {
    return false
  }

  return true
}

/**
 * Sanitize question set data to ensure consistent structure
 */
export function sanitizeQuestionSetData(questionSet: any): any {
  if (!validateQuestionSetData(questionSet)) {
    console.warn('⚠️ Invalid question set data:', questionSet)
    return null
  }

  return {
    id: questionSet.id,
    title: questionSet.title || null,
    slug: questionSet.slug || null,
    questions_count: questionSet.questions_count || 0,
    exam_papers_count: questionSet.exam_papers_count || 0,
    // Include any additional fields that might be present
    ...Object.keys(questionSet).reduce((acc, key) => {
      if (!['id', 'title', 'slug', 'questions_count', 'exam_papers_count'].includes(key)) {
        acc[key] = questionSet[key]
      }
      return acc
    }, {} as any)
  }
}