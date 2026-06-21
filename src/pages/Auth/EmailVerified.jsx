// src/pages/Auth/EmailVerified.jsx

// React
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// React Icons
import {
  FiCheckCircle,
  FiArrowRight,
  FiLoader,
  FiRotateCw,
  FiAlertCircle
} from 'react-icons/fi';

// Axios
import axios from 'axios';

export default function EmailVerified({ status }) {

  // Navigation
  const navigate = useNavigate();

  // State
  const [countdown, setCountdown] = useState(5);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to profile completion
  const handleContinue = () => {
    setIsRedirecting(true);
    navigate('/profile/complete');
  };

  // Resend verification email
  const handleResendEmail = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      await axios.post('/email/verification-notification', {}, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        }
      });
      setResendStatus('sent');
      // Reset countdown to give user time to check email
      setCountdown(10);
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  // Auto-redirect counter
  useEffect(() => {
    if (countdown > 0 && !isRedirecting) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isRedirecting) {
      navigate('/profile/complete');
    }
  }, [countdown, navigate, isRedirecting]);

  return (
    <>
      <title>Email Verified</title>

      <div className="flex min-h-screen items-center justify-center bg-[#FDFDFC] p-6">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)]">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-semibold text-center text-[#1b1b18]">
            Verification Complete!
          </h2>

          <p className="mb-4 text-center text-[#706f6c]">
            Your email has been verified. Please click the button below to continue.
          </p>

          {/* Status Messages */}
          {status === 'verification-link-sent' && (
            <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
              <FiCheckCircle className="inline h-4 w-4 mr-1" />
              Verification email resent successfully!
            </div>
          )}

          {/* Countdown Timer */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1b1b18] text-white flex items-center justify-center text-sm font-medium">
                {countdown}
              </div>
              <span className="text-sm text-[#706f6c]">seconds until auto-redirect</span>
            </div>
            <p className="text-xs text-[#706f6c] mt-1">
              or click the button below to continue now
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[#19140035] bg-white px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:border-[#1915014a] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FiRotateCw className="h-4 w-4" />
                Resend verification email
              </>
            )}
          </button>

          {resendStatus === 'sent' && (
            <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
              <FiCheckCircle className="inline h-4 w-4 mr-1" />
              Verification email resent! Check your inbox.
            </div>
          )}

          {resendStatus === 'error' && (
            <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              <FiAlertCircle className="inline h-4 w-4 mr-1" />
              Failed to resend. Please try again or contact support.
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isRedirecting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRedirecting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Continue to Profile Setup
                <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="mt-4 text-center text-xs text-[#706f6c]">
            Having issues? <a href="/contact" className="text-blue-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </>
  );
}