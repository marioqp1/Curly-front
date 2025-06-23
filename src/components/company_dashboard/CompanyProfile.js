import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const CompanyProfile = () => {
  // User profile state
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    gender: ''
  });
  const [userEdit, setUserEdit] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [userSuccess, setUserSuccess] = useState(null);
  const [userCurrentPassword, setUserCurrentPassword] = useState('');

  // Company profile state
  const [companyData, setCompanyData] = useState({
    companyId: '',
    name: '',
    companyEmail: '',
    phone: '',
    logoUrl: '',
    // Removed address and city
  });
  const [companyEdit, setCompanyEdit] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [companySuccess, setCompanySuccess] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Fetch user and company data on mount
  useEffect(() => {
    fetchUserProfile();
    fetchCompanyProfile();
  }, []);

  const fetchUserProfile = async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/user/details', {
        headers: { token }
      });
      if (response.data.status) {
        setUserData(response.data.data);
      } else {
        setUserError(response.data.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      setUserError('Failed to fetch user profile');
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCompanyProfile = async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/company/get/id', {
        headers: { token }
      });
      if (response.data.status) {
        setCompanyData(response.data.data);
      } else {
        setCompanyError(response.data.message || 'Failed to fetch company profile');
      }
    } catch (err) {
      setCompanyError('Failed to fetch company profile');
    } finally {
      setCompanyLoading(false);
    }
  };

  // User profile handlers
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSave = async (e) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);
    if (!userCurrentPassword) {
      setUserError('Please enter your current password to save changes.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8080/api/user/update-details', userData, {
        headers: { token },
        params: { currentPassword: userCurrentPassword }
      });
      if (response.data.status) {
        setUserSuccess('Profile updated successfully.');
        setUserEdit(false);
        setUserCurrentPassword('');
        fetchUserProfile();
      } else {
        setUserError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setUserError('Failed to update profile');
    }
  };

  // Company profile handlers
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    setCompanyError(null);
    setCompanySuccess(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/company/update/${companyData.companyId}`, companyData, {
        headers: { token }
      });
      if (response.data.status) {
        setCompanySuccess('Company profile updated successfully.');
        setCompanyEdit(false);
        fetchCompanyProfile();
      } else {
        setCompanyError(response.data.message || 'Failed to update company profile');
      }
    } catch (err) {
      setCompanyError('Failed to update company profile');
    }
  };

  // Logo upload handler
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('imageFile', file);
      const response = await axios.post('http://localhost:8080/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', token }
      });
      if (response.data) {
        setCompanyData(prev => ({ ...prev, logoUrl: response.data }));
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Company User Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <UserCircleIcon className="h-12 w-12 text-blue-500 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Account Owner Profile</h2>
          </div>
          {userLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form onSubmit={handleUserSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={userData.email} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" value={userData.phone} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={userData.firstName} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={userData.lastName} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" name="address" value={userData.address} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" value={userData.city} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select name="gender" value={userData.gender} onChange={handleUserInputChange} disabled={!userEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              {userEdit && (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                  <input type="password" placeholder="Current Password" value={userCurrentPassword} onChange={e => setUserCurrentPassword(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:w-1/2" required />
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => { setUserEdit(false); setUserCurrentPassword(''); fetchUserProfile(); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700">Save</button>
                  </div>
                </div>
              )}
              {!userEdit && (
                <button type="button" onClick={() => setUserEdit(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                  <PencilIcon className="h-5 w-5 mr-2" />Edit Profile
                </button>
              )}
              {userError && <div className="text-red-600 mt-2">{userError}</div>}
              {userSuccess && <div className="text-green-600 mt-2">{userSuccess}</div>}
            </form>
          )}
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            {companyData.logoUrl ? (
              <img src={companyData.logoUrl} alt={companyData.name} className="h-16 w-16 rounded-full shadow mr-4 object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-200 flex items-center justify-center shadow mr-4">
                <BuildingOffice2Icon className="h-8 w-8 text-blue-500" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">Company Info</h2>
          </div>
          {companyLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form onSubmit={handleCompanySave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input type="text" name="name" value={companyData.name} onChange={handleCompanyInputChange} disabled={!companyEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Email</label>
                  <input type="email" name="companyEmail" value={companyData.companyEmail} onChange={handleCompanyInputChange} disabled={!companyEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" value={companyData.phone} onChange={handleCompanyInputChange} disabled={!companyEdit} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo</label>
                  <div className="flex items-center space-x-3">
                    <input type="file" accept="image/*" onChange={handleLogoChange} disabled={!companyEdit || logoUploading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {logoUploading && <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />}
                  </div>
                  {companyData.logoUrl && (
                    <img src={companyData.logoUrl} alt="Logo Preview" className="h-12 w-12 rounded-full mt-2 shadow border border-blue-100 object-cover" />
                  )}
                </div>
              </div>
              {companyEdit && (
                <div className="flex space-x-3">
                  <button type="button" onClick={() => { setCompanyEdit(false); fetchCompanyProfile(); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700">Save</button>
                </div>
              )}
              {!companyEdit && (
                <button type="button" onClick={() => setCompanyEdit(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                  <PencilIcon className="h-5 w-5 mr-2" />Edit Company Info
                </button>
              )}
              {companyError && <div className="text-red-600 mt-2">{companyError}</div>}
              {companySuccess && <div className="text-green-600 mt-2">{companySuccess}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 