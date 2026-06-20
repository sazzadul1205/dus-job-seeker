// src/providers/QueryProvider.jsx

/**
 * ============================================
 * QUERY PROVIDER - React Query Context Provider
 * ============================================
 * 
 * PURPOSE:
 * - Provides React Query client to the entire application
 * - Enables data fetching, caching, and state management
 * - Shows React Query DevTools in development mode
 * 
 * TECHNICAL NOTES:
 * - React Query handles: caching, retries, stale data, background refetching
 * - DevTools are only shown in development (import.meta.env.DEV)
 * - QueryClient is imported from separate file for consistency
 * 
 * HOW IT WORKS:
 * 1. QueryClientProvider wraps the app with query client context
 * 2. All children can use useQuery, useMutation, etc.
 * 3. DevTools appear as a floating button in bottom-right (DEV only)
 * 
 * USAGE:
 * Wrap the entire app or just the part that needs React Query
 * All hooks (useQuery, useMutation) must be used inside this provider
 * ============================================
 */

// Tanstack
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// QueryClient
import { queryClient } from './queryClient';

/**
 * QueryProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * 
 * @returns {JSX.Element} Provider wrapper with DevTools (in development)
 */
export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only in development mode */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}    // Start closed
          position="bottom-right"  // Floating button position
          buttonPosition="bottom-right" // Button position
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;