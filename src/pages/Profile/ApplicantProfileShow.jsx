// src/pages/Profile/ApplicantProfileShow.jsx

// React
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, Link } from 'react-router-dom';

// Layout
import JobSeekerLayout from '../../Layout/JobSeekerLayout';

// Axios
import axios from 'axios';

// Icons
import {
  FaUser,
  FaPhone,
  FaEdit,
  FaTrash,
  FaTrashRestore,
  FaFilePdf,
  FaUserCircle,
  FaPlusCircle,
  FaSpinner,
  FaBirthdayCake,
  FaIdCard,
  FaExclamationTriangle,
  FaFileAlt,
  FaBriefcase,
  FaTrophy,
  FaMapMarkerAlt,
  FaVenusMars,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaCalendarAlt,
  FaStar,
  FaFacebook,
  FaYoutube,
  FaMedium,
  FaDev,
  FaStackOverflow,
  FaChartLine,
  FaUserTie,
  FaLink,
  FaBuilding,
  FaInfoCircle,
  FaArrowLeft,
  FaShieldAlt,
} from 'react-icons/fa';
import {
  MdOutlineBloodtype,
  MdSchool,
  MdPending,
  MdEmail
} from 'react-icons/md';

// SweetAlert2
import Swal from 'sweetalert2';

// Modals
import CVModal from './Modals/CVModal';
import EducationModal from './Modals/EducationModal';
import BasicInfoModal from './Modals/BasicInfoModal';
import AchievementsModal from './Modals/AchievementsModal';
import WorkExperienceModal from './Modals/WorkExperienceModal';
import ChangePasswordModal from './Modals/ChangePasswordModal';
import ProfessionalInfoModal from './Modals/ProfessionalInfoModal';

