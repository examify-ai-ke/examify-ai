/**
 * Standardized error handling utilities for API calls
 * Provides consistent error handling and user-friendly messages
 */

export interface APIError {
  status?: number
  message?: string
  detail?: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

export interface APIResponse<T> {
  data?: T
  error?: APIError
}

export interface ErrorHandlingOptions {
  operation: string
  showNotification?: boolean
  fallbackMessage?: string
  retryable?: boolean
}

export interface ErrorResult {
  title: string
  message: string
  type: 'error' | 'warning' | 'info'
  retryable: boolean
}

/**
 * Standardized error handler for API responses
 */
export function handleAPIError(
  error: APIError | unknown,
  options: ErrorHandlingOptions
): ErrorResult {
  console.error(`❌ ${options.operation} error:`, error)

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    console.error('🌐 Network Error Details:', {
      operation: options.operation,
      causes: [
        '1. Backend server not running',
        '2. Network connectivity issue',
        '3. CORS configuration problem',
        '4. Firewall blocking the request'
      ]
    })

    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your connection and try again.',
      type: 'error',
      retryable: true
    }
  }

  // Handle API errors with status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as APIError
    
    switch (apiError.status) {
      case 400:
        // Handle specific 400 cases
        if (apiError.detail && typeof apiError.detail === 'string' && apiError.detail.includes('already associated')) {
          return {
            title: 'Already Associated',
            message: 'This question set is already associated with the exam paper.',
            type: 'warning',
            retryable: false
          }
        }
        
        return {
          title: 'Invalid Request',
          message: apiError.message || `Invalid request for ${options.operation}. Please check your input.`,
          type: 'error',
          retryable: false
        }
      
      case 401:
        return {
          title: 'Authentication Required',
          message: 'Your session has expired. Please log in again.',
          type: 'error',
          retryable: false
        }
      
      case 403:
        return {
          title: 'Access Denied',
          message: `You don't have permission to ${options.operation.toLowerCase()}.`,
          type: 'error',
          retryable: false
        }
      
      case 404:
        return {
          title: 'Not Found',
          message: apiError.message || `The requested resource for ${options.operation} was not found.`,
          type: 'warning',
          retryable: false
        }
      
      case 409:
        // Handle specific conflict cases
        if (apiError.detail && typeof apiError.detail === 'string' && apiError.detail.includes('already associated')) {
          return {
            title: 'Already Associated',
            message: 'This question set is already associated with the exam paper.',
            type: 'warning',
            retryable: false
          }
        }
        
        return {
          title: 'Conflict',
          message: apiError.message || `A conflict occurred while ${options.operation.toLowerCase()}. The resource may have been modified.`,
          type: 'warning',
          retryable: true
        }
      
      case 422:
        // Handle validation errors
        if (apiError.detail && Array.isArray(apiError.detail)) {
          const validationMessages = apiError.detail
            .map(detail => `${detail.loc.join('.')}: ${detail.msg}`)
            .join(', ')
          
          return {
            title: 'Validation Error',
            message: `Validation failed: ${validationMessages}`,
            type: 'error',
            retryable: false
          }
        }
        
        return {
          title: 'Validation Error',
          message: apiError.message || `Invalid data provided for ${options.operation}.`,
          type: 'error',
          retryable: false
        }
      
      case 429:
        return {
          title: 'Rate Limited',
          message: 'Too many requests. Please wait a moment and try again.',
          type: 'warning',
          retryable: true
        }
      
      case 500:
        return {
          title: 'Server Error',
          message: `A server error occurred while ${options.operation.toLowerCase()}. Please try again later.`,
          type: 'error',
          retryable: true
        }
      
      case 502:
      case 503:
      case 504:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          type: 'error',
          retryable: true
        }
      
      default:
        return {
          title: 'Unexpected Error',
          message: apiError.message || `An unexpected error occurred while ${options.operation.toLowerCase()} (Error ${apiError.status}).`,
          type: 'error',
          retryable: options.retryable ?? true
        }
    }
  }

  // Handle JavaScript errors
  if (error instanceof Error) {
    return {
      title: 'Operation Failed',
      message: `${options.operation} failed: ${error.message}`,
      type: 'error',
      retryable: options.retryable ?? false
    }
  }

  // Handle unknown errors
  return {
    title: 'Unknown Error',
    message: options.fallbackMessage || `An unknown error occurred while ${options.operation.toLowerCase()}.`,
    type: 'error',
    retryable: options.retryable ?? false
  }
}

