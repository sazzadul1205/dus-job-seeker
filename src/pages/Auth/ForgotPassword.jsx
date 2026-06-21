// src/pages/Auth/Shared/ForgotPassword.jsx

// React
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// React Icons
import {
  FiLoader,
  FiMail,
  FiArrowLeft,
  FiSend,
  FiKey,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiInfo
} from 'react-icons/fi';

// Axios
import axios from 'axios';

export default function ForgotPassword({ status: propStatus }) {

  // Hooks
  const navigate = useNavigate();

  // State
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [status, setStatus] = useState(propStatus || null);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle form submission
  const submit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setProcessing(true);
    setErrors({});
    setStatus(null);

    try {
      const response = await axios.post('/api/password/email', {
        email: email,
      }, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setStatus(response.data.message || 'We have emailed your password reset link!');
        setEmail('');
        setResendCooldown(60); // 60 second cooldown

        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setErrors({
          general: 'Too many attempts. Please wait a moment before trying again.'
        });
      } else if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
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
      <title>Forgot Password</title>

      <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8">
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full max-w-83.75 flex-col lg:max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#1b1b18] rounded-lg flex items-center justify-center transform transition-transform hover:scale-105">
                  <FiKey className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-[#1b1b18]">
                Forgot Password?
              </h2>
              <p className="mt-2 text-sm text-[#706f6c]">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {/* Status Message */}
            {status && (
              <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-4 text-center animate-fadeIn">
                <div className="flex items-center justify-center mb-1">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Email sent!</span>
                </div>
                <p className="text-xs text-green-600">
                  {status}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600">
                  <FiClock className="h-3 w-3" />
                  <span>Redirecting to login in a few seconds...</span>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
                <FiAlertCircle className="inline h-4 w-4 mr-1" />
                {errors.general}
              </div>
            )}

            {/* Cooldown Notice */}
            {resendCooldown > 0 && (
              <div className="mb-4 rounded-sm border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-700">
                <FiInfo className="inline h-4 w-4 mr-1" />
                Please wait {resendCooldown} seconds before requesting another reset link
              </div>
            )}

            {/* Forgot Password Form */}
            <form className="flex flex-col gap-6" onSubmit={submit}>
              <div className="grid gap-5">
                {/* Email Field */}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-[#706f6c]" />
                    Email address
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'ring-1 ring-[#1b1b18]' : ''
                    } ${errors.email ? 'ring-1 ring-red-500' : ''}`}>
                    <input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="email@example.com"
                      className={`w-full rounded-sm border ${errors.email ? 'border-red-500' : 'border-[#19140035]'
                        } px-3 py-2.5 text-sm focus:outline-none placeholder:text-[#706f6c]`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
                  <p className="text-xs text-[#706f6c] flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-[#706f6c] rounded-full"></span>
                    We'll send a password reset link to this email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || resendCooldown > 0}
                  className="group relative inline-flex w-full items-center justify-center gap-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2.5 text-sm font-medium leading-normal text-white hover:border-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {processing ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="h-4 w-4" />
                      {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Send Reset Link'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-sm text-[#706f6c] hover:text-[#1b1b18] transition-colors"
              >
                <FiArrowLeft className="h-4 w-4 mr-1" />
                Back to log in
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-6 rounded-sm border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Tips:</h4>
              <ul className="space-y-1 text-xs text-yellow-700">
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                  Check your spam or junk folder if you don't see the email
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                  The reset link expires in 60 minutes
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-2"></span>
                  Make sure to use the email address you registered with
                </li>
              </ul>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#706f6c] flex items-center justify-center gap-1">
                <FiClock className="h-3 w-3" />
                We'll send a password reset link to your email address
              </p>
            </div>
          </main>
        </div>
        <div className="hidden h-14.5 lg:block"></div>
      </div>
    </>
  );
}