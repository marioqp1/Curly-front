import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtService } from '../../services/jwtService';
import { toast } from 'react-toastify';
import { 
  BuildingOffice2Icon, 
  UserPlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    gender: 'MALE',
    role: 'ROLE_EMPLOYEE'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBranches, setExpandedBranches] = useState([]);

  useEffect(() => {
    fetchCompanyDetails();
    fetchBranchesWithEmployees();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/company/get/id', {
        headers: { token }
      });
      if (response.data.status) {
        setCompanyDetails(response.data.data);
      }
    } catch (error) {
      // Optionally handle error
    }
  };

  const fetchBranchesWithEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch branches with employees using the new endpoint
      const response = await axios.get('http://localhost:8080/api/branches/employees', {
        headers: { token }
      });
      if (response.data.status) {
        setBranches(response.data.data);
      } else {
        toast.error('Failed to fetch branches and employees');
      }
    } catch (error) {
      toast.error('Failed to fetch branches and employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !selectedBranch.branchId) {
      toast.error('No branch selected');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/signup/company/employee?branchId=${selectedBranch.branchId}`,
        newEmployee,
        {
          headers: { token }
        }
      );
      if (response.data.success) {
        toast.success('Employee added successfully');
        setShowAddEmployeeModal(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          city: '',
          gender: 'MALE',
          role: 'ROLE_EMPLOYEE'
        });
        // Refresh branches to get updated employee list
        fetchBranchesWithEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleOpenAddEmployeeModal = (branch) => {
    if (!branch || !branch.branchId) {
      toast.error('Invalid branch selected');
      return;
    }
    setSelectedBranch(branch);
    setShowAddEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8080/api/user/delete/employee/${employeeId}`, {
        headers: { token }
      });
      if (response.data.status) {
        toast.success('Employee deleted successfully');
        fetchBranchesWithEmployees();
      } else {
        toast.error('Failed to delete employee');
      }
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const filteredBranches = branches.filter(branch => {
    const term = searchTerm.toLowerCase();
    return (
      branch.branchName?.toLowerCase().includes(term) ||
      branch.address?.toLowerCase().includes(term) ||
      branch.city?.toLowerCase().includes(term)
    );
  });

  const toggleBranch = (branchId) => {
    setExpandedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {companyDetails && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 border border-blue-200 rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 transition-transform duration-200 hover:scale-[1.01]">
            {companyDetails.logoUrl ? (
              <img src={companyDetails.logoUrl} alt={companyDetails.name} className="h-28 w-28 rounded-full shadow-lg ring-4 ring-blue-200 object-cover" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-blue-400 flex items-center justify-center shadow-lg ring-4 ring-blue-200">
                <span className="text-4xl font-bold text-white">
                  {companyDetails.name?.split(' ').map(w => w[0]).join('').slice(0,2) || '?'}
                </span>
              </div>
            )}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 md:mb-0">{companyDetails.name}</h1>
              </div>
              <hr className="my-4 border-blue-100" />
              <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-200">
                    <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                  </span>
                  <span className="text-lg text-gray-700 font-medium break-all">{companyDetails.companyEmail}</span>
                </div>
                <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-200">
                    <PhoneIcon className="h-6 w-6 text-blue-600" />
                  </span>
                  <span className="text-lg text-gray-700 font-medium">{companyDetails.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Branch Management</h2>
      <div className="max-w-4xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search branches by name, address, or city..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg"
        />
      </div>

      {/* Branches Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBranches.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <BuildingOffice2Icon className="mx-auto h-16 w-16 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Branches Found</h3>
            <p className="text-gray-500 mb-6">Try a different search or add a new branch.</p>
            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <UserPlusIcon className="h-6 w-6 mr-2" />
              Add Branch
            </button>
          </div>
        ) : (
          filteredBranches.map((branch) => (
            <div
              key={branch.branchId}
              className="bg-white rounded-2xl shadow-lg p-8 hover:scale-[1.02] transition-transform duration-200 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <BuildingOffice2Icon className="h-10 w-10 text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{branch.branchName}</h2>
                    <div className="flex items-center text-gray-500 mt-1">
                      <MapPinIcon className="h-5 w-5 mr-1" />
                      <span>{branch.address}, {branch.city}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                      <PhoneIcon className="h-5 w-5 mr-1" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => handleOpenAddEmployeeModal(branch)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow transition-all"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Add Employee
                  </button>
                  <button
                    onClick={() => toggleBranch(branch.branchId)}
                    className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${expandedBranches.includes(branch.branchId) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                  >
                    {expandedBranches.includes(branch.branchId) ? 'Hide Employees' : 'View Employees'}
                  </button>
                </div>
              </div>
              <hr className="my-4 border-blue-100" />
              {expandedBranches.includes(branch.branchId) && (
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Employees</h3>
                  {(!branch.employees || branch.employees.length === 0) ? (
                    <div className="text-center py-8">
                      <UserGroupIcon className="mx-auto h-10 w-10 text-blue-200 mb-2" />
                      <p className="text-gray-500">No employees assigned to this branch yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {branch.employees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-xl shadow-sm hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow">
                              <span className="text-white font-bold text-lg">
                                {employee.firstName?.[0] || ''}{employee.lastName?.[0] || ''}
                              </span>
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{employee.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this employee?')) {
                                handleDeleteEmployee(employee.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="mb-6 text-center">
              <UserPlusIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Add Employee to {selectedBranch.branchName}</h2>
              <p className="text-gray-500">Fill in the details below to add a new employee.</p>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.city}
                    onChange={(e) => setNewEmployee({ ...newEmployee, city: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    required
                    value={newEmployee.gender}
                    onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement; 