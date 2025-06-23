import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const OrdersManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/requests/get-all', {
        headers: { token }
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage('Failed to load requests');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const request = requests.find(r => r.id === requestId);
      const updatedRequest = { ...request, status: newStatus };

      await axios.post('http://localhost:8080/api/requests/update-status', updatedRequest, {
        headers: { token }
      });

      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));

      setMessage('Status updated successfully');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Failed to update status');
      setMessageType('error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5" />;
      case 'PREPARING':
        return <ArrowPathIcon className="h-5 w-5" />;
      case 'READY':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'SHIPPED':
        return <TruckIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders Management</h1>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            messageType === 'success' ? 'bg-success-50 border-success-100' : 'bg-error-50 border-error-100'
          } border`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-error-600 mr-2" />
              )}
              <p className={messageType === 'success' ? 'text-success-600' : 'text-error-600'}>
                {message}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Order #{request.orderId}</h3>
                  <p className="text-sm text-gray-500">
                    Customer: {request.customer.firstName} {request.customer.lastName}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-2 font-medium">{request.status}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                  {request.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.drugId}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-primary-600">${item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Customer Information:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {request.customer.address}, {request.customer.city}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {request.customer.phone}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                {request.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'PREPARING')}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Start Preparing
                  </button>
                )}
                {request.status === 'PREPARING' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'READY')}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Mark as Ready
                  </button>
                )}
                {request.status === 'READY' && (
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'SHIPPED')}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement; 