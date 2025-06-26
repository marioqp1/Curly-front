import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  BuildingOffice2Icon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue for leaflet in React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditMap, setShowEditMap] = useState(false);
  const [editMapModalOpen, setEditMapModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [newBranch, setNewBranch] = useState({
    branchName: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    branchState: true,
    zip: '',
    lat: null,
    lng: null
  });
  const [tempLocation, setTempLocation] = useState({ lat: null, lng: null });
  const markerRef = useRef(null);
  const [addMapModalOpen, setAddMapModalOpen] = useState(false);
  const [editPlaceName, setEditPlaceName] = useState('');
  const [addPlaceName, setAddPlaceName] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyResponse = await axios.get('http://localhost:8080/api/company/get/id', {
        headers: { token }
      });
      
      if (companyResponse.data.status) {
        const companyId = companyResponse.data.data.companyId;
        const response = await axios.get(
          `http://localhost:8080/api/company/get/${companyId}/branches`,
          { headers: { token } }
        );
        
        if (response.data.status) {
          setBranches(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const companyResponse = await axios.get('http://localhost:8080/api/company/get/id', {
        headers: { token }
      });
      
      if (companyResponse.data.status) {
        const companyId = companyResponse.data.data.companyId;
        const payload = {
          ...newBranch,
          branchState: newBranch.lat && newBranch.lng ? true : false
        };
        const response = await axios.post(
          `http://localhost:8080/api/branches?companyId=${companyId}`,
          payload,
          { headers: { token } }
        );
        
        if (response.data.status) {
          toast.success('Branch added successfully');
          setShowAddModal(false);
          setNewBranch({
            branchName: '',
            address: '',
            city: '',
            phone: '',
            email: '',
            branchState: true,
            zip: '',
            lat: null,
            lng: null
          });
          fetchBranches();
        }
      }
    } catch (error) {
      console.error('Error adding branch:', error);
      toast.error('Failed to add branch');
    }
  };

  const handleEditBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const companyResponse = await axios.get('http://localhost:8080/api/company/get/id', {
        headers: { token }
      });
      
      if (companyResponse.data.status) {
        const companyId = companyResponse.data.data.companyId;
        const payload = {
          ...selectedBranch,
          branchState: selectedBranch.lat && selectedBranch.lng ? true : false
        };
        const response = await axios.put(
          `http://localhost:8080/api/branches/${selectedBranch.branchId}?companyId=${companyId}`,
          payload,
          { headers: { token } }
        );
        
        if (response.data.status) {
          toast.success('Branch updated successfully');
          setShowEditModal(false);
          fetchBranches();
        }
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      toast.error('Failed to update branch');
    }
  };

  const handleDeleteBranch = async (branchId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:8080/api/branches/${branchId}`,
        { headers: { token } }
      );
      
      if (response.data.status) {
        toast.success('Branch deleted successfully');
        fetchBranches();
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
    }
  };

  // Helper for geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTempLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => alert('Could not get your location')
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  // Helper to ensure valid coordinates
  const getValidLatLng = (lat, lng) => [
    typeof lat === 'number' && !isNaN(lat) ? lat : 30.0444,
    typeof lng === 'number' && !isNaN(lng) ? lng : 31.2357
  ];

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

  function MapModal({ open, onClose, onSave, lat, lng }) {
    // Always call hooks first!
    const [tempLocation, setTempLocation] = useState(getValidLatLng(lat, lng));
    useEffect(() => {
      setTempLocation(getValidLatLng(lat, lng));
    }, [lat, lng, open]);

    if (!open) return null;

    // Helper for geolocation inside modal
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
          <h3 className="text-lg font-bold mb-2">Set Branch Location</h3>
          <p className="text-sm text-gray-600 mb-2">Drag the marker or click on the map to set the branch location. You can also use your current location.</p>
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

  // Fetch place name for edit modal
  useEffect(() => {
    const fetchPlaceName = async (lat, lng) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setEditPlaceName(data.display_name || '');
      } catch {
        setEditPlaceName('');
      }
    };
    if (showEditModal && selectedBranch && selectedBranch.lat && selectedBranch.lng) {
      fetchPlaceName(selectedBranch.lat, selectedBranch.lng);
    } else {
      setEditPlaceName('');
    }
  }, [showEditModal, selectedBranch]);

  // Fetch place name for add modal
  useEffect(() => {
    const fetchPlaceName = async (lat, lng) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setAddPlaceName(data.display_name || '');
      } catch {
        setAddPlaceName('');
      }
    };
    if (showAddModal && newBranch.lat && newBranch.lng) {
      fetchPlaceName(newBranch.lat, newBranch.lng);
    } else {
      setAddPlaceName('');
    }
  }, [showAddModal, newBranch.lat, newBranch.lng]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Branches</h1>
              <p className="mt-2 text-sm text-gray-600">
                Add, edit, or remove pharmacy branches
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={fetchBranches}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></span>
                ) : (
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                )}
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Branch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.branchId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg">
                          <BuildingOffice2Icon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {branch.branchName}
                        </h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {branch.address}, {branch.city}, {branch.zip}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {branch.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {branch.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              branch.branchState 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {branch.branchState ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors duration-200 bg-transparent"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch.branchId)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors duration-200 bg-transparent"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {branches.length === 0 && (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No branches</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new branch.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Branch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Branch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border border-gray-300 rounded-full p-1 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={newBranch.branchName}
                  onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  required
                  value={newBranch.zip}
                  onChange={(e) => setNewBranch({ ...newBranch, zip: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newBranch.email}
                  onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="branch@example.com"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="px-5 py-2 border border-primary-600 text-primary-600 rounded-lg bg-transparent hover:bg-primary-50 text-base font-semibold transition-colors"
                  onClick={() => {
                    setAddMapModalOpen(true);
                    setTempLocation({ lat: newBranch.lat, lng: newBranch.lng });
                  }}
                >
                  Set Location on Map
                </button>
                <div className="text-base text-gray-700 font-semibold max-w-xs text-right truncate mt-1">
                  {addPlaceName ? addPlaceName : 'No location set yet.'}
                </div>
                {!newBranch.lat || !newBranch.lng ? (
                  <div className="bg-yellow-100 text-yellow-800 rounded p-2 mt-2 text-sm font-medium">
                    This branch will be <b>deactivated</b> and cannot receive orders until a location is set.
                  </div>
                ) : null}
                <MapModal
                  open={addMapModalOpen}
                  onClose={() => setAddMapModalOpen(false)}
                  onSave={(lat, lng) => setNewBranch({ ...newBranch, lat, lng })}
                  lat={newBranch.lat}
                  lng={newBranch.lng}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Add Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Branch</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border border-gray-300 rounded-full p-1 transition-colors absolute top-4 right-4"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditBranch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedBranch.branchName}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, branchName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={selectedBranch.address}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, address: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={selectedBranch.city}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, city: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={selectedBranch.phone}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={selectedBranch.email}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="branch@example.com"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="px-5 py-2 border border-primary-600 text-primary-600 rounded-lg bg-transparent hover:bg-primary-50 text-base font-semibold transition-colors"
                  onClick={() => {
                    setEditMapModalOpen(true);
                    setTempLocation({ lat: selectedBranch.lat, lng: selectedBranch.lng });
                  }}
                >
                  Set Location on Map
                </button>
                <div className="text-base text-gray-700 font-semibold max-w-xs text-right truncate mt-1">
                  {editPlaceName ? editPlaceName : 'No location set yet.'}
                </div>
                {!selectedBranch.lat || !selectedBranch.lng ? (
                  <div className="bg-yellow-100 text-yellow-800 rounded p-2 mt-2 text-sm font-medium">
                    This branch will be <b>deactivated</b> and cannot receive orders until a location is set.
                  </div>
                ) : null}
                <MapModal
                  open={editMapModalOpen}
                  onClose={() => setEditMapModalOpen(false)}
                  onSave={(lat, lng) => setSelectedBranch({ ...selectedBranch, lat, lng })}
                  lat={selectedBranch.lat}
                  lng={selectedBranch.lng}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBranches;