/**
 * Retry mechanism for API calls
 */
export async function retryAPICall<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: {
    maxRetries?: number
    retryDelay?: number
    operation: string
  }
): Promise<APIResponse<T>> {
  const { maxRetries = 3, retryDelay = 1000, operation } = options
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operation} - Attempt ${attempt}/${maxRetries}`)
      const result = await apiCall()
      
      if (!result.error) {
        if (attempt > 1) {
          console.log(`✅ ${operation} succeeded on attempt ${attempt}`)
        }
        return result
      }
      
      // Check if error is retryable
      const errorResult = handleAPIError(result.error, { operation })
      if (!errorResult.retryable || attempt === maxRetries) {
        return result
      }
      
      console.log(`⚠️ ${operation} failed on attempt ${attempt}, retrying in ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
    } catch (error) {
      const errorResult = handleAPIError(error, { operation })
      if (!errorResult.retryable || attempt === maxRetries) {
        return { error: error as APIError }
      }
      
      console.log(`⚠️ ${operation} failed on attempt ${attempt}, retrying in ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
  
  return { error: { message: `${operation} failed after ${maxRetries} attempts` } }
}

/**
 * Enhanced logging for API operations
 */
export function logAPIOperation(
  operation: string,
  params?: any,
  result?: any,
  duration?: number
) {
  const logData: any = {
    operation,
    timestamp: new Date().toISOString(),
  }
  
  if (params) {
    logData.params = params
  }
  
  if (duration !== undefined) {
    logData.duration = `${duration}ms`
  }
  
  if (result?.error) {
    logData.status = 'error'
    logData.error = result.error
    console.error('🚨 API Operation Failed:', logData)
  } else if (result?.data) {
    logData.status = 'success'
    logData.dataType = typeof result.data
    if (Array.isArray(result.data)) {
      logData.itemCount = result.data.length
    }
    console.log('✅ API Operation Successful:', logData)
  } else {
    logData.status = 'unknown'
    console.warn('⚠️ API Operation Result Unknown:', logData)
  }
}

/**
 * Wrapper for API calls with standardized error handling and logging
 * @deprecated Use executeAPICallWithMonitoring instead
 */
async function executeAPICallBase<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: ErrorHandlingOptions & {
    enableRetry?: boolean
    maxRetries?: number
    retryDelay?: number
    logParams?: any
  }
): Promise<{ result: APIResponse<T>; errorResult?: ErrorResult }> {
  const startTime = Date.now()
  
  try {
    let result: APIResponse<T>
    
    if (options.enableRetry) {
      result = await retryAPICall(apiCall, {
        maxRetries: options.maxRetries,
        retryDelay: options.retryDelay,
        operation: options.operation
      })
    } else {
      result = await apiCall()
    }
    
    const duration = Date.now() - startTime
    logAPIOperation(options.operation, options.logParams, result, duration)
    
    if (result.error) {
      const errorResult = handleAPIError(result.error, options)
      return { result, errorResult }
    }
    
    return { result }
    
  } catch (error) {
    const duration = Date.now() - startTime
    logAPIOperation(options.operation, options.logParams, { error }, duration)
    
    const errorResult = handleAPIError(error, options)
    return { 
      result: { error: error as APIError }, 
      errorResult 
    }
  }
}
/**
 *
 Performance monitoring for API calls
 */
export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: string
  success: boolean
  retryCount?: number
  dataSize?: number
}

class APIPerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // Keep last 100 metrics

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    // Log slow operations (> 5 seconds)
    if (metric.duration > 5000) {
      console.warn('🐌 Slow API Operation:', {
        operation: metric.operation,
        duration: `${metric.duration}ms`,
        success: metric.success
      })
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageResponseTime(operation?: string): number {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics
    
    if (filteredMetrics.length === 0) return 0
    
    const totalTime = filteredMetrics.reduce((sum, m) => sum + m.duration, 0)
    return Math.round(totalTime / filteredMetrics.length)
  }

  getSuccessRate(operation?: string): number {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics
    
    if (filteredMetrics.length === 0) return 0
    
    const successCount = filteredMetrics.filter(m => m.success).length
    return Math.round((successCount / filteredMetrics.length) * 100)
  }

  logSummary() {
    console.group('📊 API Performance Summary')
    console.log('Total API calls:', this.metrics.length)
    console.log('Average response time:', `${this.getAverageResponseTime()}ms`)
    console.log('Success rate:', `${this.getSuccessRate()}%`)
    
    // Group by operation
    const operationGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.operation]) {
        groups[metric.operation] = []
      }
      groups[metric.operation].push(metric)
      return groups
    }, {} as Record<string, PerformanceMetrics[]>)
    
    Object.entries(operationGroups).forEach(([operation, metrics]) => {
      const avgTime = Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)
      const successRate = Math.round((metrics.filter(m => m.success).length / metrics.length) * 100)
      console.log(`${operation}:`, `${metrics.length} calls, ${avgTime}ms avg, ${successRate}% success`)
    })
    
    console.groupEnd()
  }
}

// Global performance monitor instance
export const apiPerformanceMonitor = new APIPerformanceMonitor()

/**
 * Enhanced executeAPICall with performance monitoring
 */
export async function executeAPICallWithMonitoring<T>(
  apiCall: () => Promise<APIResponse<T>>,
  options: ErrorHandlingOptions & {
    enableRetry?: boolean
    maxRetries?: number
    retryDelay?: number
    logParams?: any
  }
): Promise<{ result: APIResponse<T>; errorResult?: ErrorResult }> {
  const startTime = Date.now()
  let retryCount = 0
  
  try {
    let result: APIResponse<T>
    
    if (options.enableRetry) {
      // Custom retry with monitoring
      const { maxRetries = 3, retryDelay = 1000 } = options
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 ${options.operation} - Attempt ${attempt}/${maxRetries}`)
          result = await apiCall()
          
          if (!result.error) {
            if (attempt > 1) {
              console.log(`✅ ${options.operation} succeeded on attempt ${attempt}`)
              retryCount = attempt - 1
            }
            break
          }
          
          // Check if error is retryable
          const errorResult = handleAPIError(result.error, options)
          if (!errorResult.retryable || attempt === maxRetries) {
            break
          }
          
          console.log(`⚠️ ${options.operation} failed on attempt ${attempt}, retrying in ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          retryCount = attempt
          
        } catch (error) {
          const errorResult = handleAPIError(error, options)
          if (!errorResult.retryable || attempt === maxRetries) {
            result = { error: error as APIError }
            break
          }
          
          console.log(`⚠️ ${options.operation} failed on attempt ${attempt}, retrying in ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          retryCount = attempt
        }
      }
    } else {
      result = await apiCall()
    }
    
    const duration = Date.now() - startTime
    const success = !result!.error
    
    // Calculate data size if available
    let dataSize: number | undefined
    if (result!.data) {
      try {
        dataSize = JSON.stringify(result!.data).length
      } catch {
        // Ignore JSON stringify errors
      }
    }
    
    // Add performance metric
    apiPerformanceMonitor.addMetric({
      operation: options.operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      retryCount: retryCount > 0 ? retryCount : undefined,
      dataSize
    })
    
    logAPIOperation(options.operation, options.logParams, result, duration)
    
    if (result!.error) {
      const errorResult = handleAPIError(result!.error, options)
      return { result: result!, errorResult }
    }
    
    return { result: result! }
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Add performance metric for exception
    apiPerformanceMonitor.addMetric({
      operation: options.operation,
      duration,
      timestamp: new Date().toISOString(),
      success: false,
      retryCount: retryCount > 0 ? retryCount : undefined
    })
    
    logAPIOperation(options.operation, options.logParams, { error }, duration)
    
    const errorResult = handleAPIError(error, options)
    return { 
      result: { error: error as APIError }, 
      errorResult 
    }
  }
}

// Export the enhanced version as the default
export { executeAPICallWithMonitoring as executeAPICall }