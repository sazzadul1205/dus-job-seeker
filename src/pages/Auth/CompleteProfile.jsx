// src/pages/Auth/JobSeeker/CompleteProfile.jsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

// SweetAlert2
import Swal from 'sweetalert2';

// Icons
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaRedoAlt,
  FaSpinner,
  FaUserCheck,
  FaFileAlt,
  FaBriefcase,
  FaGraduationCap,
  FaTrophy,
  FaEye,
  FaUser,
} from 'react-icons/fa';
import { MdWork } from 'react-icons/md';

// Step Components
import CVUpload from './CompleteProfileSteps/CVUpload';
import Education from './CompleteProfileSteps/Education';
import BasicInfo from './CompleteProfileSteps/BasicInfo';
import ReviewPage from './CompleteProfileSteps/ReviewPage';
import Achievements from './CompleteProfileSteps/Achievements';
import WorkExperience from './CompleteProfileSteps/WorkExperience';
import ProfessionalInfo from './CompleteProfileSteps/ProfessionalInfo';

const CompleteProfile = ({ applicantProfile = null }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Define steps BEFORE any useCallback hooks that reference them
  const steps = [
    { name: 'Basic Info', component: BasicInfo, icon: FaUser, required: true },
    { name: 'Professional', component: ProfessionalInfo, icon: MdWork, required: false },
    { name: 'CV Upload', component: CVUpload, icon: FaFileAlt, required: false },
    { name: 'Work Experience', component: WorkExperience, icon: FaBriefcase, required: false },
    { name: 'Education', component: Education, icon: FaGraduationCap, required: false },
    { name: 'Achievements', component: Achievements, icon: FaTrophy, required: false },
    { name: 'Review', component: ReviewPage, icon: FaEye, required: false },
  ];

  // Initialize form data
  const [data, setData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    blood_type: '',
    phone: '',
    address: '',
    photo: null,
    photo_path: null,

    // Professional Info
    experience_years: '',
    current_job_title: '',
    social_links: {},

    // CVs
    cvs: [],

    // Job History
    job_histories: [],

    // Education
    education_histories: [],

    // Achievements
    achievements: [],
  });

  // Save data to localStorage whenever it changes
  const saveToLocalStorage = useCallback((dataToSave) => {
    try {
      const saveData = { ...dataToSave };
      // Don't save File objects
      if (saveData.photo instanceof File) {
        saveData.photo = null;
      }
      localStorage.setItem('profile_form_data', JSON.stringify(saveData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('profile_form_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Don't restore File objects
        const filteredData = { ...parsedData };
        delete filteredData.photo;

        // Use a timeout to avoid cascading renders
        const timer = setTimeout(() => {
          setData(prev => ({
            ...prev,
            ...filteredData,
            photo: null,
          }));
        }, 0);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Load applicant profile data when available
  useEffect(() => {
    if (applicantProfile && applicantProfile.id) {
      const nextData = {
        first_name: applicantProfile.first_name || '',
        last_name: applicantProfile.last_name || '',
        birth_date: applicantProfile.birth_date || '',
        gender: applicantProfile.gender || '',
        blood_type: applicantProfile.blood_type || '',
        phone: applicantProfile.phone || '',
        address: applicantProfile.address || '',
        photo: null,
        photo_path: applicantProfile.photo_path || null,
        experience_years: applicantProfile.experience_years || '',
        current_job_title: applicantProfile.current_job_title || '',
        social_links: applicantProfile.social_links || {},
        cvs: applicantProfile.cvs || [],
        job_histories: applicantProfile.job_histories || [],
        education_histories: applicantProfile.education_histories || [],
        achievements: applicantProfile.achievements || [],
      };

      // Use a timeout to avoid cascading renders
      const timer = setTimeout(() => {
        setData(nextData);
        saveToLocalStorage(nextData);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [applicantProfile, saveToLocalStorage]);

  // Wrapper for setData that also saves to localStorage
  const handleSetData = useCallback((key, value) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      saveToLocalStorage(newData);
      return newData;
    });
  }, [saveToLocalStorage]);

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post('/api/profile/photo/upload', formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.photo_url) {
        return response.data.photo_path;
      }
      return null;
    } catch (error) {
      console.error('Photo upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Photo Upload Failed',
        text: 'Could not upload profile photo. Please try again.',
        confirmButtonColor: '#ef4444',
      });
      return null;
    }
  };

  // ==================== STEP VALIDATION FUNCTIONS ====================

  // Validate Basic Info step (Step 0) - REQUIRED
  const validateBasicInfo = useCallback(() => {
    const errors = [];
    if (!data.first_name?.trim()) errors.push('First name is required');
    if (!data.last_name?.trim()) errors.push('Last name is required');
    if (!data.phone?.trim() || data.phone === '+880' || data.phone === '+880' + '') {
      errors.push('Phone number is required');
    }
    return errors;
  }, [data.first_name, data.last_name, data.phone]);

  // Validate Professional Info step (Step 1) - OPTIONAL
  const validateProfessionalInfo = useCallback(() => {
    return [];
  }, []);

  // Validate CV Upload step (Step 2) - OPTIONAL
  const validateCVUpload = useCallback(() => {
    return [];
  }, []);

  // Validate Work Experience step (Step 3) - OPTIONAL
  const validateWorkExperience = useCallback(() => {
    return [];
  }, []);

  // Validate Education step (Step 4) - OPTIONAL
  const validateEducation = useCallback(() => {
    return [];
  }, []);

  // Validate Achievements step (Step 5) - OPTIONAL
  const validateAchievements = useCallback(() => {
    return [];
  }, []);

  // Main validation function for a step
  const validateStep = useCallback((stepIndex) => {
    let errors = [];
    switch (stepIndex) {
      case 0:
        errors = validateBasicInfo();
        break;
      case 1:
        errors = validateProfessionalInfo();
        break;
      case 2:
        errors = validateCVUpload();
        break;
      case 3:
        errors = validateWorkExperience();
        break;
      case 4:
        errors = validateEducation();
        break;
      case 5:
        errors = validateAchievements();
        break;
      default:
        break;
    }
    return errors;
  }, [validateBasicInfo, validateProfessionalInfo, validateCVUpload, validateWorkExperience, validateEducation, validateAchievements]);

  // Check if a step is completed successfully
  const isStepCompleted = useCallback((stepIndex) => {
    const errors = validateStep(stepIndex);
    return errors.length === 0;
  }, [validateStep]);

  // ==================== NAVIGATION FUNCTIONS ====================

  const handleNext = useCallback(() => {
    // Validate current step before proceeding
    const errors = validateStep(currentStep);

    if (errors.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Complete This Step',
        html: `
          <div className="text-left">
            <p className="text-gray-700 mb-2">Please fix the following before proceeding:</p>
            <ul className="text-sm text-red-600 space-y-1">
              ${errors.map(err => `<li>• ${err}</li>`).join('')}
            </ul>
          </div>
        `,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Got it'
      });
      return;
    }

    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    // Move to next step
    if (currentStep < steps.length - 1) {
      saveToLocalStorage(data);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep, data, saveToLocalStorage, validateStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      saveToLocalStorage(data);
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep, data, saveToLocalStorage]);

  const handleEditStep = useCallback((stepIndex) => {
    const isCurrentStep = stepIndex === currentStep;
    const isCompleted = completedSteps.has(stepIndex);
    const isPreviousStep = stepIndex < currentStep;

    if (stepIndex < 0 || stepIndex >= steps.length) return;

    if (isCurrentStep || isCompleted || isPreviousStep) {
      saveToLocalStorage(data);
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Step Locked',
        text: 'Please complete the current step before moving forward.',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Got it'
      });
    }
  }, [currentStep, completedSteps, steps.length, saveToLocalStorage, data]);

  const isStepAccessible = useCallback((index) => {
    if (index === currentStep) return true;
    if (completedSteps.has(index)) return true;
    if (index < currentStep) return true;
    return false;
  }, [currentStep, completedSteps]);

  // ==================== HANDLE SUBMIT ====================
  const handleSubmit = useCallback(async () => {
    // Check if Basic Info is filled (required)
    if (!data.first_name || !data.last_name || !data.phone) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Required Info',
        text: 'Please fill in First Name, Last Name, and Phone before submitting.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    Swal.fire({
      title: 'Submit Profile?',
      html: `
        <div className="text-left">
          <p className="text-gray-700">Are you sure you want to submit your profile?</p>
          <p className="text-sm text-gray-500 mt-3 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">📄 Your CVs are already uploaded.</span>
            <span className="flex items-center gap-1 mt-1">✏️ You can still edit your profile later from your dashboard.</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ Only Basic Information is required. Other sections are optional.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, submit my profile!',
      cancelButtonText: 'No, go back',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-5 py-2 text-sm font-medium',
        cancelButton: 'px-5 py-2 text-sm font-medium'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessing(true);

        // Upload photo separately if it exists and is a new file
        let photoPath = data.photo_path;
        if (data.photo instanceof File) {
          const uploadedPath = await handlePhotoUpload(data.photo);
          if (uploadedPath) {
            photoPath = uploadedPath;
          }
        }

        // Prepare submission data
        const submitData = {
          ...data,
          photo_path: photoPath,
          cvs: data.cvs.map(cv => ({
            id: cv.id,
            is_primary: cv.is_primary,
            order_position: cv.order_position
          })),
          job_histories: data.job_histories,
          education_histories: data.education_histories,
          achievements: data.achievements,
        };

        // Remove the actual File object from submission
        delete submitData.photo;

        try {
          const response = await axios.post('/api/profile/complete', submitData, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });

          if (response.data.success) {
            localStorage.removeItem('profile_form_data');
            setProcessing(false);

            Swal.fire({
              icon: 'success',
              title: 'Profile Submitted!',
              html: `
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700">Your profile has been successfully submitted!</p>
                  <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                </div>
              `,
              timer: 3000,
              showConfirmButton: false,
              background: '#ffffff',
              customClass: {
                popup: 'rounded-2xl'
              }
            }).then(() => {
              navigate('/dashboard');
            });
          }
        } catch (error) {
          setProcessing(false);
          const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: errorMessage,
            confirmButtonColor: '#ef4444',
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        }
      }
    });
  }, [data, navigate]);

  const CurrentStepComponent = steps[currentStep].component;

  const isReviewPage = currentStep === steps.length - 1;
  const progressPercentage = ((currentStep + 1) / (steps.length - 1)) * 100;

  // Mark step as completed when it's valid (on each render)
  useEffect(() => {
    if (!isReviewPage && isStepCompleted(currentStep)) {
      // Use a timeout to avoid cascading renders
      const timer = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [data, currentStep, isReviewPage, isStepCompleted]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 text-black">
      <Helmet>
        <title>Complete Your Profile</title>
        <meta name="description" content="Complete your Job Match profile to start applying for jobs" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center flex mx-auto items-center justify-center gap-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            {isReviewPage ? (
              <FaEye className="h-8 w-8 text-blue-600" />
            ) : (
              <FaUserCheck className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isReviewPage ? 'Review Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isReviewPage
                ? 'Please review all information before submitting'
                : `Step ${currentStep + 1} of ${steps.length - 1}: ${steps[currentStep].name}`}
            </p>
          </div>
        </div>

        {/* Progress Bar - Hide on Review Page */}
        {!isReviewPage && (
          <div className="mb-8 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between mb-3">
              {steps.slice(0, -1).map((step, index) => {
                const isCompleted = completedSteps.has(index);
                const isActive = index === currentStep;
                const isAccessible = isStepAccessible(index);
                const isRequired = step.required;

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center text-center transition-all duration-200 ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                    style={{ width: `${100 / (steps.length - 1)}%` }}
                    onClick={() => isAccessible && handleEditStep(index)}
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                        ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                        ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-500' : ''}
                        ${isAccessible && !isActive && !isCompleted ? 'hover:bg-gray-300' : ''}
                      `}
                    >
                      {isCompleted ? <FaCheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                      {step.name}
                    </span>
                    <span className="text-[8px] mt-0.5">
                      {isRequired ? (
                        <span className="text-red-500">Required</span>
                      ) : (
                        <span className="text-gray-400">Optional</span>
                      )}
                    </span>
                    {!isAccessible && (
                      <span className="text-[8px] text-gray-400 mt-0.5">🔒</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span className="text-red-500">* Required</span>
              <span>Optional</span>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {isReviewPage ? (
            <ReviewPage data={data} onEditStep={handleEditStep} />
          ) : (
            <CurrentStepComponent
              data={data}
              setData={handleSetData}
              errors={{}}
            />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {!isReviewPage ? (
              <div className="flex justify-between gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`
                    px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                    ${currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  className="ml-auto px-6 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  Next
                  <FaArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    Swal.fire({
                      title: 'Clear All Data?',
                      text: 'This will clear all locally saved profile data. This action cannot be undone.',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Yes, clear it!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        localStorage.removeItem('profile_form_data');
                        window.location.reload();
                      }
                    });
                  }}
                  className="flex-1 px-6 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaRedoAlt className="h-4 w-4" />
                  Clear All Data
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="flex-1 px-6 py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="h-4 w-4" />
                      Submit Profile
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional Note */}
        {!isReviewPage && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-blue-500">💾</span>
              Your progress is automatically saved locally. You can close the browser and continue later.
              <span className="text-blue-500">💾</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteProfile;