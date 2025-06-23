import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import logo from '../../icons/logo.png';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const Signup = () => {
    const [isCompany, setIsCompany] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        gender: '',
        companyName: '',
        companyEmail: '',
        companyPhone: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleRadioChange = (e) => {
        setIsCompany(e.target.value === 'company');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { email, password, firstName, lastName, phone, address, city, gender, companyName, companyEmail, companyPhone } = formData;
        const apiEndpoint = isCompany ? '/api/signup/company' : '/api/signup/client';

        // Construct the data object to match your DTO
        const data = isCompany 
            ? { email, password, firstName, lastName, phone, address, city, gender, companyName, companyEmail, companyPhone } 
            : { email, password, firstName, lastName, phone, address, city, gender };

        try {
            const response = await axios.post(`http://localhost:8080${apiEndpoint}`, data);
            
            if (response.data.status) {
                setMessage('Signup successful! Redirecting...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            if (error.response) {
                setMessage('Signup failed: ' + (error.response.data?.message || 'Something went wrong'));
            } else if (error.request) {
                setMessage('Signup failed: No response from server');
            } else {
                setMessage('Signup failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
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
            <div className="max-w-lg w-full mx-4">
                {/* Header with Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <img src={logo} alt="Curely Logo" className="h-12 w-12 mr-3" />
                        <div className="flex flex-col items-start">
                            <span className="text-3xl font-bold text-primary-700 leading-tight">Curely</span>
                            <span className="text-xs text-primary-500 -mt-1">Quick care, Always there</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create Your Account</h1>
                    <p className="text-gray-600 dark:text-gray-300">Sign up to get started</p>
                </div>
                {/* Signup Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    {/* Tabs for Client/Company */}
                    <div className="flex mb-8">
                        <button
                            type="button"
                            onClick={() => setIsCompany(false)}
                            className={`flex-1 py-2 rounded-l-lg font-semibold transition-colors duration-200 focus:outline-none ${!isCompany ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        >
                            Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCompany(true)}
                            className={`flex-1 py-2 rounded-r-lg font-semibold transition-colors duration-200 focus:outline-none ${isCompany ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        >
                            Company
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="First Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Email" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Password" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Phone" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Address" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="City" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors">
                                    <option value="">Select Gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>
                        {/* Company Fields */}
                        {isCompany && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Name</label>
                                        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required={isCompany} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Company Name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Email</label>
                                        <input type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} required={isCompany} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Company Email" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Company Phone</label>
                                        <input type="tel" name="companyPhone" value={formData.companyPhone} onChange={handleChange} required={isCompany} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600 transition-colors" placeholder="Company Phone" />
                                    </div>
                                </div>
                            </>
                        )}
                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Signing up...
                                </div>
                            ) : (
                                'Sign Up'
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
                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-300">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary-500 hover:text-primary-700 font-medium transition-colors"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
