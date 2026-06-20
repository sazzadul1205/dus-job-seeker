// React
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/**
 * LoadingSpinner - Shown while page data is being fetched
 * Uses Tailwind CSS for styling with the brand color (#009BE2)
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#009BE2] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="mt-4 text-[#515151]">Loading...</p>
    </div>
  </div>
);


/**
 * NotFound - Shown when a route doesn't match any page
 * 404 page with a link back to home
 */
const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="bg-[#009BE2] text-white px-6 py-2 rounded-lg hover:bg-[#009BE2]/80 transition-colors inline-block">
        Go Home
      </a>
    </div>
  </div>
);


function App() {

  return (
    <HelmetProvider> {/* Provides SEO metadata management */}
      <Router> {/* React Router for navigation */}
        <Suspense fallback={<LoadingSpinner />}> {/* Handles lazy loading states */}
          <Routes>

            {/* Catch-all route for 404 - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router >
    </HelmetProvider >

  )
}

export default App
