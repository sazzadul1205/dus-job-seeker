// src/pages/Auth/ResetPassword.jsx

// React
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// React Icons
import {
  FiLoader,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiKey,
  FiCheckCircle,
  FiArrowRight,
  FiAlertCircle,
  FiChevronLeft
} from 'react-icons/fi';

// Axios
import axios from 'axios';

export default function ResetPassword() {

  // Navigation
  const navigate = useNavigate();

  // Get current location
  const location = useLocation();

  // Get token from URL
  const { token } = useParams();

  // Get email from query params
  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email');

  // Form state
  const [formData, setFormData] = useState({
    email: emailParam || '',
    password: '',
    password_confirmation: '',
  });

  // Form state
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker
  useEffect(() => {
    const checkStrength = (pass) => {
      let strength = 0;
      if (pass.length >= 8) strength += 1;
      if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength += 1;
      if (pass.match(/[0-9]/)) strength += 1;
      if (pass.match(/[^a-zA-Z0-9]/)) strength += 1;
      setPasswordStrength(strength);
    };
    checkStrength(formData.password);
  }, [formData.password]);


  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const response = await axios.post('/api/password/reset', {
        token: token,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
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

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return 'bg-gray-200';
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (formData.password.length === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <title>Reset Password</title>

      <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8">
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full max-w-83.75 flex-col lg:max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#1b1b18] rounded-lg flex items-center justify-center">
                  <FiKey className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-[#1b1b18]">
                Reset Your Password
              </h2>
              <p className="mt-2 text-sm text-[#706f6c]">
                Please enter your new password below
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700 animate-fadeIn">
                <FiCheckCircle className="inline h-4 w-4 mr-1" />
                {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
                <FiAlertCircle className="inline h-4 w-4 mr-1" />
                {errors.general}
              </div>
            )}

            {/* Reset Password Form */}
            <form className="flex flex-col gap-6" onSubmit={submit}>
              <div className="grid gap-5">
                {/* Email Field */}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-[#706f6c]" />
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={!!emailParam}
                      className={`w-full rounded-sm border border-[#19140035] px-3 py-2.5 text-sm ${emailParam
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'focus:outline-none'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* New Password Field */}
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <FiLock className="h-4 w-4 text-[#706f6c]" />
                    New Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'ring-1 ring-[#1b1b18]' : ''}`}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter new password"
                      className="w-full rounded-sm border border-[#19140035] px-3 py-2.5 pr-10 text-sm focus:outline-none placeholder:text-[#706f6c]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#706f6c] hover:text-[#1b1b18] transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.password.length > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#706f6c]">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <p className="text-xs text-[#706f6c] mt-1">
                        Password must be at least 8 characters
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="grid gap-2">
                  <label htmlFor="password_confirmation" className="text-sm font-medium flex items-center gap-2">
                    <FiShield className="h-4 w-4 text-[#706f6c]" />
                    Confirm Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'confirm' ? 'ring-1 ring-[#1b1b18]' : ''}`}>
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirm')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm your new password"
                      className="w-full rounded-sm border border-[#19140035] px-3 py-2.5 pr-10 text-sm focus:outline-none placeholder:text-[#706f6c]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#706f6c] hover:text-[#1b1b18] transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.password_confirmation}
                    </p>
                  )}
                  {formData.password && formData.password_confirmation &&
                    formData.password === formData.password_confirmation && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <FiCheckCircle className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="group relative inline-flex w-full items-center justify-center gap-2 rounded-sm border border-black bg-[#1b1b18] px-5 py-2.5 text-sm font-medium leading-normal text-white hover:border-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {processing ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="h-4 w-4" />
                      Reset Password
                      <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
                <FiChevronLeft className="h-4 w-4 mr-1" />
                Back to log in
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-6 rounded-sm border border-blue-200 bg-blue-50 p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔒 Password requirements:</h4>
              <ul className="space-y-1 text-xs text-blue-700">
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full mr-2"></span>
                  At least 8 characters long
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Use a mix of letters, numbers, and symbols
                </li>
                <li className="flex items-center">
                  <span className="h-1.5 w-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Don't use common or easily guessed passwords
                </li>
              </ul>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#706f6c]">
                Choose a strong password to keep your account secure
              </p>
            </div>
          </main>
        </div>
        <div className="hidden h-14.5 lg:block"></div>
      </div>
    </>
  );
}