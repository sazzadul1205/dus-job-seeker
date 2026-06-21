// src/pages/Jobs/PublicJobListings.jsx

// React
import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Layout
import JobSeekerLayout from '../../Layout/JobSeekerLayout';

// Axios
import axios from 'axios';

// Icons
import {
  FaSearch,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye,
  FaUsers,
  FaDollarSign,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaChartLine,
  FaUserCheck,
  FaRegBookmark,
  FaBookmark,
  FaShareAlt,
} from 'react-icons/fa';

// SweetAlert
import Swal from 'sweetalert2';

export default function PublicJobListings() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!user;
  const token = localStorage.getItem('token');

  // Get query params
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || '';
  const initialLocation = queryParams.get('location') || '';
  const initialJobType = queryParams.get('job_type') || '';
  const initialSalaryMin = queryParams.get('salary_min') || '';
  const initialSalaryMax = queryParams.get('salary_max') || '';
  const initialSort = queryParams.get('sort') || 'latest';
  const initialExperienceLevel = queryParams.get('experience_level') || '';

  // Get page
  const initialPage = parseInt(queryParams.get('page')) || 1;

  // States
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [jobListings, setJobListings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 1000000 });
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_views: 0,
    total_applications: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    location: initialLocation,
    job_type: initialJobType,
    experience_level: initialExperienceLevel,
    salary_min: initialSalaryMin,
    salary_max: initialSalaryMax,
    sort: initialSort,
  });

  // Fetch all data
  const fetchData = useCallback(async (page = initialPage) => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.job_type) params.append('job_type', filters.job_type);
      if (filters.experience_level) params.append('experience_level', filters.experience_level);
      if (filters.salary_min) params.append('salary_min', filters.salary_min);
      if (filters.salary_max) params.append('salary_max', filters.salary_max);
      if (filters.sort) params.append('sort', filters.sort);
      if (page > 1) params.append('page', page);

      const response = await axios.get(`/api/jobs?${params.toString()}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      const data = response.data;

      // Use setTimeout to avoid cascading renders
      setTimeout(() => {
        setJobListings(data.jobListings);
        setCategories(data.categories || []);
        setLocations(data.locations || []);
        setJobTypes(data.jobTypes || []);
        setExperienceLevels(data.experienceLevels || []);
        setSalaryRange(data.salaryRange || { min: 0, max: 1000000 });
        setStats(data.stats || { total_jobs: 0, total_views: 0, total_applications: 0 });
      }, 0);

      // Update URL
      const searchParams = new URLSearchParams();
      if (filters.search) searchParams.append('search', filters.search);
      if (filters.category) searchParams.append('category', filters.category);
      if (filters.location) searchParams.append('location', filters.location);
      if (filters.job_type) searchParams.append('job_type', filters.job_type);
      if (filters.experience_level) searchParams.append('experience_level', filters.experience_level);
      if (filters.salary_min) searchParams.append('salary_min', filters.salary_min);
      if (filters.salary_max) searchParams.append('salary_max', filters.salary_max);
      if (filters.sort) searchParams.append('sort', filters.sort);
      if (page > 1) searchParams.append('page', page);

      navigate({
        pathname: location.pathname,
        search: searchParams.toString(),
      }, { replace: true });

    } catch (error) {
      console.error('Error fetching jobs:', error);
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to load jobs',
          text: error.response?.data?.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
      }, 0);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [filters, token, location.pathname, navigate, initialPage]);

  // Initial fetch - using setTimeout to avoid cascading renders
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setTimeout(() => {
        fetchData(initialPage);
      }, 0);
    }
  }, [fetchData, initialPage]);

  // Apply filters
  const applyFilters = useCallback(() => {
    setTimeout(() => {
      fetchData(1);
    }, 0);
    setShowMobileFilters(false);
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== initialSearch) {
        setTimeout(() => {
          fetchData(1);
        }, 0);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters.search, initialSearch, fetchData]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      job_type: '',
      experience_level: '',
      salary_min: '',
      salary_max: '',
      sort: 'latest',
    });
    setTimeout(() => fetchData(1), 0);
  };

  // Handle sort change
  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue }));
    setShowSortMenu(false);
    setTimeout(() => fetchData(1), 0);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page === jobListings?.current_page) return;
    if (page < 1 || page > jobListings?.last_page) return;
    setTimeout(() => {
      fetchData(page);
    }, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save/Unsave job
  const handleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to save jobs to your profile.',
        confirmButtonColor: '#2563eb',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    setSavingJobId(jobId);

    try {
      const isSaved = savedJobs.includes(jobId);

      // Optimistic update
      if (isSaved) {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        setSavedJobs(prev => [...prev, jobId]);
      }

      // Make API call
      await axios.post(`/api/jobs/${jobId}/save`, {}, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: isSaved ? 'Removed' : 'Saved!',
          text: isSaved ? 'Job removed from saved list.' : 'Job saved to your profile.',
          timer: 1500,
          showConfirmButton: false,
        });
      }, 0);
    } catch (error) {
      // Revert optimistic update on error
      const isSaved = savedJobs.includes(jobId);
      if (isSaved) {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        setSavedJobs(prev => [...prev, jobId]);
      }

      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to save job.',
        });
      }, 0);
    } finally {
      setSavingJobId(null);
    }
  };

  // Share job
  const handleShareJob = (job) => {
    const url = window.location.origin + `/jobs/${job.slug}`;

    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title}`,
        url: url,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(url);
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Link Copied!',
          text: 'Job link copied to clipboard.',
          timer: 1500,
          showConfirmButton: false,
        });
      }, 0);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return filters.category || filters.location || filters.job_type ||
      filters.experience_level || filters.salary_min || filters.salary_max;
  };

  // Clear single filter
  const clearFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setTimeout(() => fetchData(1), 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    return `${daysLeft} days left`;
  };

  // Get deadline color
  const getDeadlineColor = (date) => {
    const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return 'text-red-600 bg-red-50';
    if (daysLeft <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  // Format salary
  const formatSalary = (job) => {
    if (job.as_per_companies_policy) return 'As per policy';
    if (job.is_salary_negotiable) return 'Negotiable';
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} BDT`;
    }
    if (job.salary_min) return `From ${job.salary_min.toLocaleString()} BDT`;
    return 'Not specified';
  };

  // Get job type badge color
  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-yellow-100 text-yellow-800',
      'contract': 'bg-blue-100 text-blue-800',
      'internship': 'bg-purple-100 text-purple-800',
      'remote': 'bg-indigo-100 text-indigo-800',
      'hybrid': 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Get sort label
  const getSortLabel = () => {
    const sorts = {
      latest: 'Latest Jobs',
      oldest: 'Oldest Jobs',
      deadline_soon: 'Deadline Soon',
      deadline_later: 'Deadline Later',
      salary_high: 'Highest Salary',
      salary_low: 'Lowest Salary',
      popular: 'Most Viewed',
      most_applied: 'Most Applied',
    };
    return sorts[filters.sort] || 'Latest Jobs';
  };

  // Get job listings array from paginated response
  const jobListingItems = jobListings?.data || [];

  // Pagination info
  const pagination = jobListings && {
    currentPage: jobListings.current_page,
    lastPage: jobListings.last_page,
    perPage: jobListings.per_page,
    total: jobListings.total,
    from: jobListings.from,
    to: jobListings.to,
  };

  return (
    <JobSeekerLayout>
      <Helmet>
        <title>Find Your Dream Job - Job Match</title>
        <meta name="description" content="Browse thousands of job opportunities and find your dream career" />
      </Helmet>

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Find Your Dream Job
              </h1>
              <p className="text-blue-100 mb-6">
                {stats.total_jobs.toLocaleString()} active jobs • {stats.total_views.toLocaleString()} total views • {stats.total_applications.toLocaleString()} applications
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by job title, company, or keyword..."
                    className="w-full bg-white pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="bg-white rounded-xl shadow-md sticky top-24">
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FaFilter size={16} className="text-gray-500" />
                      Filters
                    </h3>
                    {hasActiveFilters() && (
                      <button
                        onClick={resetFilters}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Reset all
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.job_listings_count || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Locations</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.job_listings_count || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={filters.job_type}
                      onChange={(e) => handleFilterChange('job_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {jobTypes.map(type => (
                        <option key={type} value={type}>
                          {type.replace('-', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experience_level}
                      onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Salary Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range (BDT)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder={`Min (${salaryRange.min.toLocaleString()})`}
                        value={filters.salary_min}
                        onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder={`Max (${salaryRange.max.toLocaleString()})`}
                        value={filters.salary_max}
                        onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={applyFilters}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden sticky top-0 z-10 bg-white shadow-md rounded-lg p-3 mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <FaFilter />
                  Filters
                  {hasActiveFilters() && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </span>
                {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {showMobileFilters && (
                <div className="mt-4 space-y-4">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>

                  <select
                    value={filters.job_type}
                    onChange={(e) => handleFilterChange('job_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <button
                    onClick={applyFilters}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              )}
            </div>

            {/* Job Listings */}
            <div className="flex-1">
              {/* Sort and Results Header */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{pagination?.from || 0}</span> to{' '}
                  <span className="font-semibold">{pagination?.to || 0}</span> of{' '}
                  <span className="font-semibold">{pagination?.total || 0}</span> jobs
                </div>

                {/* Welcome Message for Authenticated Users */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <FaUserCheck size={14} />
                    <span>Welcome back, {user?.name}!</span>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <FaChartLine size={14} />
                    Sort by: {getSortLabel()}
                    <FaChevronDown size={12} />
                  </button>

                  {showSortMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      {[
                        { value: 'latest', label: 'Latest Jobs' },
                        { value: 'oldest', label: 'Oldest Jobs' },
                        { value: 'deadline_soon', label: 'Deadline Soon' },
                        { value: 'deadline_later', label: 'Deadline Later' },
                        { value: 'salary_high', label: 'Highest Salary' },
                        { value: 'salary_low', label: 'Lowest Salary' },
                        { value: 'popular', label: 'Most Viewed' },
                        { value: 'most_applied', label: 'Most Applied' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-50 transition ${filters.sort === option.value ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters() && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Category: {categories.find(c => c.slug === filters.category)?.name}
                      <button onClick={() => clearFilter('category')} className="ml-1 hover:text-blue-600">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Location: {locations.find(l => String(l.id) === String(filters.location))?.name}
                      <button onClick={() => clearFilter('location')} className="ml-1 hover:text-blue-600">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {filters.job_type && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Type: {filters.job_type}
                      <button onClick={() => clearFilter('job_type')} className="ml-1 hover:text-blue-600">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                  {(filters.salary_min || filters.salary_max) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Salary: {filters.salary_min ? `${Number(filters.salary_min).toLocaleString()}+` : ''}
                      {filters.salary_min && filters.salary_max ? ' - ' : ''}
                      {filters.salary_max ? `up to ${Number(filters.salary_max).toLocaleString()}` : ''}
                      <button onClick={() => { clearFilter('salary_min'); clearFilter('salary_max'); }} className="ml-1 hover:text-blue-600">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Job Cards */}
              {!loading && jobListingItems.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBriefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or search term.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Job Cards Grid */}
              {!loading && (
                <div className="space-y-4">
                  {jobListingItems.map((job, index) => {
                    const isSaved = savedJobs.includes(job.id);

                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            {/* Job Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
                                  <Link to={`/jobs/${job.slug}`}>
                                    {job.title}
                                  </Link>
                                </h2>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJobTypeColor(job.job_type)}`}>
                                  {job.job_type?.replace('-', ' ').toUpperCase()}
                                </span>
                                {job.experience_level && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                    {job.experience_level}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <FaBuilding size={14} />
                                  <span>{job.employer?.name || 'Company'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaMapMarkerAlt size={14} />
                                  <span>
                                    {job.locations?.length > 0
                                      ? job.locations.map(l => l.name).join(', ')
                                      : 'Location not specified'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaDollarSign size={14} />
                                  <span className="font-medium text-green-600">
                                    {formatSalary(job)}
                                  </span>
                                </div>
                              </div>

                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {job.description}
                              </p>

                              <div className="flex flex-wrap gap-3 text-xs">
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getDeadlineColor(job.application_deadline)}`}>
                                  <FaCalendarAlt size={12} />
                                  <span>{formatDate(job.application_deadline)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Stats and Actions */}
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex gap-3 text-sm">
                                <div className="text-center">
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <FaEye size={14} />
                                    <span className="font-semibold">{job.views_count?.toLocaleString() || 0}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">Views</span>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <FaUsers size={14} />
                                    <span className="font-semibold">{job.applications_count || 0}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">Applied</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {/* Save Job Button */}
                                <button
                                  onClick={() => handleSaveJob(job.id)}
                                  disabled={savingJobId === job.id}
                                  className={`p-2 rounded-lg transition-all duration-200 ${isSaved
                                    ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                    : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                    } ${savingJobId === job.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={isSaved ? 'Remove from saved' : 'Save job'}
                                >
                                  {savingJobId === job.id ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                  ) : isSaved ? (
                                    <FaBookmark size={18} />
                                  ) : (
                                    <FaRegBookmark size={18} />
                                  )}
                                </button>

                                {/* Share Button */}
                                <button
                                  onClick={() => handleShareJob(job)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Share job"
                                >
                                  <FaShareAlt size={16} />
                                </button>

                                {/* Apply Button */}
                                <Link
                                  to={`/jobs/${job.slug}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                  View Details
                                  <FaChevronRight size={12} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.lastPage > 1 && !loading && (
                <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-gray-500">
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} jobs
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition ${pagination.currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                      <FaChevronLeft size={12} />
                      Previous
                    </button>

                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(pagination.lastPage, startPage + maxVisible - 1);

                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }

                      return (
                        <>
                          {startPage > 1 && (
                            <>
                              <button
                                onClick={() => handlePageChange(1)}
                                className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                              >
                                1
                              </button>
                              {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
                            </>
                          )}

                          {pages.map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm transition ${page === pagination.currentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                              {page}
                            </button>
                          ))}

                          {endPage < pagination.lastPage && (
                            <>
                              {endPage < pagination.lastPage - 1 && <span className="px-2 text-gray-400">...</span>}
                              <button
                                onClick={() => handlePageChange(pagination.lastPage)}
                                className="px-3 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                              >
                                {pagination.lastPage}
                              </button>
                            </>
                          )}
                        </>
                      );
                    })()}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition ${pagination.currentPage === pagination.lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                      Next
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
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