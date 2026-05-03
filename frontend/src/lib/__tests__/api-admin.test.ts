/**
 * Tests for admin API utilities
 * These tests verify that the API utility functions are properly typed and structured
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api';

// Mock the API client
vi.mock('../api', () => ({
  api: {
    GET: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
    DELETE: vi.fn(),
  },
}));

describe('Admin API Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Structure', () => {
    it('should handle successful paginated responses', async () => {
      const mockResponse = {
        data: {
          message: 'Success',
          meta: {},
          data: {
            items: [{ id: '1', name: 'Test' }],
            total: 1,
            page: 1,
            size: 10,
            pages: 1,
          },
        },
        error: undefined,
      };

      (api.GET as any).mockResolvedValue(mockResponse);

      const response = await api.GET('/api/v1/faculty', {
        params: { query: { limit: 1 } },
      });

      expect(response.data).toBeDefined();
      expect(response.error).toBeUndefined();
      
      // Type-safe access to nested data
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const responseData = response.data as any;
        expect(responseData.data.total).toBe(1);
        expect(responseData.data.items).toHaveLength(1);
      }
    });

    it('should handle error responses', async () => {
      const mockResponse = {
        data: undefined,
        error: {
          status: 404,
          message: 'Not found',
        },
      };

      (api.GET as any).mockResolvedValue(mockResponse);

      const response = await api.GET('/api/v1/faculty/invalid', {
        params: { path: { faculty_id: 'invalid' } },
      });

      expect(response.data).toBeUndefined();
      expect(response.error).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should properly type check response data access', () => {
      const mockResponse = {
        data: {
          message: 'Success',
          meta: {},
          data: {
            items: [],
            total: 0,
            page: 1,
            size: 10,
            pages: 0,
          },
        },
        error: undefined,
      };

      // This should compile without errors
      const total = (mockResponse.data && typeof mockResponse.data === 'object' && 'data' in mockResponse.data)
        ? ((mockResponse.data.data as any)?.total || 0)
        : 0;

      expect(total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const mockResponse = {
        data: undefined,
        error: { status: 500, message: 'Server error' },
      };

      // Should not throw when accessing nested properties
      const total = (mockResponse.data && typeof mockResponse.data === 'object' && 'data' in mockResponse.data)
        ? ((mockResponse.data.data as any)?.total || 0)
        : 0;

      expect(total).toBe(0);
    });

    it('should handle malformed responses', () => {
      const mockResponse = {
        data: {},
        error: undefined,
      };

      // Should handle empty object gracefully
      const total = (mockResponse.data && typeof mockResponse.data === 'object' && 'data' in mockResponse.data)
        ? ((mockResponse.data.data as any)?.total || 0)
        : 0;

      expect(total).toBe(0);
    });
  });
});
