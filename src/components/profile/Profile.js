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
  ArrowPathIcon,
  CameraIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const Profile = () => {
  const [userData, setUserData] = useState({
    id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    gender: '',
    dateCreated: '',
    enabled: true,
    userRoles: ''
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
  const [activeTab, setActiveTab] = useState('Personal');
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalPassword, setPersonalPassword] = useState("");
  const [personalMessage, setPersonalMessage] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressPassword, setAddressPassword] = useState("");
  const [addressMessage, setAddressMessage] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const navigate = useNavigate();

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
          id: response.data.data.id,
          email: response.data.data.email || '',
          password: response.data.data.password || '',
          firstName: response.data.data.firstName || '',
          lastName: response.data.data.lastName || '',
          phone: response.data.data.phone || '',
          address: response.data.data.address || '',
          city: response.data.data.city || '',
          gender: response.data.data.gender || '',
          dateCreated: response.data.data.dateCreated || '',
          enabled: response.data.data.enabled,
          userRoles: response.data.data.userRoles || ''
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

  const handlePersonalUpdate = async () => {
    setPersonalMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPersonalMessage('Please login to update your profile');
        return;
      }
      if (!personalPassword) {
        setPersonalMessage('Please enter your current password');
        return;
      }
      const payload = {
        id: userData.id,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        gender: userData.gender
      };
      const response = await axios.put(
        `http://localhost:8080/api/user/update-details?currentPassword=${encodeURIComponent(personalPassword)}`,
        payload,
        { headers: { token, 'Content-Type': 'application/json' } }
      );
      if (response.data.status) {
        setPersonalMessage('Profile updated successfully');
        setEditingPersonal(false);
        setPersonalPassword("");
        fetchUserProfile();
      } else {
        setPersonalMessage(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setPersonalMessage('Failed to update profile. Please try again later.');
    }
  };

  const handleAddressUpdate = async () => {
    setAddressMessage(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAddressMessage('Please login to update your address');
        return;
      }
      if (!addressPassword) {
        setAddressMessage('Please enter your current password');
        return;
      }
      const payload = {
        id: userData.id,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        gender: userData.gender
      };
      const response = await axios.put(
        `http://localhost:8080/api/user/update-details?currentPassword=${encodeURIComponent(addressPassword)}`,
        payload,
        { headers: { token, 'Content-Type': 'application/json' } }
      );
      if (response.data.status) {
        setAddressMessage('Address updated successfully');
        setEditingAddress(false);
        setAddressPassword("");
        fetchUserProfile();
      } else {
        setAddressMessage(response.data.message || 'Failed to update address');
      }
    } catch (err) {
      setAddressMessage('Failed to update address. Please try again later.');
    }
  };

  // Fetch orders when Orders tab is selected
  useEffect(() => {
    if (activeTab !== 'Orders') return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/orders/user', { headers: { token } });
        setOrders(res.data.data || []);
        // Fetch details for each order
        const detailsObj = {};
        await Promise.all((res.data.data || []).map(async (order) => {
          const detailsRes = await axios.get(`http://localhost:8080/api/orders/details?orderId=${order.id}`);
          detailsObj[order.id] = detailsRes.data.data || [];
        }));
        setOrderDetails(detailsObj);
      } catch (err) {
        setOrdersError('Failed to fetch orders.');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  // Helper to ensure valid coordinates
  const getValidLatLng = (lat, lng) => [
    typeof lat === 'number' && !isNaN(lat) ? lat : 30.0444,
    typeof lng === 'number' && !isNaN(lng) ? lng : 31.2357
  ];

  // Fetch user location on profile load
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:8080/api/location/get', { headers: { token } });
        if (res.data.status && res.data.data) {
          setUserLocation({ lat: res.data.data.lat, lng: res.data.data.lng });
        }
      } catch {}
    };
    fetchLocation();
  }, []);

  // Fetch place name from lat/lng
  const fetchPlaceName = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setPlaceName(data.display_name || '');
    } catch {
      setPlaceName('');
    }
  };

  // Update place name when userLocation changes
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      fetchPlaceName(userLocation.lat, userLocation.lng);
    } else {
      setPlaceName('');
    }
  }, [userLocation]);

  // Map modal for location picker
  function LocationModal({ open, onClose, onSave, lat, lng }) {
    const [tempLocation, setTempLocation] = useState(getValidLatLng(lat, lng));
    useEffect(() => {
      setTempLocation(getValidLatLng(lat, lng));
    }, [lat, lng, open]);
    const handleUseMyLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setTempLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          () => alert('Could not get your location')
        );
      } else {
        alert('Geolocation is not supported by your browser');
      }
    };
    function DraggableMarker({ position, onChange }) {
      useMapEvents({
        click(e) {
          onChange([e.latlng.lat, e.latlng.lng]);
        },
      });
      return (
        <Marker
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              onChange([pos.lat, pos.lng]);
            },
          }}
          position={position}
        />
      );
    }
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
          <h3 className="text-lg font-bold mb-2">Set Your Location</h3>
          <p className="text-sm text-gray-600 mb-2">Drag the marker or click on the map to set your location. You can also use your current location.</p>
          <div className="mb-2 flex gap-2">
            <button
              className="px-3 py-1 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 text-sm"
              onClick={handleUseMyLocation}
              type="button"
            >
              Use My Location
            </button>
            <button
              className="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 text-sm"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          </div>
          <div style={{ height: 350, width: '100%' }} className="mb-4 rounded overflow-hidden">
            <MapContainer center={tempLocation} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker position={tempLocation} onChange={setTempLocation} />
            </MapContainer>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Lat: {tempLocation[0]}, Lng: {tempLocation[1]}</span>
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
              onClick={() => {
                onSave(tempLocation[0], tempLocation[1]);
                onClose();
              }}
              type="button"
            >
              Save Location
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex items-center justify-start mb-2">
            <button onClick={() => window.history.back()} className="flex items-center text-gray-600 bg-transparent hover:bg-gray-100 hover:text-primary-600 transition-colors px-4 py-2 rounded-lg text-base">
              <span className="mr-2">&larr;</span> Back to Home
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">My Profile</h1>
          <p className="text-gray-500 text-lg">Manage your account information</p>
        </div>
        {/* Profile Card */}
        <div className="w-full rounded-2xl mb-10 p-12 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-500 to-green-400 shadow-lg relative min-h-[200px]">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-4 border-white -mt-10">
                <UserCircleIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">{userData.firstName} {userData.lastName}</span>
                <span className="ml-2 px-3 py-1 rounded-full bg-white/30 text-white text-xs font-semibold flex items-center gap-1">
                  <CheckBadgeIcon className="h-4 w-4 text-white" /> Verified
                </span>
              </div>
              <span className="text-xl text-white">{userData.email}</span>
              <span className="text-white/80 text-sm">Member since 1/15/2024</span>
            </div>
          </div>
          <div className="flex flex-col items-end mt-6 md:mt-0">
            <span className="text-5xl font-bold text-white">1250</span>
            <span className="text-white/80 text-sm">Loyalty Points</span>
          </div>
          <div className="absolute left-0 bottom-0 w-full px-8 pb-4 mt-6">
            <div className="text-white text-sm mb-1">Profile Completion</div>
            <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden">
              <div className="h-4 bg-blue-700 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="text-white text-right text-xs mt-1">100%</div>
          </div>
        </div>
        {/* Tabs and Info Card */}
        <div className="w-full bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('Personal')} className={`flex-1 py-2 rounded-lg text-base font-semibold transition-colors duration-200
              ${activeTab === 'Personal' ? 'text-primary-700 border-b-4 border-primary-600 bg-white' : 'text-gray-500 bg-white hover:bg-gray-50'}`}>Personal</button>
            <button onClick={() => setActiveTab('Address')} className={`flex-1 py-2 rounded-lg text-base font-semibold transition-colors duration-200
              ${activeTab === 'Address' ? 'text-primary-700 border-b-4 border-primary-600 bg-white' : 'text-gray-500 bg-white hover:bg-gray-50'}`}>Address</button>
            <button onClick={() => setActiveTab('Orders')} className={`flex-1 py-2 rounded-lg text-base font-semibold transition-colors duration-200
              ${activeTab === 'Orders' ? 'text-primary-700 border-b-4 border-primary-600 bg-white' : 'text-gray-500 bg-white hover:bg-gray-50'}`}>Orders</button>
          </div>
          {activeTab === 'Personal' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
              {personalMessage && (
                <div className={`mb-4 p-2 rounded text-sm ${personalMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{personalMessage}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  <input type="text" value={userData.firstName} disabled={!editingPersonal} onChange={e => setUserData({ ...userData, firstName: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  <input type="text" value={userData.lastName} disabled={!editingPersonal} onChange={e => setUserData({ ...userData, lastName: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <input type="email" value={userData.email} disabled className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <input type="text" value={userData.phone} disabled={!editingPersonal} onChange={e => setUserData({ ...userData, phone: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <input type="text" value={userData.gender} disabled={!editingPersonal} onChange={e => setUserData({ ...userData, gender: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
              </div>
              {editingPersonal && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                  <input type="password" value={personalPassword} onChange={e => setPersonalPassword(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {!editingPersonal ? (
                  <button onClick={() => setEditingPersonal(true)} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">Edit</button>
                ) : (
                  <>
                    <button onClick={handlePersonalUpdate} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">Save</button>
                    <button onClick={() => { setEditingPersonal(false); setPersonalPassword(""); fetchUserProfile(); }} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'Address' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Address</h2>
              {addressMessage && (
                <div className={`mb-4 p-2 rounded text-sm ${addressMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{addressMessage}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <input type="text" value={userData.address} disabled={!editingAddress} onChange={e => setUserData({ ...userData, address: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                  <input type="text" value={userData.city} disabled={!editingAddress} onChange={e => setUserData({ ...userData, city: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <div className="flex items-center justify-between mb-2 w-full">
                  <button
                    type="button"
                    className="px-5 py-2 border border-primary-600 text-primary-600 rounded-lg bg-transparent hover:bg-primary-50 text-base font-semibold transition-colors"
                    onClick={() => setLocationModalOpen(true)}
                  >
                    Set Location on Map
                  </button>
                  <div className="flex flex-col items-end ml-6">
                    {placeName ? (
                      <span className="text-base text-gray-700 font-semibold max-w-xs text-right truncate">{placeName}</span>
                    ) : (
                      <span className="text-base text-gray-500 font-semibold">No location set yet.</span>
                    )}
                  </div>
                </div>
                <LocationModal
                  open={locationModalOpen}
                  onClose={() => setLocationModalOpen(false)}
                  onSave={async (lat, lng) => {
                    try {
                      const token = localStorage.getItem('token');
                      await axios.post(`http://localhost:8080/api/location/set?lat=${lat}&lng=${lng}`, null, { headers: { token } });
                      setUserLocation({ lat, lng });
                    } catch {}
                  }}
                  lat={userLocation?.lat}
                  lng={userLocation?.lng}
                />
              </div>
              {editingAddress && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                  <input type="password" value={addressPassword} onChange={e => setAddressPassword(e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2 bg-gray-50" />
                </div>
              )}
              <div className="mt-4 flex gap-2">
                {!editingAddress ? (
                  <button onClick={() => setEditingAddress(true)} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">Edit</button>
                ) : (
                  <>
                    <button onClick={handleAddressUpdate} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700">Save</button>
                    <button onClick={() => { setEditingAddress(false); setAddressPassword(""); fetchUserProfile(); }} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'Orders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">{orders.length} orders</span>
              </div>
              {ordersLoading ? (
                <div className="text-center text-gray-500 py-8">Loading orders...</div>
              ) : ordersError ? (
                <div className="text-center text-red-500 py-8">{ordersError}</div>
              ) : orders.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No orders found.</div>
              ) : (
                orders.map((order) => {
                  const details = orderDetails[order.id] || [];
                  const status = (order.status || '').toUpperCase();
                  const statusMap = {
                    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
                    SHIPPED: { label: 'Shipped', color: 'bg-blue-100 text-blue-700' },
                    PROCESSING: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
                    PENDING: { label: 'Pending', color: 'bg-orange-100 text-orange-700' },
                    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
                  };
                  const statusChip = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
                  const orderDate = order.id && order.id.split('-')[1] ? order.id.split('-')[1] : '';
                  // Fake date for demo, use real date if available
                  const date = order.date || '1/15/2024';
                  // Fake tracking for demo
                  const tracking = order.tracking || 'TRK' + order.id.slice(-8);
                  // Estimated delivery logic (demo)
                  let estimatedDelivery = '';
                  if (status !== 'DELIVERED') {
                    estimatedDelivery = 'Estimated delivery: ' + (order.estimatedDelivery || '1/25/2024');
                  }
                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-gray-800">Order #{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusChip.color}`}>{statusChip.label}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/orders/${order.id}`)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2"><span role="img" aria-label="View">👁️</span> View Details</button>
                          <button onClick={() => navigate(`/orders/${order.id}`)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold flex items-center gap-2"><span role="img" aria-label="Review">⭐</span> Review</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-gray-500 text-sm mb-2">
                        <span>{date}</span>
                        <span>🛒 {details.reduce((sum, d) => sum + d.quantity, 0)} items</span>
                        <span className="text-green-600 font-bold text-base">${order.totalPrice.toFixed(2)}</span>
                        <span>{tracking}</span>
                      </div>
                      {estimatedDelivery && (
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded mb-2 text-sm flex items-center gap-2">
                          <span role="img" aria-label="Delivery">📦</span> {estimatedDelivery}
                        </div>
                      )}
                      <div className="mb-2">
                        {details.map((item, idx) => (
                          <div key={item.drugId} className="flex justify-between text-gray-700 text-sm">
                            <span>{item.quantity}x {item.drugName}</span>
                            <span>${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        {/* Change Password Section */}
        {activeTab === 'Personal' && (
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
        )}
      </div>
    </div>
  );
};

export default Profile; 