export default function ApplicantProfileShow() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user;
  const token = localStorage.getItem('token');

  // States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Check permissions
  const isAdmin = user?.roles?.some(r => r.slug === 'admin');
  const isSuperAdmin = user?.roles?.some(r => r.slug === 'super-admin');
  const isOwner = user?.id === profile?.user_id;
  const canViewAllProfiles = user?.permissions?.includes('applicant-profiles.view') || user?.permissions?.includes('applicant-profiles.manage');
  const canEditAnyProfile = user?.permissions?.includes('applicant-profiles.update') || user?.permissions?.includes('applicant-profiles.manage');
  const canDeleteAnyProfile = user?.permissions?.includes('applicant-profiles.destroy') || user?.permissions?.includes('applicant-profiles.manage');

  const hasAdminRole = isSuperAdmin || isAdmin || canViewAllProfiles || canEditAnyProfile;
  const isDeleted = profile?.deleted_at !== null;
  const isOauthUser = !!user?.google_id;

  // Fetch profile data
  const fetchProfile = useMemo(() => async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/applicant-profiles/${id}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      setTimeout(() => {
        setProfile(response.data);
        setLoading(false);
      }, 0);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to load profile',
          text: error.response?.data?.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
        setLoading(false);
        navigate('/profile');
      }, 0);
    }
  }, [id, token, navigate]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, id, fetchProfile]);

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <JobSeekerLayout>
        <Helmet>
          <title>Access Denied</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Login Required</h2>
            <p className="text-gray-500 mt-2">Please login to view this profile.</p>
            <Link
              to={`/login?redirect=/profile/${id}`}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login Now
            </Link>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // If user doesn't have permission
  if (!isOwner && !hasAdminRole) {
    return (
      <JobSeekerLayout>
        <Helmet>
          <title>Access Denied</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this profile.</p>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <JobSeekerLayout>
        <Helmet>
          <title>Loading Profile...</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading profile...</p>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // If no profile
  if (!profile) {
    return (
      <JobSeekerLayout>
        <Helmet>
          <title>My Profile</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserCircle className="text-gray-400 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">You haven't created a profile yet. Create one to apply for jobs.</p>
            <Link
              to="/profile/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlusCircle size={18} />
              Create Profile
            </Link>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const openModal = (modalType) => {
    if (!isOwner) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'You can only edit your own profile.',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (isDeleted) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Edit',
        text: 'Please restore your profile before editing.',
      });
      return;
    }
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    fetchProfile();
  };

  // Delete handler
  const handleDelete = () => {
    if (!isOwner && !canDeleteAnyProfile) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'You do not have permission to delete this profile.',
      });
      return;
    }

    Swal.fire({
      title: 'Delete Profile?',
      text: isOwner ? 'Your profile will be soft deleted. You can restore it later.' : 'This profile will be soft deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleting(true);
        try {
          await axios.delete(`/api/applicant-profiles/${profile.id}`, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: isOwner ? 'Your profile has been deleted.' : 'Profile has been deleted.',
              timer: 2000,
              showConfirmButton: false
            });
            setDeleting(false);

            if (!isOwner && hasAdminRole) {
              navigate('/profiles');
            } else {
              fetchProfile();
            }
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.response?.data?.message || 'Failed to delete profile.',
            });
            setDeleting(false);
          }, 0);
        }
      }
    });
  };

  // Restore handler
  const handleRestore = () => {
    if (!isOwner && !canDeleteAnyProfile) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'You do not have permission to restore this profile.',
      });
      return;
    }

    Swal.fire({
      title: 'Restore Profile?',
      text: 'The profile will be restored with all its data.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setRestoring(true);
        try {
          await axios.post(`/api/applicant-profiles/${profile.user_id}/restore`, {}, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Restored!',
              text: 'Profile has been restored successfully.',
              timer: 1500,
              showConfirmButton: false
            });
            setRestoring(false);

            if (!isOwner && hasAdminRole) {
              navigate('/profiles');
            } else {
              fetchProfile();
            }
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.response?.data?.message || 'Failed to restore profile.',
            });
            setRestoring(false);
          }, 0);
        }
      }
    });
  };

  const age = calculateAge(profile?.birth_date);
  const stats = profile?.stats || {};
  const canEditProfile = isOwner || canEditAnyProfile;
  const hasAdminAccess = !isOwner && (canDeleteAnyProfile || hasAdminRole);

  return (
    <JobSeekerLayout>
      <Helmet>
        <title>{`${profile.first_name} ${profile.last_name} - Profile`}</title>
        <meta name="description" content={`Profile of ${profile.first_name} ${profile.last_name}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            {!isOwner && hasAdminRole && (
              <div className="mb-4">
                <button
                  onClick={() => navigate('/profiles')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                >
                  <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" size={16} />
                  Back to Profiles
                </button>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isOwner ? 'My Profile' : `${profile.first_name}'s Profile`}
                </h1>
                {!isOwner && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <FaInfoCircle size={12} />
                    Viewing profile as {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'administrator'}
                  </p>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                {!isDeleted && !isOauthUser && isOwner && (
                  <button
                    onClick={() => openModal('change-password')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <FaUser size={16} />
                    Change Password
                  </button>
                )}

                {isDeleted ? (
                  <button
                    onClick={handleRestore}
                    disabled={restoring}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {restoring ? <FaSpinner className="animate-spin" size={16} /> : <FaTrashRestore size={16} />}
                    Restore Profile
                  </button>
                ) : (
                  <>
                    {isOwner && (
                      <Link
                        to="/applications"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        <FaFileAlt size={16} />
                        My Applications ({stats.total_applications || 0})
                      </Link>
                    )}

                    {(isOwner || hasAdminAccess) && (
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? <FaSpinner className="animate-spin" size={16} /> : <FaTrash size={16} />}
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* View-Only Banner */}
          {!isOwner && !isDeleted && (
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-center">
                <FaInfoCircle className="h-5 w-5 text-blue-400 mr-3" />
                <p className="text-sm text-blue-700">
                  You are viewing <span className="font-semibold">{profile.first_name}'s</span> profile. Edit buttons are disabled as this is not your profile.
                </p>
              </div>
            </div>
          )}

          {/* Deleted Banner */}
          {isDeleted && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                <p className="text-sm text-yellow-700">
                  This profile has been deleted. {isOwner ? 'You can restore it to continue using your profile.' : 'Only administrators can restore it.'}
                </p>
              </div>
            </div>
          )}

          {/* Main Profile Card */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isDeleted ? 'opacity-75' : ''}`}>
            {/* Banner */}
            <div className={`h-32 ${isDeleted ? 'bg-gray-400' : 'bg-linear-to-r from-blue-600 to-blue-700'}`} />

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Profile Photo */}
              <div className="flex justify-center -mt-16 mb-4">
                {profile.photo_url && !isDeleted && !imgError ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    onError={() => setImgError(true)}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                    <FaUser className="text-gray-400 text-5xl" />
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                {profile.current_job_title && (
                  <p className="text-gray-600 text-sm mt-1">{profile.current_job_title}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">Job Seeker</p>
                {isDeleted && (
                  <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    Deleted
                  </span>
                )}
                {!isOwner && !isDeleted && (
                  <span className="inline-block mt-2 ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    View Only
                  </span>
                )}
              </div>

              {/* Basic Information */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Basic Information
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('basic')}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MdEmail className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{profile.phone || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaBirthdayCake className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Birth Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.birth_date ? `${formatDate(profile.birth_date)}${age ? ` (${age} years)` : ''}` : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaVenusMars className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="text-sm font-medium text-gray-900">{profile.gender || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MdOutlineBloodtype className="text-red-500" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Blood Type</p>
                      <p className="text-sm font-medium text-gray-900">{profile.blood_type || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-blue-600" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">{profile.address || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaBriefcase className="text-purple-600" />
                    Professional Information
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('professional')}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                  )}
                </div>

                {(!profile.experience_years && profile.experience_years !== 0) && !profile.current_job_title && (!profile.social_links || Object.keys(profile.social_links).length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaBriefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No professional information added yet</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaChartLine className="text-purple-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Years of Experience</p>
                          <p className="text-sm font-medium text-gray-900">
                            {profile.experience_years !== null && profile.experience_years !== undefined
                              ? (profile.experience_years === 0 ? 'Fresher' : `${profile.experience_years} year${profile.experience_years > 1 ? 's' : ''}`)
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaUserTie className="text-purple-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Current Job Title</p>
                          <p className="text-sm font-medium text-gray-900">{profile.current_job_title || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaLink className="h-4 w-4 text-gray-400" />
                          Social Links
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(profile.social_links).map(([platform, url]) => {
                            const platformConfig = {
                              linkedin: { icon: FaLinkedin, color: "text-blue-600", bg: "bg-blue-50", name: "LinkedIn" },
                              github: { icon: FaGithub, color: "text-gray-800", bg: "bg-gray-100", name: "GitHub" },
                              twitter: { icon: FaTwitter, color: "text-sky-500", bg: "bg-sky-50", name: "Twitter" },
                              facebook: { icon: FaFacebook, color: "text-blue-700", bg: "bg-blue-50", name: "Facebook" },
                              youtube: { icon: FaYoutube, color: "text-red-600", bg: "bg-red-50", name: "YouTube" },
                              medium: { icon: FaMedium, color: "text-gray-700", bg: "bg-gray-100", name: "Medium" },
                              devto: { icon: FaDev, color: "text-gray-800", bg: "bg-gray-100", name: "Dev.to" },
                              stackoverflow: { icon: FaStackOverflow, color: "text-orange-600", bg: "bg-orange-50", name: "Stack Overflow" },
                              portfolio: { icon: FaGlobe, color: "text-green-600", bg: "bg-green-50", name: "Portfolio" }
                            };
                            const config = platformConfig[platform] || { icon: FaGlobe, color: "text-gray-600", bg: "bg-gray-50", name: platform };
                            const Icon = config.icon;

                            return (
                              <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 ${config.bg} rounded-lg hover:shadow-md transition-all group`}
                              >
                                <Icon className={`${config.color} transition-transform group-hover:scale-110`} size={16} />
                                <span className="text-sm text-gray-700 capitalize font-medium">{config.name}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Work Experience */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaBriefcase className="text-orange-600" />
                    Work Experience ({profile.job_histories?.length || 0})
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('work')}
                      className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                  )}
                </div>
                {profile.job_histories && profile.job_histories.length > 0 ? (
                  <div className="space-y-4">
                    {profile.job_histories.map((job, index) => (
                      <div key={job.id || index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{job.position}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <FaBuilding className="h-3 w-3 text-gray-400" />
                              {job.company_name}
                            </p>
                          </div>
                          {job.is_current && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <FaStar size={12} /> Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                          <FaCalendarAlt size={12} />
                          {job.starting_year} - {job.is_current ? 'Present' : (job.ending_year || 'Present')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaBriefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No work experience added yet</p>
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MdSchool className="text-green-600" />
                    Education ({profile.education_histories?.length || 0})
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('education')}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                  )}
                </div>
                {profile.education_histories && profile.education_histories.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education_histories.map((edu, index) => (
                      <div key={edu.id || index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-600 mt-1">{edu.institution_name}</p>
                        <p className="text-xs text-gray-500 mt-2">Passing Year: {edu.passing_year}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MdSchool className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No education added yet</p>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaTrophy className="text-yellow-600" />
                    Achievements & Certifications ({profile.achievements?.length || 0})
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('achievements')}
                      className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                  )}
                </div>
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div key={achievement.id || index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FaTrophy className="text-yellow-600" size={16} />
                          {achievement.achievement_name}
                        </h4>
                        {achievement.achievement_details && (
                          <p className="text-sm text-gray-600 mt-2 ml-6">{achievement.achievement_details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaTrophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No achievements added yet</p>
                  </div>
                )}
              </div>

              {/* CV Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaFileAlt className="text-red-600" />
                    CV / Resume ({profile.cvs?.length || 0})
                  </h3>
                  {!isDeleted && canEditProfile && (
                    <button
                      onClick={() => openModal('cv')}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      <FaEdit size={14} /> Manage CVs
                    </button>
                  )}
                </div>
                {profile.cvs && profile.cvs.length > 0 ? (
                  <div className="space-y-3">
                    {profile.cvs.map((cv) => (
                      <div key={cv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-red-500" size={24} />
                          <div>
                            <p className="font-medium text-gray-900">{cv.original_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                              <span>Uploaded: {new Date(cv.created_at).toLocaleDateString()}</span>
                              {cv.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 text-orange-600">
                                  <MdPending size={12} /> Pending
                                </span>
                              )}
                              {cv.is_primary && (
                                <span className="inline-flex items-center gap-1 text-yellow-600">
                                  <FaStar size={12} /> Primary
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <a
                          href={cv.cv_url || `/storage/${cv.cv_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"
                        >
                          View CV
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaFilePdf className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No CV uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-blue-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {canEditProfile && (
        <>
          <BasicInfoModal
            isOpen={activeModal === 'basic'}
            onClose={closeModal}
            profile={profile}
          />
          <ProfessionalInfoModal
            isOpen={activeModal === 'professional'}
            onClose={closeModal}
            profile={profile}
          />
          <WorkExperienceModal
            isOpen={activeModal === 'work'}
            onClose={closeModal}
            profile={profile}
          />
          <EducationModal
            isOpen={activeModal === 'education'}
            onClose={closeModal}
            profile={profile}
          />
          <AchievementsModal
            isOpen={activeModal === 'achievements'}
            onClose={closeModal}
            profile={profile}
          />
          <CVModal
            isOpen={activeModal === 'cv'}
            onClose={closeModal}
            profile={profile}
          />
          <ChangePasswordModal
            isOpen={activeModal === 'change-password'}
            onClose={closeModal}
            profile={profile}
          />
        </>
      )}
    </JobSeekerLayout>
  );
}