// pages/auth/confirm-password.jsx - Enhanced Version (Fixed)

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaKey,
  FaUserLock
} from 'react-icons/fa';
import axios from 'axios';

export default function ConfirmPassword() {

  // Navigation
  const navigate = useNavigate();

  // Get current location
  const location = useLocation();

  // Form state
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [password, setPassword] = useState('');
  const [lockTimer, setLockTimer] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Lockout timer
  const lockTimerRef = useRef(null);

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Lockout timer - using a ref to avoid cascading renders
  useEffect(() => {
    if (lockTimer > 0) {
      lockTimerRef.current = setTimeout(() => {
        setLockTimer(prev => prev - 1);
      }, 1000);
      return () => {
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
        }
      };
    }
  }, [lockTimer]);

  // Handle lockout expiry - using a separate effect with proper dependencies
  useEffect(() => {
    if (lockTimer === 0 && isLocked) {
      // Use a timeout to avoid cascading renders
      const timeoutId = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [lockTimer, isLocked]);

  // Check if user is already authenticated
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/user', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          }
        });
        if (isMounted && response.data && response.data.id) {
          // User is authenticated, but we still need to confirm password
          console.log('User authenticated, confirming password...');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        if (isMounted) {
          // Not authenticated, redirect to login
          navigate('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);


  // Handle form submission
  const submit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setErrors({ general: `Account temporarily locked. Please wait ${lockTimer} seconds.` });
      return;
    }

    setProcessing(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const response = await axios.post('/api/password/confirm', {
        password: password,
      }, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setSuccessMessage('Password confirmed successfully!');
        setPassword('');
        setAttempts(0);

        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      }
    } catch (error) {
      setAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimer(300); // 5 minutes lockout
          setErrors({ general: 'Too many failed attempts. Account locked for 5 minutes.' });
          return newAttempts;
        }
        return newAttempts;
      });

      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || { password: 'Invalid password' });
      } else if (error.response && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <title>Confirm password</title>

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-yellow-50 via-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-linear-to-r from-red-400 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl"></div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Logo and Header */}
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="bg-linear-to-r from-yellow-500 to-orange-600 rounded-2xl p-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <FaShieldAlt className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Confirm your password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This is a secure area of the application. Please confirm your password before continuing.
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg animate-fade-in-up animation-delay-100">
            <div className="flex">
              <div className="shrink-0">
                <FaShieldAlt className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  For your security, we need to verify your identity before accessing sensitive areas.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg animate-fade-in-up">
              <div className="flex">
                <div className="shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-fade-in-up">
              <div className="flex">
                <div className="shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attempts Warning */}
          {attempts > 0 && attempts < 5 && !isLocked && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg animate-fade-in-up">
              <div className="flex">
                <div className="shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before account lockout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lockout Notice */}
          {isLocked && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-fade-in-up">
              <div className="flex">
                <div className="shrink-0">
                  <FaUserLock className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Account locked. Please wait {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, '0')} before trying again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Form */}
          <form className="mt-8 space-y-6" onSubmit={submit}>
            <div className="space-y-4">
              {/* Password Field */}
              <div className="animate-fade-in-up animation-delay-200">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLocked}
                    className={`appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 pr-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-all duration-300 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder={isLocked ? 'Account locked' : 'Enter your password'}
                  />
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 animate-slide-in">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || isLocked}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-linear-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up animation-delay-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {processing ? (
                  <FaSpinner className="animate-spin h-5 w-5" />
                ) : isLocked ? (
                  <>
                    <FaUserLock className="h-5 w-5 mr-2" />
                    Account Locked
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <FaCheckCircle className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </span>
                    Confirm password
                    <FaArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Security Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in-up animation-delay-400">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <FaKey className="h-4 w-4 mr-2 text-yellow-600" />
                  Security Tips:
                </h4>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                    Never share your password with anyone
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                    Use a strong, unique password for this account
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                    Enable two-factor authentication for extra security
                  </li>
                </ul>
              </div>
            </div>
          </form>

          {/* Help Section */}
          <div className="text-center text-sm animate-fade-in-up animation-delay-500">
            <p className="text-gray-600">
              <button
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Forgot your password?
              </button>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              <span className="inline-block mr-1">🔒</span>
              This action is logged for security purposes
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
}