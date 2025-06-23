import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import logo from '../../icons/logo.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            // Default to light mode unless 'dark' is explicitly set
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Send login request
            const loginResponse = await axios.post("http://localhost:8080/api/login", formData);
            

            if (loginResponse.status) {
                // Save the token in localStorage
                const token = loginResponse.data.data;  // Ensure the token is a string
                localStorage.setItem('token', token);
                setMessage('Login successful!');
               
                // Prepare token for role request
                const tokenDTO = { token:token};
            
                console.log(tokenDTO.data);

                // Send the token in the body as JSON to get the user role
                const roleResponse = await axios.post(
                    `http://localhost:8080/api/user/role`,
                    tokenDTO // Send token in request body
                );

                const userRole = roleResponse.data.data;
                console.log(userRole);

                // Redirect based on the user's role
                if (userRole === 'ROLE_CLIENT') {
                    //ROLE_CLIENT
                    localStorage.setItem('userRole', userRole);
                    navigate('/');
                } else if (userRole === 'ROLE_ADMIN') {
                    localStorage.setItem('userRole', userRole);
                    navigate('/admin-dashboard');
                } else if (userRole === 'ROLE_EMPLOYEE') {
                    localStorage.setItem('userRole', userRole);
                    navigate('/branch/dashboard');
                } else if (userRole === 'ROLE_COMPANY') {
                    localStorage.setItem('userRole', userRole);
                    navigate('/company/dashboard');
                } else {
                    setMessage('Unknown role. Please contact support.');
                }
            } else {
                setMessage('Login failed: Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            //const errorMessage = error.response?.data?.message || 'Something went wrong';
            setMessage('Login failed ');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        // Navigate to the Signup page
        navigate('/signup');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center font-sans transition-colors duration-300">
            {/* Fixed dark mode toggle button */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
            <div className="max-w-md w-full mx-4">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <img src={logo} alt="Curely Logo" className="h-12 w-12 mr-3" />
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-bold text-primary-700 leading-tight">Curely</span>
                            <span className="text-xs text-primary-500 -mt-1">Quick care, Always there</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
                </div>
                {/* Login Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400 transition-colors"
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400 transition-colors"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-yellow-400 transition" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-yellow-400 transition" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-gray-900 py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-yellow-400 mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                        {/* Error/Success Message */}
                        {message && (
                            <div className={`p-3 rounded-lg text-sm mt-2 transition-colors duration-200 ${
                                message.includes('successful')
                                    ? 'bg-success-50 text-success-700 border border-success-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                            }`}>
                                {message}
                            </div>
                        )}
                    </form>
                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                            Don't have an account?{' '}
                            <button
                                onClick={handleRegisterClick}
                                className="text-primary-500 dark:text-yellow-400 hover:text-primary-700 dark:hover:text-yellow-300 font-medium transition-colors bg-transparent"
                            >
                                Create Account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
