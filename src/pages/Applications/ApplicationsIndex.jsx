// src/pages/Applications/ApplicationsIndex.jsx

// React
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';

// Layout
import JobSeekerLayout from '../../Layout/JobSeekerLayout';

// Axios
import axios from 'axios';

// Icons
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaBuilding,
  FaDollarSign,
  FaFilePdf,
  FaCheck,
  FaHourglassHalf,
  FaUserCheck,
  FaUserSlash,
  FaTrashRestore,
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
  FaFilter,
  FaShieldAlt,
} from 'react-icons/fa';

// SweetAlert2
import Swal from 'sweetalert2';

export default function ApplicationsIndex() {

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user;
  const token = localStorage.getItem('token');

  // States - moved to top before any conditional returns
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState({ data: [] });
  const [stats, setStats] = useState({
    total: 0,
    total_deleted: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    average_ats_score: 0,
  });
  const [restoringId, setRestoringId] = useState(null);
  const [showTrashed, setShowTrashed] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);

  // Check user role - moved before hooks
  const isJobSeeker = user?.roles?.some(r => r.slug === 'job-seeker');
  const isAdmin = user?.permissions?.includes('applications.manage');

  // Fetch data - useCallback must be called at top level
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/applications`, {
        params: {
          show_trashed: showTrashed ? 'true' : 'false',
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      setTimeout(() => {
        setApplications(response.data.applications || { data: [] });
        setStats(response.data.stats || {
          total: 0,
          total_deleted: 0,
          pending: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0,
          average_ats_score: 0,
        });
        setLoading(false);
      }, 0);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to load',
          text: error.response?.data?.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
        setLoading(false);
      }, 0);
    }
  }, [token, showTrashed]);

  // Fetch with page - useCallback must be called at top level
  const fetchDataWithPage = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/applications`, {
        params: {
          show_trashed: showTrashed ? 'true' : 'false',
          page: page,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      setTimeout(() => {
        setApplications(response.data.applications || { data: [] });
        setStats(response.data.stats || {
          total: 0,
          total_deleted: 0,
          pending: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0,
          average_ats_score: 0,
        });
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to load',
          text: error.response?.data?.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
        setLoading(false);
      }, 0);
    }
  }, [token, showTrashed]);

  // Initial fetch - useEffect must be called at top level
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // All helper functions and handlers
  const toggleShowTrashed = () => {
    const newValue = !showTrashed;
    setShowTrashed(newValue);
    setTimeout(() => fetchData(), 0);
  };

  const handlePageChange = (page) => {
    if (page === pagination?.currentPage || page < 1 || page > pagination?.lastPage) return;
    fetchDataWithPage(page);
  };

  const handleWithdraw = (id) => {
    Swal.fire({
      title: 'Withdraw Application?',
      text: 'This will move your application to trash. You can restore it later.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, withdraw',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setWithdrawingId(id);
        try {
          await axios.delete(`/api/applications/${id}`, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'Withdrawn!', timer: 1500, showConfirmButton: false });
            fetchData();
            setWithdrawingId(null);
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: error.response?.data?.message || 'Unable to withdraw.',
              confirmButtonColor: '#ef4444',
            });
            setWithdrawingId(null);
          }, 0);
        }
      }
    });
  };

  const handleRestore = (id) => {
    Swal.fire({
      title: 'Restore Application?',
      text: 'This will restore your application from trash.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, restore',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setRestoringId(id);
        try {
          await axios.post(`/api/applications/${id}/restore`, {}, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'Restored!', timer: 1500, showConfirmButton: false });
            fetchData();
            setRestoringId(null);
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: error.response?.data?.message || 'Unable to restore.',
              confirmButtonColor: '#d33',
            });
            setRestoringId(null);
          }, 0);
        }
      }
    });
  };

  const handleForceDelete = (id, jobTitle) => {
    Swal.fire({
      title: 'Permanently Delete?',
      html: `Are you sure you want to permanently delete application for <strong>${jobTitle}</strong>?<br><br>This action cannot be undone.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete permanently',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/applications/${id}/force`, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
            fetchData();
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: error.response?.data?.message || 'Unable to delete.',
              confirmButtonColor: '#d33',
            });
          }, 0);
        }
      }
    });
  };

  const handleRecalculateAts = (id) => {
    Swal.fire({
      title: 'Recalculate ATS Score?',
      text: 'This will re-analyze your CV against the job requirements.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, recalculate',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setRecalculatingId(id);
        try {
          await axios.post(`/api/applications/${id}/recalculate-ats`, {}, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'Recalculated!', timer: 1500, showConfirmButton: false });
            fetchData();
            setRecalculatingId(null);
          }, 0);
        } catch (error) {
          setTimeout(() => {
            Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: error.response?.data?.message || 'Unable to recalculate.',
              confirmButtonColor: '#d33',
            });
            setRecalculatingId(null);
          }, 0);
        }
      }
    });
  };

  // Get pagination
  const pagination = applications?.data ? {
    currentPage: applications.current_page || 1,
    lastPage: applications.last_page || 1,
    total: applications.total || 0,
    from: applications.from || 0,
    to: applications.to || 0,
  } : null;

  // Format functions
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-100 text-amber-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-rose-100 text-rose-800',
      hired: 'bg-emerald-100 text-emerald-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = { pending: 'Pending', shortlisted: 'Shortlisted', rejected: 'Rejected', hired: 'Hired' };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaRegClock className="text-amber-500" size={14} />,
      shortlisted: <FaUserCheck className="text-blue-500" size={14} />,
      rejected: <FaUserSlash className="text-rose-500" size={14} />,
      hired: <FaCheck className="text-emerald-500" size={14} />
    };
    return icons[status] || <FaBriefcase className="text-gray-500" size={14} />;
  };

  const getAtsScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getAtsScoreBg = (score) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-amber-100';
    return 'bg-rose-100';
  };

  const formatSalary = (salary) => {
    if (!salary) return null;
    return new Intl.NumberFormat('en-US').format(salary) + ' BDT';
  };

  // Stats cards
  const statsCards = [
    { title: 'Total', value: stats.total, icon: <FaBriefcase size={18} />, color: 'blue', key: 'total' },
    { title: 'Pending', value: stats.pending, icon: <FaHourglassHalf size={18} />, color: 'amber', key: 'pending' },
    { title: 'Shortlisted', value: stats.shortlisted, icon: <FaUserCheck size={18} />, color: 'indigo', key: 'shortlisted' },
    { title: 'Rejected', value: stats.rejected, icon: <FaUserSlash size={18} />, color: 'rose', key: 'rejected' },
    { title: 'Hired', value: stats.hired, icon: <FaCheck size={18} />, color: 'emerald', key: 'hired' },
    { title: 'Withdrawn', value: stats.total_deleted, icon: <FaTrash size={18} />, color: 'gray', key: 'withdrawn' },
    { title: 'Avg. ATS', value: stats.average_ats_score ? `${Math.round(stats.average_ats_score)}%` : 'N/A', icon: <FaChartLine size={18} />, color: 'purple', key: 'ats' },
  ];

  // Pagination Component
  const Pagination = () => {
    if (!pagination || pagination.lastPage <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{pagination.from || 0}</span> to{' '}
          <span className="font-medium text-gray-700">{pagination.to || 0}</span> of{' '}
          <span className="font-medium text-gray-700">{pagination.total}</span> applications
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition ${pagination.currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
          >
            <FaChevronLeft size={12} /> Prev
          </button>
          {startPage > 1 && (
            <>
              <button onClick={() => handlePageChange(1)} className="px-3 py-1.5 rounded-lg text-sm bg-white text-gray-600 hover:bg-gray-100 border border-gray-300">1</button>
              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${page === pagination.currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
            >
              {page}
            </button>
          ))}
          {endPage < pagination.lastPage && (
            <>
              {endPage < pagination.lastPage - 1 && <span className="px-2 text-gray-400">...</span>}
              <button onClick={() => handlePageChange(pagination.lastPage)} className="px-3 py-1.5 rounded-lg text-sm bg-white text-gray-600 hover:bg-gray-100 border border-gray-300">
                {pagination.lastPage}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.lastPage}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition ${pagination.currentPage === pagination.lastPage
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
          >
            Next <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    );
  };

  // Application items
  const applicationItems = applications?.data || [];
  const applicationsCount = applicationItems.length;

  // ==================== EARLY RETURNS (after all hooks) ====================

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
            <p className="text-gray-500 mt-2">Please login to view your applications.</p>
            <Link
              to="/login"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login Now
            </Link>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // If user is employer (not job seeker)
  if (!isJobSeeker && !isAdmin) {
    return (
      <JobSeekerLayout>
        <Helmet>
          <title>Access Denied</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBriefcase className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Employer Account</h2>
            <p className="text-gray-500 mt-2">
              Employer accounts cannot submit job applications. Please create a job seeker account to apply for jobs.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
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
          <title>Loading Applications...</title>
        </Helmet>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading applications...</p>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <JobSeekerLayout>
      <Helmet>
        <title>{showTrashed ? "Withdrawn Applications" : "My Applications"}</title>
        <meta name="description" content="View and manage your job applications" />
      </Helmet>

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50 p-4 md:p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {showTrashed ? 'Withdrawn Applications' : 'My Applications'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {showTrashed ? 'View and manage your withdrawn applications' : 'Track and manage all your active job applications'}
              </p>
              {isAdmin && !showTrashed && (
                <p className="text-xs text-blue-600 mt-1">
                  👑 Admin view - Showing all applications
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleShowTrashed}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium ${showTrashed
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
              >
                <FaFilter size={12} />
                {showTrashed ? 'Show Active' : 'Show Withdrawn'}
              </button>
              {!showTrashed && (
                <Link
                  to="/jobs"
                  className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-medium"
                >
                  <FaPlus size={12} />
                  Browse Jobs
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {statsCards.map((card) => {
              const colorMap = {
                blue: 'from-blue-50 to-blue-100 text-blue-700',
                amber: 'from-amber-50 to-amber-100 text-amber-700',
                indigo: 'from-indigo-50 to-indigo-100 text-indigo-700',
                rose: 'from-rose-50 to-rose-100 text-rose-700',
                emerald: 'from-emerald-50 to-emerald-100 text-emerald-700',
                gray: 'from-gray-50 to-gray-100 text-gray-700',
                purple: 'from-purple-50 to-purple-100 text-purple-700',
              };
              return (
                <div
                  key={card.key}
                  className={`bg-linear-to-br ${colorMap[card.color]} rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
                  onClick={() => {
                    if (card.key === 'withdrawn') {
                      if (!showTrashed) toggleShowTrashed();
                    } else if (card.key !== 'ats' && showTrashed) {
                      if (showTrashed) toggleShowTrashed();
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="opacity-80">{card.icon}</div>
                    <span className="text-xl font-bold">{card.value}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 opacity-75">{card.title}</p>
                </div>
              );
            })}
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {applicationsCount === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBriefcase className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {showTrashed ? 'No withdrawn applications' : 'No applications yet'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {showTrashed ? 'Withdrawn applications will appear here.' : 'Start applying for jobs to see them here.'}
                </p>
                {!showTrashed && (
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition mt-4"
                  >
                    <FaPlus size={12} /> Browse Jobs
                  </Link>
                )}
              </div>
            )}

            {applicationItems.map((app) => {
              const trashed = !!app.deleted_at;
              const isPending = !trashed && app.status === 'pending';
              const isProcessing = app.ats_calculation_status === 'processing';
              const isOwnApplication = user?.id === app.user_id;

              return (
                <div
                  key={app.id}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border ${trashed ? 'border-gray-200 opacity-75' : 'border-gray-100'
                    }`}
                >
                  <div className="p-4">
                    {/* Job Title */}
                    <Link
                      to={`/applications/${app.id}`}
                      className={`font-semibold text-base hover:text-blue-600 transition line-clamp-1 ${trashed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                    >
                      {app.job_title}
                    </Link>

                    {/* Employer */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <FaBuilding size={10} />
                      {app.employer_name}
                    </div>

                    {/* Admin indicator for other user's applications */}
                    {isAdmin && !isOwnApplication && !trashed && (
                      <div className="mt-1">
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          Applicant: {app.name}
                        </span>
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* ATS Score */}
                      {!trashed && (
                        app.ats_score ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getAtsScoreBg(app.ats_score)} ${getAtsScoreColor(app.ats_score)}`}>
                            <FaChartLine size={10} />
                            {app.ats_score}%
                          </div>
                        ) : isProcessing ? (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <FaSpinner className="animate-spin" size={10} /> Calculating...
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">ATS pending</span>
                        )
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <FaCalendarAlt size={10} />
                        {formatDate(app.created_at)}
                      </div>
                    </div>

                    {/* Status & Salary */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        {!trashed ? (
                          <>
                            {getStatusIcon(app.status)}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadge(app.status)}`}>
                              {getStatusText(app.status)}
                            </span>
                          </>
                        ) : (
                          <>
                            <FaTrash size={12} className="text-gray-400" />
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Withdrawn</span>
                          </>
                        )}
                      </div>
                      {app.expected_salary && !trashed && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <FaDollarSign size={10} />
                          {formatSalary(app.expected_salary)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex gap-1">
                        <Link
                          to={`/applications/${app.id}`}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </Link>
                        {isPending && (
                          <Link
                            to={`/applications/${app.id}/edit`}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </Link>
                        )}
                        {isPending && (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            disabled={withdrawingId === app.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                            title="Withdraw"
                          >
                            {withdrawingId === app.id ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
                          </button>
                        )}
                        {trashed && (
                          <>
                            <button
                              onClick={() => handleRestore(app.id)}
                              disabled={restoringId === app.id}
                              className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="Restore"
                            >
                              {restoringId === app.id ? <FaSpinner className="animate-spin" size={14} /> : <FaTrashRestore size={14} />}
                            </button>
                            <button
                              onClick={() => handleForceDelete(app.id, app.job_title)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                              title="Permanent Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {app.resume_url && (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                            title="View Resume"
                          >
                            <FaFilePdf size={14} />
                          </a>
                        )}
                        {!trashed && !isProcessing && (
                          <button
                            onClick={() => handleRecalculateAts(app.id)}
                            disabled={recalculatingId === app.id}
                            className="p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
                            title="Recalculate ATS"
                          >
                            {recalculatingId === app.id ? <FaSpinner className="animate-spin" size={14} /> : <FaChartLine size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="mt-6">
              <Pagination />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </JobSeekerLayout>
  );
}