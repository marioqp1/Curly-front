import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/wishlist', {
        headers: { token }
      });
      
      // Get detailed information for each drug
      const wishlistItemsWithDetails = (await Promise.all(
        response.data.data.map(async (item) => {
          try {
            const drugDetailsResponse = await axios.get(`http://localhost:8080/api/drugs-view/${item.drugId}/details`);
            if (drugDetailsResponse.data && drugDetailsResponse.data.data) {
              return {
                ...item,
                ...drugDetailsResponse.data.data
              };
            }
            // Return null if drug details are not found
            return null;
          } catch (error) {
            console.error(`Error fetching details for drug ${item.drugId}:`, error);
            // Return null on error
            return null;
          }
        })
      )).filter(Boolean); // Filter out any null entries

      setWishlistItems(wishlistItemsWithDetails);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setMessage('Failed to load wishlist items');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (drugId) => {
    setAddingToCart(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const item = {
        drugId,
        quantity: 1
      };

      await axios.post('http://localhost:8080/api/items/save', item, {
        headers: { token }
      });

      setMessage('Item added to cart successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Failed to add item to cart');
      setMessageType('error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRemoveFromWishlist = async (drugId, wishlistId) => {
    try {
      const token = localStorage.getItem('token');
      const wishlistItem = {
        id: wishlistId, // The ID of the wishlist item to delete
        drugId: drugId,
        userId: 0 // The API will handle this based on the token
      };

      await axios.delete('http://localhost:8080/api/wishlist', {
        headers: { token },
        data: wishlistItem
      });

      setWishlistItems(wishlistItems.filter(item => item.drugId !== drugId));
      setMessage('Item removed from wishlist');
      setMessageType('success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessage('Failed to remove item from wishlist');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <HeartIcon className="h-8 w-8 text-primary-500 mr-3" />
            My Wishlist
          </h1>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            messageType === 'success' ? 'bg-success-50 border-success-100' : 'bg-error-50 border-error-100'
          } border animate-fade-in`}>
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

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-[1.02] transition-transform duration-200">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="h-12 w-12 text-primary-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Your Wishlist is Empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start adding your favorite medications to your wishlist to keep track of them.
            </p>
            <button
              onClick={() => navigate('/')} 
              className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors transform hover:scale-105 duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Medications
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div 
                key={item.drugId} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-200 hover:shadow-lg p-2"
              >
                <div className="relative h-36 bg-gradient-to-br from-primary-50 to-accent-50 group">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.drugName}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-xs">No image available</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleRemoveFromWishlist(item.drugId, item.id)}
                      className="p-1 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-error-600 transition-colors shadow hover:shadow-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">{item.drugName}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2 text-xs">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600">${item.price}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.available 
                        ? 'bg-success-50 text-success-600 border border-success-100' 
                        : 'bg-error-50 text-error-600 border border-error-100'
                    }`}>
                      {item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item.drugId)}
                      disabled={!item.available || addingToCart}
                      className="w-full py-2 px-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow hover:shadow-md text-sm"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-1" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/drug/details/${item.drugId}`)}
                      className="w-full py-2 px-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center text-sm"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 text-primary-500 mr-1" />
                        <span className="text-xs text-gray-600">Genuine</span>
                      </div>
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 text-primary-500 mr-1" />
                        <span className="text-xs text-gray-600">Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 