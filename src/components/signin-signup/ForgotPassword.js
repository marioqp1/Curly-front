import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import logo from '../../icons/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await axios.post(`http://localhost:8080/auth/forgot-password?email=${encodeURIComponent(email)}`);
            setMessage('If the email exists, a reset link has been sent.');
        } catch (error) {
            setMessage('Failed to send reset email.');
        } finally {
            setLoading(false);
        }
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
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Forgot your password?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">Enter your email address and we'll send you a link to reset your password.</p>
                </div>
                {/* Right Section: Forgot Password Form */}
                <div className="flex flex-col justify-center w-full md:w-1/2 p-8 md:p-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <img src={logo} alt="Curely Logo" className="h-16 w-16 mx-auto mb-2" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reset Your Password</h1>
                        <p className="text-gray-600 dark:text-gray-300">We'll send you a reset link if the email exists</p>
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
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-yellow-400 dark:focus:border-yellow-400 transition-colors"
                                        placeholder="Enter your email"
                                        autoComplete="username"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-gray-900 py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-yellow-400 mr-2"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                            {message && (
                                <div className={`p-3 rounded-lg text-sm mt-2 transition-colors duration-200 ${
                                    message.includes('reset link')
                                        ? 'bg-success-50 text-success-700 border border-success-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
                                        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                                }`}>
                                    {message}
                                </div>
                            )}
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary-500 dark:text-yellow-400 hover:text-primary-700 dark:hover:text-yellow-300 font-medium transition-colors bg-transparent"
                            >
                                Back to Login
                            </button>
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

export default ForgotPassword; 