import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socketService } from '../../services/socketService';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchOrder();
    // Connect to WebSocket
    socketService.connect();
    // Subscribe to order updates
    socketService.subscribeToOrder(orderId, handleStatusUpdate);

    return () => {
      // Cleanup: unsubscribe and disconnect
      socketService.unsubscribeFromOrder(orderId);
      socketService.disconnect();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [orderResponse, detailsResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/orders/${orderId}`, {
          headers: { token }
        }),
        axios.get('http://localhost:8080/api/orders/details', {
          headers: { token },
          params: { orderId }
        })
      ]);
      
      setOrder(orderResponse.data.data);
      setOrderDetails(detailsResponse.data.data || []);

    } catch (error) {
      console.error('Error fetching order:', error);
      setMessage('Failed to load order details');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      status: newStatus
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'READY':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'SHIPPED':
        return <TruckIcon className="h-5 w-5" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Your order has been received and is waiting to be processed.';
      case 'READY':
        return 'Your order is ready for pickup or delivery.';
      case 'SHIPPED':
        return 'Your order has been shipped and is on its way.';
      default:
        return 'Unknown status';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Order Not Found</h3>
          <p className="text-gray-500">The requested order could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Status</h1>
            <p className="text-gray-500">Order #{order.id}</p>
          </div>

          {/* Status Display */}
          <div className="mb-8">
            <div className={`px-6 py-4 rounded-xl flex items-center justify-center ${getStatusColor(order.status)} mb-4`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 text-lg font-semibold">{order.status}</span>
            </div>
            <p className="text-center text-gray-600">{getStatusMessage(order.status)}</p>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Details</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-primary-600">${order.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              </div>

              {/* Items in Order */}
              {orderDetails.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h4 className="text-md font-semibold text-gray-700 mb-3">Items Ordered</h4>
                  <ul className="space-y-2">
                    {orderDetails.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm pb-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-800">{item.drugName}</span>
                        <span className="font-bold text-gray-600">x {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Progress</h3>
              <div className="space-y-4">
                {['PENDING', 'READY', 'SHIPPED'].map((status) => (
                  <div
                    key={status}
                    className={`flex items-center ${
                      order.status === status ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      order.status === status ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(status)}
                    </div>
                    <span className="font-medium">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus; 