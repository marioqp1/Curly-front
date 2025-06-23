import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCartIcon, TrashIcon, ArrowLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [drugDetails, setDrugDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Fetch cart for the user
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/cart/user/${userId}`, {
          headers: { token },
        });
        setCart(response.data.data);
        console.log(response.data.data);
        setLoading(false);
      } catch (error) {
        setCart(null);
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId, token]);

  // Fetch drug details for each item
  useEffect(() => {
    if (!cart || !cart.items) return;
    const fetchDetails = async () => {
      const details = {};
      await Promise.all(
        cart.items.map(async (item) => {
          try {
            const res = await axios.get(`http://localhost:8080/api/drugs/${item.drugId}`);
            details[item.drugId] = res.data.data;
            console.log(res.data.data);
          } catch (e) {
            details[item.drugId] = null;
          }
        })
      );
      setDrugDetails(details);
    };
    fetchDetails();
  }, [cart]);

  const handleRemove = async (itemId) => {
    setRemoving(itemId);
    try {
      await axios.delete(`http://localhost:8080/api/items/${itemId}`, { headers: { token } });
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    } catch (e) {
      // handle error
    } finally {
      setRemoving(null);
    }
  };

  const total = cart?.items?.reduce((sum, item) => {
    const drug = drugDetails[item.drugId];
    return sum + (drug ? drug.price * item.quantity : 0);
  }, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <ShoppingCartIcon className="h-16 w-16 text-primary-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse products and add them to your cart.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 font-sans">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-primary-700 mb-10 flex items-center">
          <ShoppingCartIcon className="h-10 w-10 mr-3 text-primary-500" />
          Your Cart
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.items.map((item) => {
              const drug = drugDetails[item.drugId];
              console.log('Drug details for item:', drug);
              return (
                <div key={item.id} className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Drug Image */}
                  <div className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 md:w-48 h-48">
                    {drug && drug.logo ? (
                      <img src={drug.logo} alt={drug.drugName} className="w-32 h-32 object-contain" />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>
                  {/* Drug Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-primary-700 mb-2">{drug ? drug.drugName : 'Unknown Drug'}</h2>
                      <p className="text-gray-600 mb-2">{drug ? drug.description : ''}</p>
                      <div className="flex items-center text-primary-600 font-semibold text-lg mb-2">
                        <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                        <span>{drug ? drug.price : '-'}</span>
                        <span className="ml-4 text-gray-500 text-base">x {item.quantity}</span>
                      </div>
                      <div className="text-gray-500 text-sm">Subtotal: <span className="font-semibold text-gray-700">{drug ? (drug.price * item.quantity).toFixed(2) : '-'}</span></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removing === item.id}
                        className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        {removing === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Cart Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-fit flex flex-col justify-between">
            <h3 className="text-2xl font-bold text-primary-700 mb-6">Order Summary</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-gray-700">Total</span>
              <span className="text-2xl font-bold text-primary-600">${total.toFixed(2)}</span>
            </div>
            <button className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg shadow">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 