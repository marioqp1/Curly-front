import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaHourglassHalf, FaSyncAlt, FaEye, FaCreditCard, FaMoneyBillWave, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  PENDING: 'bg-orange-100 text-orange-800',
  READY: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};
const statusBarColors = {
  PENDING: 'bg-orange-400',
  READY: 'bg-purple-500',
  SHIPPED: 'bg-green-500',
  CANCELLED: 'bg-red-400',
};
const statusLabels = {
  PENDING: 'Pending',
  READY: 'Ready',
  SHIPPED: 'Shipped',
  CANCELLED: 'Cancelled',
};
const paymentIcons = {
  Visa: <FaCreditCard className="inline mr-1" />,
  Mastercard: <FaCreditCard className="inline mr-1" />,
  'Cash on Delivery': <FaMoneyBillWave className="inline mr-1" />,
  'Apple Pay': <FaCreditCard className="inline mr-1" />,
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  // Stats
  const totalOrders = orders.length;
  const shipped = orders.filter(o => (o.status || '').toUpperCase() === 'SHIPPED').length;
  const ready = orders.filter(o => (o.status || '').toUpperCase() === 'READY').length;
  const pending = orders.filter(o => (o.status || '').toUpperCase() === 'PENDING').length;
  const cancelled = orders.filter(o => (o.status || '').toUpperCase() === 'CANCELLED').length;

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    return (
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order.items && order.items.some(item => item.name.toLowerCase().includes(search.toLowerCase())))
    );
  });

  // In the Orders component, add a function to reload orders
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:8080/api/orders/user', { headers: { token } })
      .then(response => setOrders(response.data.data || []))
      .catch(() => setError('Failed to fetch orders.'))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg font-semibold">Loading your orders...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              className="text-gray-500 bg-transparent hover:bg-gray-100 hover:text-blue-600 focus:outline-none p-2 rounded-lg transition-colors"
              type="button"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-0 text-gray-900">My Orders</h1>
              <p className="text-gray-500 text-sm">Track and manage your medication orders</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none hover:bg-gray-100 text-gray-700 font-medium shadow-none focus:outline-none"
              type="button"
              onClick={handleRefresh}
            >
              <FaSyncAlt className="text-base" /> Refresh
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border-none hover:bg-blue-50 text-blue-700 font-semibold shadow-none focus:outline-none"
              type="button"
              onClick={() => navigate('/')}
            >
              <FaShoppingCart className="text-base" /> Shop Again
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-600">{totalOrders}</span>
            <span className="text-xs text-gray-500 mt-1">Total Orders</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{shipped}</span>
            <span className="text-xs text-gray-500 mt-1">Shipped</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-purple-600">{ready}</span>
            <span className="text-xs text-gray-500 mt-1">Ready</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-orange-600">{pending}</span>
            <span className="text-xs text-gray-500 mt-1">Pending</span>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-red-600">{cancelled}</span>
            <span className="text-xs text-gray-500 mt-1">Cancelled</span>
          </div>
        </div>
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <input
            type="text"
            placeholder="Search by order ID or product name..."
            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Orders Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredOrders.length === 0 ? (
            <div className="col-span-2 text-center text-gray-400 py-8">No orders found.</div>
          ) : (
            filteredOrders.map(order => {
              const status = (order.status || '').toUpperCase();
              let progress = 0;
              if (status === 'PENDING') progress = 25;
              else if (status === 'READY') progress = 75;
              else if (status === 'SHIPPED') progress = 100;
              else if (status === 'CANCELLED') progress = 0;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 border border-gray-100 transition-all hover:shadow-lg hover:border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[status] || status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>{order.date || ''}</span>
                    <span className="flex items-center">{paymentIcons[order.paymentMethod] || null}{order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-700">${order.totalPrice}</span>
                    <span className="text-xs text-gray-500">{order.items?.length || 0} items</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div className={`h-2 rounded-full transition-all duration-500 ${statusBarColors[status] || 'bg-gray-400'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Order Progress</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="flex items-center gap-2 mb-2">
                    {order.items && order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-400">{item.image ? <img src={item.image} alt={item.name} className="h-8 w-8 object-cover rounded-md" /> : item.name[0]}</div>
                        <span className="text-gray-700 font-medium text-sm">{item.name}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 2 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {/* Delivery/Tracking/Status Info */}
                  {status === 'Delivered' && order.deliveredDate && (
                    <div className="text-green-600 text-xs">Delivered on {order.deliveredDate}</div>
                  )}
                  {status === 'Pending' && order.estimatedDelivery && (
                    <div className="text-yellow-600 text-xs">Estimated delivery: {order.estimatedDelivery}</div>
                  )}
                  {status === 'Shipped' && order.tracking && (
                    <div className="text-purple-600 text-xs">Tracking: {order.tracking}</div>
                  )}
                  {status === 'Cancelled' && order.cancelReason && (
                    <div className="text-red-600 text-xs">Cancelled: {order.cancelReason}</div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <FaEye />
                      View Details
                    </button>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 shadow-sm focus:outline-none"
                        type="button"
                        tabIndex={-1}
                        disabled
                      >
                        <span role="img" aria-label="Invoice">🧾</span> Invoice
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 shadow-sm focus:outline-none"
                        type="button"
                        tabIndex={-1}
                        disabled
                      >
                        <span role="img" aria-label="Receipt">🧾</span> Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 