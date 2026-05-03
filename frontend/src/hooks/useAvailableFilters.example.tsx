/**
 * Example usage of useAvailableFilters hook
 * This file demonstrates how to use the hook in a component
 */

'use client';

import { useAvailableFilters } from './useAvailableFilters';

export function AvailableFiltersExample() {
  const { data, isLoading, isError, error } = useAvailableFilters();
  
  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Loading Available Filters...</h2>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Filters</h2>
        <p className="text-red-600">{error?.message || 'Unknown error occurred'}</p>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-4">
        <p>No filter data available</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Available Filters</h2>
      
      {/* Institutions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Institutions ({data.institutions.length})
        </h3>
        <div className="space-y-1">
          {data.institutions.slice(0, 5).map(inst => (
            <div key={inst.value} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`inst-${inst.value}`}
                className="rounded"
              />
              <label htmlFor={`inst-${inst.value}`} className="text-sm">
                {inst.label}
                {inst.count !== undefined && (
                  <span className="text-gray-500 ml-1">({inst.count})</span>
                )}
              </label>
            </div>
          ))}
          {data.institutions.length > 5 && (
            <p className="text-sm text-gray-500">
              ... and {data.institutions.length - 5} more
            </p>
          )}
        </div>
      </div>
      
      {/* Courses */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Courses ({data.courses.length})
        </h3>
        <div className="space-y-1">
          {data.courses.slice(0, 5).map(course => (
            <div key={course.value} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`course-${course.value}`}
                className="rounded"
              />
              <label htmlFor={`course-${course.value}`} className="text-sm">
                {course.label}
              </label>
            </div>
          ))}
          {data.courses.length > 5 && (
            <p className="text-sm text-gray-500">
              ... and {data.courses.length - 5} more
            </p>
          )}
        </div>
      </div>
      
      {/* Years */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Years ({data.years.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.years.map(year => (
            <button
              key={year.value}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {year.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tags */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Tags ({data.tags.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.tags.slice(0, 10).map(tag => (
            <button
              key={tag.value}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm"
            >
              {tag.label}
              {tag.count !== undefined && (
                <span className="ml-1 text-xs text-gray-600">({tag.count})</span>
              )}
            </button>
          ))}
          {data.tags.length > 10 && (
            <span className="text-sm text-gray-500">
              +{data.tags.length - 10} more
            </span>
          )}
        </div>
      </div>
      
      {/* Duration Range */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Duration Range</h3>
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm text-gray-600">Min</label>
            <input
              type="number"
              min={data.durationRange.min}
              max={data.durationRange.max}
              defaultValue={data.durationRange.min}
              className="block w-24 px-2 py-1 border rounded"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div>
            <label className="text-sm text-gray-600">Max</label>
            <input
              type="number"
              min={data.durationRange.min}
              max={data.durationRange.max}
              defaultValue={data.durationRange.max}
              className="block w-24 px-2 py-1 border rounded"
            />
          </div>
          <span className="text-sm text-gray-500">minutes</span>
        </div>
      </div>
      
      {/* Date Range */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Exam Date Range</h3>
        <div className="flex gap-4 items-center">
          <div>
            <label className="text-sm text-gray-600">From</label>
            <input
              type="date"
              min={data.dateRange.min}
              max={data.dateRange.max}
              defaultValue={data.dateRange.min}
              className="block px-2 py-1 border rounded"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div>
            <label className="text-sm text-gray-600">To</label>
            <input
              type="date"
              min={data.dateRange.min}
              max={data.dateRange.max}
              defaultValue={data.dateRange.max}
              className="block px-2 py-1 border rounded"
            />
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Institutions:</span>
            <span className="ml-2 font-medium">{data.institutions.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Courses:</span>
            <span className="ml-2 font-medium">{data.courses.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Years:</span>
            <span className="ml-2 font-medium">{data.years.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Tags:</span>
            <span className="ml-2 font-medium">{data.tags.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium">
              {data.durationRange.min} - {data.durationRange.max} min
            </span>
          </div>
          <div>
            <span className="text-gray-600">Date Range:</span>
            <span className="ml-2 font-medium">
              {data.dateRange.min} to {data.dateRange.max}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
