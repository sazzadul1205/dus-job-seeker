// src/layouts/AuthLayout.jsx

// React
import { Outlet, Link, useLocation } from 'react-router-dom';

// Helmet
import { Helmet } from 'react-helmet-async';

const AuthLayout = ({ title, description, children }) => {
  const location = useLocation();

  // Determine which auth page we're on
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';
  const isResetPassword = location.pathname.includes('/reset-password');
  const isVerifyEmail = location.pathname === '/verify-email';
  const isEmailVerified = location.pathname === '/email-verified';
  const isConfirmPassword = location.pathname === '/confirm-password';

  // Get page title based on current route
  const getPageTitle = () => {
    if (title) return title;
    if (isLogin) return 'Sign In - Job Match';
    if (isRegister) return 'Create Account - Job Match';
    if (isForgotPassword) return 'Forgot Password - Job Match';
    if (isResetPassword) return 'Reset Password - Job Match';
    if (isVerifyEmail) return 'Verify Email - Job Match';
    if (isEmailVerified) return 'Email Verified - Job Match';
    if (isConfirmPassword) return 'Confirm Password - Job Match';
    return 'Job Match - Find Your Perfect Job';
  };

  // Get page description based on current route
  const getPageDescription = () => {
    if (description) return description;
    if (isLogin) return 'Sign in to your Job Match account and start your job search journey';
    if (isRegister) return 'Create your Job Match account and find your dream job';
    if (isForgotPassword) return 'Reset your Job Match account password';
    if (isResetPassword) return 'Set a new password for your Job Match account';
    if (isVerifyEmail) return 'Verify your email address to activate your Job Match account';
    if (isEmailVerified) return 'Your email has been verified successfully';
    if (isConfirmPassword) return 'Confirm your password for secure access';
    return 'Job Match - The leading job portal for professionals';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        <link rel="canonical" href={`https://jobmatch.com${location.pathname}`} />
      </Helmet>

      <div className="min-h-screen bg-[#FDFDFC] flex flex-col">
        {/* Top Navigation Bar - Only show on certain pages */}
        {(isLogin || isRegister || isForgotPassword) && (
          <nav className="border-b border-[#e3e3e0] bg-white/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="w-9 h-9 bg-[#1b1b18] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                    <span className="text-white font-bold text-lg">JM</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold leading-tight text-[#1b1b18]">Job Match</h1>
                    <p className="text-[10px] text-[#706f6c] leading-none">Find your perfect match</p>
                  </div>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-4">
                  {isLogin ? (
                    <Link
                      to="/register"
                      className="text-sm text-[#706f6c] hover:text-[#1b1b18] transition-colors flex items-center gap-1"
                    >
                      Don't have an account?
                      <span className="font-medium text-[#1b1b18] underline-offset-4 hover:underline">
                        Sign up
                      </span>
                    </Link>
                  ) : isRegister ? (
                    <Link
                      to="/login"
                      className="text-sm text-[#706f6c] hover:text-[#1b1b18] transition-colors flex items-center gap-1"
                    >
                      Already have an account?
                      <span className="font-medium text-[#1b1b18] underline-offset-4 hover:underline">
                        Log in
                      </span>
                    </Link>
                  ) : isForgotPassword ? (
                    <Link
                      to="/login"
                      className="text-sm text-[#706f6c] hover:text-[#1b1b18] transition-colors flex items-center gap-1"
                    >
                      <span className="font-medium text-[#1b1b18] underline-offset-4 hover:underline">
                        Back to login
                      </span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content - Centered vertically and horizontally */}
        <main className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl mx-auto">
            {children ? children : <Outlet />}
          </div>
        </main>

        {/* Footer - Only show on certain pages */}
        {(isLogin || isRegister || isForgotPassword || isResetPassword) && (
          <footer className="border-t border-[#e3e3e0] bg-white/80 backdrop-blur-sm shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-[#706f6c]">
                  © {new Date().getFullYear()} Job Match. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-xs text-[#706f6c]">
                  <Link to="/privacy" className="hover:text-[#1b1b18] transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/terms" className="hover:text-[#1b1b18] transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/contact" className="hover:text-[#1b1b18] transition-colors">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
};

export default AuthLayout;