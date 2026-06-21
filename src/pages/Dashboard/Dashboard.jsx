// src/pages/Dashboard/Dashboard.jsx

// React
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Icons
import {
  FiBriefcase,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiBell,
  FiActivity,
  FiSmile,
  FiTarget,
  FiThumbsUp,
} from 'react-icons/fi';

// Axios
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();

  // Get user data from localStorage or state
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [animateStats, setAnimateStats] = useState(false);

  // Get user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setTimeout(() => {
          setUser(parsedUser);
        }, 0);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    if (hour < 12) newGreeting = 'Good morning';
    else if (hour < 18) newGreeting = 'Good afternoon';
    else newGreeting = 'Good evening';

    setTimeout(() => {
      setGreeting(newGreeting);
    }, 0);

    setTimeout(() => setAnimateStats(true), 100);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications({ recent: [] });
      }
    };

    if (!loading) {
      fetchNotifications();
    }
  }, [loading]);

  // If user is not loaded, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const recentNotifications = notifications?.recent || [];

  // Animated counter component
  const AnimatedCounter = ({ value, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (animateStats) {
        let start = 0;
        const duration = 1000;
        const increment = value / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);

        return () => clearInterval(timer);
      }
    }, [value]);

    return <span>{count}{suffix}</span>;
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, suffix = '', delay = 0 }) => (
    <div className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-up animation-delay-${delay}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {animateStats ? <AnimatedCounter value={value} suffix={suffix} /> : value}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-linear-to-br ${color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Activity Item Component
  const ActivityItem = ({ icon: Icon, title, time, color, status }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group">
      <div className={`p-2 rounded-lg bg-linear-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          {status && (
            <span className={`text-xs px-2 py-1 rounded-full ${status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
              {status === 'success' ? 'Completed' : status === 'warning' ? 'Pending' : 'New'}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );

  // Quick Action Button
  const QuickAction = ({ icon: Icon, label, color, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <div className={`p-3 rounded-lg bg-linear-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );

  // Job Seeker Stats with default values
  const jobSeekerStats = [
    {
      title: 'Applications Sent',
      value: user?.stats?.applications_sent || 0,
      icon: FiFileText,
      color: 'from-blue-500 to-blue-600',
      suffix: ''
    },
    {
      title: 'Shortlisted',
      value: user?.stats?.shortlisted || 0,
      icon: FiStar,
      color: 'from-green-500 to-emerald-600',
      suffix: ''
    },
    {
      title: 'Interviews',
      value: user?.stats?.interviews || 0,
      icon: FiClock,
      color: 'from-purple-500 to-purple-600',
      suffix: ''
    },
    {
      title: 'Success Rate',
      value: user?.stats?.success_rate || 0,
      icon: FiTrendingUp,
      color: 'from-yellow-500 to-orange-600',
      suffix: '%'
    }
  ];

  // Get activities based on notifications or default
  const getActivities = () => {
    if (recentNotifications.length > 0) {
      return recentNotifications.slice(0, 4).map((notification) => ({
        icon: notification.read_at ? FiBell : FiCheckCircle,
        title: notification.data?.title || 'Application updated',
        time: new Date(notification.created_at).toLocaleString(),
        color: notification.read_at ? 'from-slate-500 to-slate-600' : 'from-blue-500 to-cyan-600',
        status: notification.read_at ? 'success' : 'new',
      }));
    }

    return [
      {
        icon: FiCheckCircle,
        title: 'Welcome to Dwip Unnayan Society! Start your job search journey.',
        time: 'Just now',
        color: 'from-blue-500 to-cyan-600',
        status: 'new'
      },
      {
        icon: FiTarget,
        title: 'Complete your profile to get better job matches',
        time: 'Tips',
        color: 'from-green-500 to-emerald-600',
        status: 'warning'
      },
      {
        icon: FiBriefcase,
        title: 'Browse available jobs and find your perfect match',
        time: 'Get started',
        color: 'from-purple-500 to-purple-600',
        status: 'new'
      },
      {
        icon: FiStar,
        title: 'Save jobs you\'re interested in for later',
        time: 'Tip',
        color: 'from-yellow-500 to-orange-600',
        status: 'warning'
      }
    ];
  };

  // Quick Actions for Job Seeker
  const getQuickActions = () => {
    return [
      { icon: FiFileText, label: 'Browse Jobs', color: 'from-blue-500 to-blue-600', onClick: () => navigate('/jobs') },
      { icon: FiTarget, label: 'Upload Resume', color: 'from-green-500 to-emerald-600', onClick: () => navigate('/profile') },
      { icon: FiActivity, label: 'Track Applications', color: 'from-purple-500 to-purple-600', onClick: () => navigate('/applications') },
      { icon: FiBell, label: 'Notifications', color: 'from-orange-500 to-red-600', onClick: () => navigate('/notifications') }
    ];
  };

  // Progress message for job seeker with dynamic value
  const getProgressValue = () => {
    let completed = 0;
    const total = 5;

    if (user?.first_name) completed++;
    if (user?.last_name) completed++;
    if (user?.email) completed++;
    if (user?.phone) completed++;
    if (user?.resume_url) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = {
    label: 'Profile Completion',
    value: getProgressValue(),
    unit: '%',
    message: getProgressValue() === 100
      ? '🎉 Your profile is complete! You\'re ready to start applying for jobs.'
      : 'Complete your profile to increase your chances of getting hired! Add your skills and experience.'
  };

  const activities = getActivities();
  const quickActions = getQuickActions();
  const hasStats = jobSeekerStats.some(stat => stat.value > 0);

  return (
    <>
      <Helmet>
        <title>Dashboard - Dwip Unnayan Society</title>
        <meta name="description" content="Job Match dashboard overview" />
      </Helmet>

      {/* Welcome Section with Animation */}
      <div className="mb-8 animate-fade-in-up">
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {greeting || 'Welcome'}, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-blue-100">
                {hasStats
                  ? "Here's what's happening with your job search today."
                  : "Welcome to Dwip Unnayan Society! Start your journey to find your dream job."}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-3">
                <FiSmile className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {jobSeekerStats.map((stat, index) => (
          <StatCard key={index} {...stat} delay={index * 100} />
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8 animate-fade-in-up animation-delay-400">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-fade-in-up animation-delay-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {recentNotifications.length > 0 ? 'Recent Activity' : 'Getting Started'}
            </h2>
            <FiActivity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Achievement/Motivation Card */}
        <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 animate-fade-in-up animation-delay-600">
          <div className="text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {getProgressValue() === 100 ? '🎉 Complete!' : 'Your Progress'}
              </h2>
              <FiThumbsUp className="w-6 h-6" />
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>{progress.label}</span>
                <span>{progress.value}{progress.unit}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${progress.value}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm opacity-90">
              {progress.message}
            </p>
            {getProgressValue() < 100 && (
              <button
                onClick={() => navigate('/profile')}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-300"
              >
                Complete Your Profile →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
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
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </>
  );
};

export default Dashboard;