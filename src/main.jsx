// dus-job-seeker/src/main.jsx

/**
 * ============================================
 * MAIN - Application Entry Point
 * ============================================
 * 
 * PURPOSE:
 * - Renders the React application into the DOM
 * - Wraps the app with React StrictMode for development checks
 * - Provides React Query context for data fetching
 * 
 * DATA FLOW:
 * 1. QueryProvider provides React Query client to the entire app
 * 2. App contains all routes and page logic
 * 3. App.css provides global styles (Tailwind + custom)
 * 
 * TECHNICAL NOTES:
 * - StrictMode helps catch common bugs in development
 * - QueryProvider enables React Query hooks everywhere
 * - App.css is imported here (not index.css) for cleaner setup
 * 
 * HOW TO RUN: This file is the entry point defined in index.html
 * ============================================
 */

// React
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import global styles (contains Tailwind + custom styles)
import './App.css';

// Main App component
import App from './App.jsx';

// React Query provider for data fetching
import { QueryProvider } from './providers/QueryProvider.jsx';

// ============================================
// RENDER APPLICATION
// ============================================

// Find the root DOM element where the app will be mounted
const rootElement = document.getElementById('root');

// Create a React root and render the app
createRoot(rootElement).render(
  <StrictMode>
    {/* QueryProvider makes React Query available to all components */}
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);