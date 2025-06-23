import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaCreditCard, FaBoxOpen, FaShippingFast, FaCheckCircle, FaHourglassHalf, FaFilter, FaSyncAlt, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-gray-200 text-gray-700',
};
const statusIcons = {
  PENDING: <FaHourglassHalf className="inline mr-1" />,
  PREPARING: <FaBoxOpen className="inline mr-1" />,
  READY: <FaCheckCircle className="inline mr-1" />,
  SHIPPED: <FaShippingFast className="inline mr-1" />,
};

const paymentIcons = {
  Cash: <FaMoneyBillWave className="inline mr-1" />,
  Visa: <FaCreditCard className="inline mr-1" />,
};

const statusOptions = ['All', 'PENDING', 'PREPARING', 'READY', 'SHIPPED'];
const paymentOptions = ['All', 'Cash', 'Visa'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8080/api/orders/user', {
          headers: { token },
        });
        setOrders(response.data.data || []);
      } catch (err) {
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'All' || order.status === statusFilter;
    const paymentMatch = paymentFilter === 'All' || order.paymentMethod === paymentFilter;
    return statusMatch && paymentMatch;
  });

  const resetFilters = () => {
    setStatusFilter('All');
    setPaymentFilter('All');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg font-semibold">Loading your orders...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-600 font-semibold">{error}</div>;
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <FaBoxOpen className="text-6xl mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="mb-4">You haven't placed any orders yet. Start shopping now!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">Your Orders</h2>
      {/* Modern Filters Card */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between border border-gray-100">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaFilter className="text-blue-500 text-lg" />
          <span className="font-semibold text-gray-700">Filter Orders:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Status</span>
            <select
              className="rounded-full px-4 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm bg-gray-50 hover:bg-blue-50 cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Statuses' : option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Payment</span>
            <select
              className="rounded-full px-4 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-sm bg-gray-50 hover:bg-blue-50 cursor-pointer"
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              {paymentOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Methods' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition text-sm shadow-sm"
        >
          <FaSyncAlt />
          Reset
        </button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 text-center text-gray-400 py-8">No orders match your filter.</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 border border-gray-100 transition-all hover:shadow-lg hover:border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Order ID:</span>
                <span className="font-mono text-xs text-gray-700">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="text-lg font-bold text-blue-600">${order.totalPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="flex items-center font-medium">
                  {paymentIcons[order.paymentMethod] || null}
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                  {statusIcons[order.status] || null}
                  {order.status}
                </span>
              </div>
              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <FaEye />
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders; 