// src/App.jsx

// React
import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from "./pages/Auth/Login";
import Register from './pages/Auth/Register';
import AuthLayout from './Layout/AuthLayout';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import EmailVerified from './pages/Auth/EmailVerified';
import ConfirmPassword from './pages/Auth/ConfirmPassword';
import CompleteProfile from './pages/Auth/CompleteProfile';
import Dashboard from './pages/Dashboard/Dashboard';

/**
 * LoadingSpinner - Shown while page data is being fetched
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
 * NotFound - 404 page
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
    <HelmetProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Auth Routes using AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/confirm-password" element={<ConfirmPassword />} />
              <Route path="/profile/complete" element={<CompleteProfile />} />
            </Route>

            {/* Dashboard route - WITHOUT layout wrapper */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;