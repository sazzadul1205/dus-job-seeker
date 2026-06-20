// src/providers/queryClient.js

/**
 * ============================================
 * QUERY CLIENT - React Query Configuration
 * ============================================
 *
 * PURPOSE:
 * - Configures React Query with application-wide defaults
 * - Controls caching behavior, retry logic, and stale time
 * - Single source of truth for query configuration
 *
 * CONFIGURATION BREAKDOWN:
 *
 * Query Defaults (for useQuery):
 * - staleTime: 5 minutes - Data considered fresh for 5 mins
 * - gcTime: 10 minutes - Garbage collection time
 * - retry: 2 attempts - Retry failed queries twice
 * - retryDelay: Exponential backoff - starts at 1s, doubles, max 30s
 * - refetchOnWindowFocus: false - Don't refetch when switching tabs
 * - refetchOnMount: true - Refetch when component mounts
 * - refetchOnReconnect: true - Refetch when network reconnects
 * - placeholderData: Keep previous data while fetching new
 * - throwOnError: false - Don't throw errors, return error state
 *
 * Mutation Defaults (for useMutation):
 * - retry: 1 - Retry failed mutations once
 * - retryDelay: 1000ms - Wait 1s before retrying
 *
 * ============================================
 */

// Tanstack
import { QueryClient } from "@tanstack/react-query";

/**
 * Configured Query Client instance
 * Shared across the entire application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered "fresh" for 5 minutes
      // No refetch if data is fresh
      staleTime: 5 * 60 * 1000,

      // Cache is garbage collected after 10 minutes
      // Data stays in cache even if components unmount
      gcTime: 10 * 60 * 1000,

      // Retry failed queries up to 2 times
      retry: 2,

      // Exponential backoff: 1s, 2s, 4s, 8s, up to 30s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch when user switches to another tab
      refetchOnWindowFocus: false,

      // Refetch when component mounts (even if data is stale)
      refetchOnMount: true,

      // Refetch when network reconnects
      refetchOnReconnect: true,

      // Keep previous data while fetching new data
      placeholderData: (previousData) => previousData,

      // Don't throw errors to error boundaries
      // Instead, return error state that components can handle
      throwOnError: false,
    },
    mutations: {
      // Mutations (POST, PUT, DELETE) retry once
      retry: 1,

      // Wait 1 second before retrying mutation
      retryDelay: 1000,
    },
  },
});
