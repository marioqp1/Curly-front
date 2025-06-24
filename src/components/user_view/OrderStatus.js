import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { socketService } from '../../services/socketService';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  HomeIcon,
  DocumentArrowDownIcon,
  ReceiptPercentIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  TruckIcon as TruckSolidIcon,
} from '@heroicons/react/24/outline';

const statusMap = {
  PENDING: {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    chip: 'bg-orange-200 text-orange-800',
    label: 'Pending',
    progress: 25,
  },
  READY: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    chip: 'bg-purple-200 text-purple-800',
    label: 'Ready',
    progress: 67,
  },
  SHIPPED: {
    color: 'bg-green-100 text-green-800 border-green-300',
    chip: 'bg-green-200 text-green-800',
    label: 'Shipped',
    progress: 100,
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800 border-red-300',
    chip: 'bg-red-200 text-red-800',
    label: 'Cancelled',
    progress: 0,
  },
};

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchOrder();
    fetchUser();
    return () => {
      // socketService.unsubscribeFromOrder(orderId);
      // socketService.disconnect();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const [orderResponse, detailsResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/orders/${orderId}`, { headers: { token } }),
        axios.get('http://localhost:8080/api/orders/details', { headers: { token }, params: { orderId } })
      ]);
      setOrder(orderResponse.data.data);
      setOrderDetails(detailsResponse.data.data || []);
    } catch (error) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/user/details', { headers: { token } });
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
  };

  // Calculate static expected delivery: today + 1 hour
  const now = new Date();
  const deliveryDate = new Date(now.getTime() + 60 * 60 * 1000);
  const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const formattedDelivery = deliveryDate.toLocaleString(undefined, options);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Order Not Found</h3>
          <p className="text-gray-500">The requested order could not be found.</p>
        </div>
      </div>
    );
  }
  const status = (order.status || '').toUpperCase();
  const statusInfo = statusMap[status] || statusMap.PENDING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Order Summary Card */}
        <div className={`bg-white rounded-2xl shadow-lg border-2 ${statusInfo.color} p-6 md:p-8 mb-8 relative`}> 
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                Order <span className="text-primary-700">#{order.id}</span>
              </h2>
              <div className="text-gray-500 text-sm mb-2">Placed on {order.createdAt || ''}</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.chip} mb-2`}>{statusInfo.label}</div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-gray-900">${order.totalPrice}</span>
              <span className="text-gray-500 text-sm">{orderDetails.length} items</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Order Progress</span>
              <span>{statusInfo.progress}% Complete</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div className={`h-2 rounded-full transition-all duration-500 ${statusInfo.chip}`} style={{ width: `${statusInfo.progress}%` }}></div>
            </div>
          </div>
        </div>
        {/* Delivery Status */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <TruckSolidIcon className="h-8 w-8 text-blue-400" />
            <div>
              <div className="font-semibold text-blue-700">On the Way!</div>
              <div className="text-gray-500 text-sm">Expected delivery: <span className="font-semibold text-blue-700">{formattedDelivery}</span></div>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-medium shadow-sm focus:outline-none" type="button" tabIndex={-1} disabled>
            Track Package
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl shadow p-2 border border-gray-100">
          {[{ key: 'overview', label: 'Overview' }, { key: 'items', label: 'Items' }, { key: 'support', label: 'Support' }].map(t => (
            <button
              key={t.key}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Main Content Grid */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Order Information</div>
                {orderDetails.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-600 border-b">
                        <th className="py-2">Drug</th>
                        <th className="py-2">Quantity</th>
                        <th className="py-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="py-2 text-gray-800">{item.drugName}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-gray-500">No items in this order.</div>
                )}
              </div>
              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Order Notes</div>
                <div className="mb-2 bg-blue-50 rounded p-2 text-blue-700 text-sm">Customer Notes: Please call before delivery</div>
                <div className="bg-green-50 rounded p-2 text-green-700 text-sm">Pharmacy Notes: Prescription verified by Dr. Smith</div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Order Summary</div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Subtotal ({orderDetails.length} items)</span>
                  <span>${order.totalPrice - 15.99 - 4.01}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Shipping & Handling</span>
                  <span>$15.99</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Tax</span>
                  <span>$4.01</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>${order.totalPrice}</span>
                </div>
                <div className="mt-2 bg-gray-50 rounded p-2 text-gray-700 text-sm">
                  <span className="font-semibold">Payment Method:</span> {order.paymentMethod}
                </div>
              </div>
              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><HomeIcon className="h-5 w-5" /> Delivery Address</div>
                {user ? (
                  <>
                    <div className="text-gray-700 text-sm"><span className="font-semibold">Name:</span> {user.firstName} {user.lastName}</div>
                    <div className="text-gray-700 text-sm"><span className="font-semibold">City:</span> {user.city}</div>
                    <div className="text-gray-700 text-sm"><span className="font-semibold">Address:</span> {user.address}</div>
                    <div className="text-gray-700 text-sm"><span className="font-semibold">Phone:</span> {user.phone}</div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">Loading user info...</div>
                )}
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Quick Actions</div>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium shadow-sm focus:outline-none" type="button" tabIndex={-1} disabled>
                    <DocumentArrowDownIcon className="h-5 w-5" /> Download Invoice
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium shadow-sm focus:outline-none" type="button" tabIndex={-1} disabled>
                    <ReceiptPercentIcon className="h-5 w-5" /> View Receipt
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium shadow-sm focus:outline-none" type="button" tabIndex={-1} disabled>
                    <ArrowPathIcon className="h-5 w-5" /> Reorder Items
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium shadow-sm focus:outline-none" type="button" tabIndex={-1} disabled>
                    <ClipboardDocumentListIcon className="h-5 w-5" /> Share Tracking
                  </button>
                </div>
              </div>
              {/* Support */}
              <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> Need Assistance?</div>
                <div className="text-gray-600 text-sm mb-2">Our certified pharmacy team is available 24/7 to help with your order and answer any questions.</div>
                <button className="w-full px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm focus:outline-none mb-2" type="button" tabIndex={-1} disabled>
                  Live Chat Support
                </button>
                <button className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-blue-700 font-medium shadow-sm focus:outline-none flex items-center justify-center gap-2" type="button" tabIndex={-1} disabled>
                  <PhoneIcon className="h-5 w-5" /> Call Us: +1 (555) 123-4567
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === 'items' && (
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ClipboardDocumentListIcon className="h-5 w-5" /> Order Information</div>
            {orderDetails.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-2">Drug</th>
                    <th className="py-2">Quantity</th>
                    <th className="py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-2 text-gray-800">{item.drugName}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-500">No items in this order.</div>
            )}
          </div>
        )}
        {tab === 'support' && (
          <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> Need Assistance?</div>
            <div className="text-gray-600 text-sm mb-2">Our certified pharmacy team is available 24/7 to help with your order and answer any questions.</div>
            <button className="w-full px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-sm focus:outline-none mb-2" type="button" tabIndex={-1} disabled>
              Live Chat Support
            </button>
            <button className="w-full px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-blue-700 font-medium shadow-sm focus:outline-none flex items-center justify-center gap-2" type="button" tabIndex={-1} disabled>
              <PhoneIcon className="h-5 w-5" /> Call Us: +1 (555) 123-4567
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus; 