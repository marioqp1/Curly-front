import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  InboxIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import SharedRequestList from '../shared/SharedRequestList';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-gray-200 text-gray-700',
};

const RequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({}); // { [requestId]: { customer: bool, items: bool } }
  const [drugNames, setDrugNames] = useState({}); // { drugId: drugName }
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/request/get-all', {
        headers: { token }
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch drug names for all unique drugIds in items
  useEffect(() => {
    const uniqueDrugIds = new Set();
    requests.forEach(req => {
      if (req.items) {
        req.items.forEach(item => uniqueDrugIds.add(item.drugId));
      }
    });
    const idsToFetch = Array.from(uniqueDrugIds).filter(id => !(id in drugNames));
    if (idsToFetch.length === 0) return;
    const token = localStorage.getItem('token');
    const fetchAll = async () => {
      const newDrugNames = {};
      await Promise.all(idsToFetch.map(async (id) => {
        try {
          const res = await axios.get(`http://localhost:8080/api/drugs/${id}`, { headers: { token } });
          newDrugNames[id] = res.data.data.drugName || id;
        } catch {
          newDrugNames[id] = id;
        }
      }));
      setDrugNames(prev => ({ ...prev, ...newDrugNames }));
    };
    fetchAll();
  }, [requests]);

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
  };
  
  // Search by customer name, order ID, or status
  const filteredRequests = requests.filter(request => {
    const customerName = request.customer ? `${request.customer.firstName} ${request.customer.lastName}`.toLowerCase() : '';
    const statusMatch = statusFilter === 'All' || request.status === statusFilter.toUpperCase();
    return (
      statusMatch && (
        customerName.includes(searchTerm.toLowerCase()) ||
        (request.orderId && request.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.status && request.status.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  })
  // Sort: PENDING, READY first, then SHIPPED, CANCELED
  .sort((a, b) => {
    const order = { PENDING: 1, READY: 2, SHIPPED: 3, CANCELED: 4 };
    return (order[a.status] || 99) - (order[b.status] || 99);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <ClipboardDocumentListIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Requests Management</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage and process incoming branch requests</p>
        </div>

        {/* Modern Status Filter */}
        <div className="flex justify-center gap-2 mb-6">
          {['All', 'Pending', 'Ready', 'Shipped', 'Canceled'].map(option => (
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
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <InboxIcon className="h-6 w-6 mr-2 text-primary-500" />
              Requests ({requests.length})
            </h2>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, order ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
            <SharedRequestList 
                requests={filteredRequests} 
                loading={loading} 
                onStatusChange={handleStatusChange} 
            />
        </div>
      </div>
    </div>
  );
};

export default RequestsManagement; 