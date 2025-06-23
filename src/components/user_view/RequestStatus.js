import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socketService } from '../../services/socketService';
import { jwtService } from '../../services/jwtService';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = jwtService.extractUserId(token);
    
    fetchUserRequests();
    setupWebSocket(userId);

    return () => {
      socketService.unsubscribeFromClientRequests(userId);
    };
  }, []);

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8080/api/requests/user',
        { headers: { token } }
      );
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage('Failed to fetch requests');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = (userId) => {
    const socket = socketService.connect();
    socketService.subscribeToClientRequests(userId, (update) => {
      setRequests(prevRequests => {
        const index = prevRequests.findIndex(req => req.id === update.id);
        if (index !== -1) {
          const newRequests = [...prevRequests];
          newRequests[index] = { ...newRequests[index], ...update };
          return newRequests;
        }
        return prevRequests;
      });
    });
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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
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
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Requests</h1>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{request.orderId}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Branch: {request.branchName}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full flex items-center ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-2">{request.status}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {request.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.drugName}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-gray-700">
                Total: ${request.totalPriceOfRequest.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestStatus; 