import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  ShoppingCartIcon,
  UserIcon,
  ClockIcon,
  Cog6ToothIcon,
  InboxIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  TagIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import logo from '../../icons/logo.png';
import SearchBar from '../search/SearchBar';
import axios from 'axios';
//../../assets/icons/logo.png

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Default to light mode unless 'dark' is explicitly set
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItemCount = async () => {
      const token = localStorage.getItem('token');
      if (token && userRole === 'ROLE_CLIENT') {
        try {
          const response = await axios.get('http://localhost:8080/api/cart/items', {
            headers: { token },
          });
          if (response.data.data && Array.isArray(response.data.data.items)) {
            setCartItemCount(response.data.data.items.length);
          } else {
            setCartItemCount(0);
          }
        } catch (error) {
          console.error('Failed to fetch cart items:', error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartItemCount();
    const intervalId = setInterval(fetchCartItemCount, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [userRole]);

  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      if (token && role) {
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    };

    // Check role immediately
    checkUserRole();

    // Set up an interval to check for role changes
    const intervalId = setInterval(checkUserRole, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    // Clear all authentication-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    // Clear any other potential user-related data
    localStorage.removeItem('userData');
    localStorage.removeItem('companyId');
    localStorage.removeItem('branchId');
    
    // Reset user state
    setUserRole(null);
    setCartItemCount(0);
    
    // Navigate to login page
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const renderDashboardLink = () => {
    const role = localStorage.getItem('userRole');

    switch (role) {
      case 'ROLE_ADMIN':
        return (
          <Link to="/admin" className="nav-link">
            Admin Dashboard
          </Link>
        );
      case 'ROLE_COMPANY':
        return (
          <Link to="/company" className="nav-link">
            Company Dashboard
          </Link>
        );
      case 'ROLE_EMPLOYEE':
        return (
          <Link to="/employee" className="nav-link">
            Employee Dashboard
          </Link>
        );
      default:
        return null;
    }
  };

  const currentPath = window.location.pathname;

  // Minimal navbar for login/signup
  if (currentPath === '/login' || currentPath === '/signup') {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="flex w-full items-center h-20 px-4">
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => handleNavigation('/')}> 
            <img src={logo} alt="Curely Logo" className="h-12 w-12 mr-4" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {currentPath !== '/login' && (
              <button
                onClick={() => handleNavigation('/login')}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
              >
                Login
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  const renderDefaultNavbar = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
            <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-4" style={{ minWidth: '80px', minHeight: '80px' }} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigation('/login')}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium"
            >
              <UserIcon className="h-5 w-5" />
              <span>Login</span>
            </button>
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  if (isLoading) {
    return null;
  }

  // Don't show navbar on login/signup pages
  // const currentPath = window.location.pathname;
  // if (currentPath === '/login' || currentPath === '/signup') {
  //   return null;
  // }

  const renderClientNavbar = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="w-full">
        <div className="flex w-full items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer flex-shrink-0 pl-4" onClick={() => handleNavigation('/')}> 
            <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-4" style={{ minWidth: '80px', minHeight: '80px' }} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation Items */}
          <div className="ml-auto hidden md:flex items-center space-x-4 pr-8">
            <button
              onClick={() => handleNavigation('/wishlist')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Wishlist</span>
            </button>

            <button
              onClick={() => handleNavigation('/prescription-reader')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Prescription Reader</span>
            </button>

            <Link
              to="/cart"
              className="relative bg-transparent flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="ml-1">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link
              to="/orders"
              className="bg-transparent flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ClockIcon className="h-6 w-6 mr-1" />
              Orders
            </Link>

            <Link
              to="/profile"
              className="bg-transparent flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <UserCircleIcon className="h-6 w-6 mr-1" />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => handleNavigation('/wishlist')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <HeartIcon className="h-5 w-5" />
                <span>Wishlist</span>
              </button>

              <button
                onClick={() => handleNavigation('/prescription-reader')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Prescription Reader</span>
              </button>

              <button
                onClick={() => handleNavigation('/cart')}
                className="relative bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavigation('/orders')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ClockIcon className="h-5 w-5" />
                <span>Orders</span>
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderAdminNavbar = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="w-full">
        <div className="flex w-full items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer flex-shrink-0 pl-4" onClick={() => handleNavigation('/admin-dashboard')}> 
            <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-4" style={{ minWidth: '80px', minHeight: '80px' }} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>
          {/* Desktop Navigation Items */}
          <div className="ml-auto hidden md:flex items-center space-x-4 pr-8">
            <button
              onClick={() => handleNavigation('/admin-dashboard/manage-drugs')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <BeakerIcon className="h-5 w-5" />
              <span>Manage Drugs</span>
            </button>

            <button
              onClick={() => handleNavigation('/admin-dashboard/manage-categories')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <TagIcon className="h-5 w-5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => handleNavigation('/admin-dashboard/manage-active-ingredients')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>Ingredients</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => handleNavigation('/admin-dashboard/manage-drugs')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <BeakerIcon className="h-5 w-5" />
                <span>Manage Drugs</span>
              </button>

              <button
                onClick={() => handleNavigation('/admin-dashboard/manage-categories')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <TagIcon className="h-5 w-5" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => handleNavigation('/admin-dashboard/manage-active-ingredients')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <span>Ingredients</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderCompanyNavbar = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="w-full">
        <div className="flex w-full items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer flex-shrink-0 pl-4" onClick={() => handleNavigation('/company/dashboard')}> 
            <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-4" style={{ minWidth: '80px', minHeight: '80px' }} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>
          {/* Desktop Navigation Items */}
          <div className="ml-auto hidden md:flex items-center space-x-4 pr-8">
            <button
              onClick={() => handleNavigation('/company/profile')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>Company Profile</span>
            </button>

            <button
              onClick={() => handleNavigation('/company/inventory')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <InboxIcon className="h-5 w-5" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => handleNavigation('/company/branches')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>Branches</span>
            </button>

            <button
              onClick={() => handleNavigation('/company/requests')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>Requests</span>
            </button>

            <button
              onClick={() => handleNavigation('/company/employees')}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <UserIcon className="h-5 w-5" />
              <span>Employees</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => handleNavigation('/company/profile')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Company Profile</span>
              </button>

              <button
                onClick={() => handleNavigation('/company/inventory')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <InboxIcon className="h-5 w-5" />
                <span>Inventory</span>
              </button>

              <button
                onClick={() => handleNavigation('/company/branches')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Branches</span>
              </button>

              <button
                onClick={() => handleNavigation('/company/requests')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <span>Requests</span>
              </button>

              <button
                onClick={() => handleNavigation('/company/employees')}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <UserIcon className="h-5 w-5" />
                <span>Employees</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-transparent flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderEmployeeNavbar = () => (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="w-full">
        <div className="flex w-full items-center h-20">
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer flex-shrink-0 pl-4" onClick={() => handleNavigation('/branch/dashboard')}> 
            <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-4" style={{ minWidth: '80px', minHeight: '80px' }} />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary-700 dark:text-yellow-400 leading-tight">Curely</span>
              <span className="text-sm text-primary-500 dark:text-yellow-200 -mt-1">Quick care, Always there</span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="ml-auto hidden md:flex items-center space-x-4 pr-8">
            <button
              onClick={handleLogout}
              className="bg-transparent flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Render appropriate navbar based on user role
  if (!userRole) {
    return renderDefaultNavbar();
  }
  
  if (userRole === 'ROLE_CLIENT') {
    return renderClientNavbar();
  } else if (userRole === 'ROLE_ADMIN') {
    return renderAdminNavbar();
  } else if (userRole === 'ROLE_COMPANY') {
    return renderCompanyNavbar();
  } else if (userRole === 'ROLE_EMPLOYEE') {
    return renderEmployeeNavbar();
  }
  
  // Default to the default navbar if role doesn't match any condition
  return renderDefaultNavbar();
};

export default Navbar;

