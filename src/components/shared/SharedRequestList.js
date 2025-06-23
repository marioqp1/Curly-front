import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InboxIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-gray-200 text-gray-700',
};

const SharedRequestList = ({ requests, loading, readOnly = false, onStatusChange, updateApiEndpoint = 'http://localhost:8080/api/request/update-status' }) => {
  const [expanded, setExpanded] = useState({});
  const [drugNames, setDrugNames] = useState({});

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

  const handleUpdateRequestStatus = async (request, newStatus) => {
    if (readOnly) return;
    try {
      const token = localStorage.getItem('token');
      const updatedRequest = { ...request, status: newStatus };
      await axios.post(
        updateApiEndpoint,
        updatedRequest,
        { headers: { token } }
      );
      toast.success(`Request status updated to ${newStatus}`);
      if(onStatusChange) {
        onStatusChange(request.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const toggleSection = (requestId, section) => {
    setExpanded(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [section]: !prev[requestId]?.[section]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <ArrowPathIcon className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <InboxIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requests Found</h3>
        <p className="text-gray-500">There are no requests matching the current criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map(request => (
        <div key={request.id} className="bg-gray-50 rounded-xl p-8 min-h-[260px] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm text-gray-500">ID: {request.id}</span>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
              {request.status}
            </span>
          </div>
          <div className="mb-2 text-base text-gray-700 font-semibold">Order ID: <span className="font-mono text-blue-700">{request.orderId}</span></div>
          <button
            className="flex items-center gap-1 text-blue-600 hover:underline text-sm mb-1 focus:outline-none"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => toggleSection(request.id, 'customer')}
          >
            {expanded[request.id]?.customer ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            {expanded[request.id]?.customer ? 'Hide Customer Info' : 'Show Customer Info'}
          </button>
          {expanded[request.id]?.customer && request.customer && (
            <div className="mb-2 text-sm text-gray-600 bg-blue-50 rounded p-3">
              <div><span className="font-semibold text-gray-800">Customer:</span> {request.customer.firstName} {request.customer.lastName}</div>
              <div><span className="font-semibold text-gray-800">Phone:</span> {request.customer.phone}</div>
              <div><span className="font-semibold text-gray-800">Address:</span> {request.customer.address}, {request.customer.city}</div>
            </div>
          )}
          <button
            className="flex items-center gap-1 text-blue-600 hover:underline text-sm mb-2 focus:outline-none"
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => toggleSection(request.id, 'items')}
          >
            {expanded[request.id]?.items ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            {expanded[request.id]?.items ? 'Hide Requested Drugs' : 'Show Requested Drugs'}
          </button>
          {expanded[request.id]?.items && (
            <div className="mb-4 bg-blue-50 rounded p-3">
              <div className="font-semibold text-gray-700 mb-1 text-sm">Items:</div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {request.items && request.items.length > 0 ? request.items.map(item => (
                  <li key={item.id}>
                    Drug: <span className="font-semibold">{drugNames[item.drugId] || 'Loading...'}</span> | Qty: <span className="font-semibold">{item.quantity}</span> | Price: <span className="font-semibold">${item.price}</span>
                  </li>
                )) : <li>No items</li>}
              </ul>
            </div>
          )}
          {!readOnly && (
            <div className="mt-auto">
              {request.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateRequestStatus(request, 'READY')}
                  className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm mt-3"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Mark as Ready
                </button>
              )}
              {request.status === 'READY' && (
                <button
                  onClick={() => handleUpdateRequestStatus(request, 'SHIPPED')}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold shadow-sm mt-3"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Mark as Shipped
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SharedRequestList; 