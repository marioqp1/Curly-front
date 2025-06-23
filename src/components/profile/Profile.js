import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  UserCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    gender: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your profile');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/user/details', {
        headers: {
          'token': token
        }
      });

      if (response.data.status) {
        setUserData({
          email: response.data.data.email || '',
          firstName: response.data.data.firstName || '',
          lastName: response.data.data.lastName || '',
          phone: response.data.data.phone || '',
          address: response.data.data.address || '',
          city: response.data.data.city || '',
          gender: response.data.data.gender || ''
        });
      } else {
        setError(response.data.message || 'Failed to fetch profile data');
      }
    } catch (err) {
      setError('Failed to fetch profile data. Please try again later.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setError('Please enter your current password to make changes');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update your profile');
        return;
      }

      const response = await axios.put('http://localhost:8080/api/user/update-details', 
        userData,
        {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          },
          params: {
            currentPassword: currentPassword
          }
        }
      );

      if (response.data.status) {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        setCurrentPassword('');
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Current password is incorrect');
      } else {
        setError('Failed to update profile. Please try again later.');
      }
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Please login to change your password');
        return;
      }

      // First check if current password is correct
      const checkResponse = await axios.post('http://localhost:8080/api/user/password-check', 
        passwordData.currentPassword,
        {
          headers: {
            'token': token,
            'Content-Type': 'text/plain'
          }
        }
      );

      if (!checkResponse.data.status || !checkResponse.data.data) {
        setPasswordError('Current password is incorrect');
        return;
      }

      // If current password is correct, update to new password
      const updateResponse = await axios.put('http://localhost:8080/api/user/details', 
        { password: passwordData.newPassword },
        {
          headers: {
            'token': token
          }
        }
      );

      if (updateResponse.data.status) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(updateResponse.data.message || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('Failed to update password. Please try again later.');
      console.error('Error updating password:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 mb-6">
            <UserCircleIcon className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <nav className="space-y-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    !isEditing
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  Personal Information
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isEditing
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <PencilIcon className="h-5 w-5 mr-3" />
                  Edit Profile
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content - Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Messages */}
              {(error || successMessage) && (
                <div className={`p-4 ${
                  error ? 'bg-red-50 border-l-4 border-red-400' : 'bg-green-50 border-l-4 border-green-400'
                }`}>
                  <div className="flex items-center">
                    {error ? (
                      <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
                    ) : (
                      <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                    )}
                    <p className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>
                      {error || successMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {isEditing && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                      <div className="flex items-start">
                        <ShieldCheckIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Security Check</h3>
                          <p className="mt-1 text-sm text-yellow-700">
                            Please enter your current password to make changes to your profile.
                          </p>
                          <div className="mt-3">
                            <input
                              type="password"
                              id="currentPassword"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="block w-full rounded-lg border-yellow-200 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm"
                              placeholder="Enter your current password"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* First Name */}
                    <div className="relative">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="relative">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="relative">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={userData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="relative">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={userData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="relative">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        id="gender"
                        value={userData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setCurrentPassword('');
                          fetchUserProfile();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2 text-primary-500" />
                  Change Password
                </h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Password */}
                    <div className="relative">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Messages */}
                  {passwordError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                      <div className="flex">
                        <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">{passwordError}</p>
                      </div>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                      <div className="flex">
                        <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                        <p className="text-sm text-green-700">{passwordSuccess}</p>
                      </div>
                    </div>
                  )}

                  {/* Password Change Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 