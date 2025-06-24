import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
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
            const loginResponse = await axios.post("http://localhost:8080/api/login", formData);
            if (loginResponse.status) {
                const token = loginResponse.data.data;
                localStorage.setItem('token', token);
                setMessage('Login successful!');
                const tokenDTO = { token:token};
                const roleResponse = await axios.post(
                    `http://localhost:8080/api/user/role`,
                    tokenDTO
                );
                const userRole = roleResponse.data.data;
                if (userRole === 'ROLE_CLIENT') {
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
            setMessage('Login failed ');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        navigate('/signup');
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-950 font-sans transition-colors duration-300">
            {/* Dark mode toggle */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
            <div className="flex w-full h-full md:h-4/5 md:w-4/5 xl:w-3/4 2xl:w-2/3 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-transparent">
                {/* Left Section: Welcome and Features */}
                <div className="flex flex-col justify-center w-1/2 p-10 hidden md:flex bg-transparent">
                    <div className="flex items-center mb-8">
                        <img src={logo} alt="Curely Logo" className="h-20 w-20 mr-3" />
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-bold text-primary-700 leading-tight">Curely</span>
                            <span className="text-xs text-primary-500 -mt-1">Quick care, Always there</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome back to <span className="text-primary-600 dark:text-yellow-400">Curely</span></h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">Your trusted partner for health and wellness. Access your account to manage prescriptions, track orders, and get personalized care.</p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m4 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10m16 0a2 2 0 01-2 2H7a2 2 0 01-2-2" /></svg>
                            </span>
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-white">Fast Delivery</span>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Get your medications delivered within 24 hours</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0a4 4 0 100-8 4 4 0 000 8z" /></svg>
                            </span>
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-white">Secure & Safe</span>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">HIPAA compliant with end-to-end encryption</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                            </span>
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-white">24/7 Support</span>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Round-the-clock pharmacy consultation</p>
                            </div>
                        </li>
                    </ul>
                    <div className="flex items-center bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 mr-3">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <div>
                            <span className="font-semibold text-green-800 dark:text-green-200">FDA Approved Medications</span>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">All our medications are sourced from licensed pharmacies and meet strict quality standards.</p>
                        </div>
                    </div>
                </div>
                {/* Right Section: Login Form */}
                <div className="flex flex-col justify-center w-full md:w-1/2 p-8 md:p-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <img src={logo} alt="Curely Logo" className="h-16 w-16 mx-auto mb-2" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sign In to Curely</h1>
                        <p className="text-gray-600 dark:text-gray-300">Access your health dashboard and manage your medications</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent focus:outline-none"
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
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                    <input type="checkbox" className="form-checkbox mr-2" /> Remember me
                                </label>
                                <button type="button" className="text-primary-500 dark:text-yellow-400 hover:underline text-sm bg-transparent focus:outline-none">Forgot password?</button>
                            </div>
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
                        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                            Your information is protected with 256-bit SSL encryption
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
