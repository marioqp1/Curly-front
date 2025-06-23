import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SharedRequestList from '../shared/SharedRequestList';
import { BuildingOffice2Icon, ChevronRightIcon, InboxIcon, PhoneIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getCompanyBranches, getCompanyById, getBranchRequests } from './Apis';

const BranchRequests = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        // First, get the company details for the logged-in user
        const companyResponse = await getCompanyById();
        const company = companyResponse.data.data;

        if (!company || !company.companyId) {
          toast.error("Could not retrieve company information.");
          setLoadingBranches(false);
          return;
        }

        const companyId = company.companyId;

        // Now, fetch the branches for that company
        const branchesResponse = await getCompanyBranches(companyId);
        setBranches(branchesResponse.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch branches.');
        console.error('Error fetching branches:', error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    try {
      const response = await getBranchRequests(branch.branchId);
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error(`Failed to fetch requests for ${branch.branchName}.`);
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(prevRequests =>
      prevRequests.map(req => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
  };

  const filteredRequests = requests.filter(request => {
    const customerName = request.customer ? `${request.customer.firstName} ${request.customer.lastName}`.toLowerCase() : '';
    const statusMatch = statusFilter === 'All' || request.status === statusFilter.toUpperCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      statusMatch && (
        customerName.includes(searchTermLower) ||
        (request.orderId && request.orderId.toLowerCase().includes(searchTermLower)) ||
        (request.id && typeof request.id === 'string' && request.id.toLowerCase().includes(searchTermLower))
      )
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Branch Requests</h1>

        {/* Branch Selection */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select a Branch</h2>
          {loadingBranches ? (
            <p>Loading branches...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {branches.map(branch => {
                const isSelected = selectedBranch?.branchId === branch.branchId;
                return (
                  <button
                    key={branch.branchId}
                    onClick={() => handleSelectBranch(branch)}
                    className={`p-6 text-left rounded-lg shadow-md transition-all transform 
                      ${isSelected
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white hover:shadow-lg hover:scale-105'}`
                    }
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-lg pr-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{branch.branchName}</h3>
                      <BuildingOffice2Icon className={`h-8 w-8 flex-shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div className={`mt-4 pt-4 border-t ${isSelected ? 'border-blue-400' : 'border-gray-200'}`}>
                      <p className={`text-sm flex items-center ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                        <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </p>
                      <p className={`text-sm flex items-center mt-2 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                        <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{branch.email}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests Display */}
        {selectedBranch && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
              <InboxIcon className="h-6 w-6 mr-2" />
              Showing Requests for: <span className="text-blue-600 font-bold ml-2">{selectedBranch.branchName}</span>
            </h2>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Status Filter */}
                <div className="flex justify-center gap-2">
                  {['All', 'Pending', 'Ready', 'Shipped'].map(option => (
                    <button
                      key={option}
                      onClick={() => setStatusFilter(option)}
                      className={`px-4 py-1 rounded-full border text-sm font-semibold transition-all shadow-sm focus:outline-none
                        ${statusFilter === option
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {/* Search Bar */}
                <div className="relative w-full md:w-auto">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by customer, order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <SharedRequestList 
                requests={filteredRequests} 
                loading={loading} 
                onStatusChange={handleStatusChange}
                updateApiEndpoint="http://localhost:8080/api/request/update-status/by-company"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchRequests; 