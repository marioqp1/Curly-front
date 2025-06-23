import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCartIcon,
  HeartIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  StarIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const DrugDetails = () => {
  const { drugId } = useParams();
  const navigate = useNavigate();
  const [drug, setDrug] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const drugResponse = await axios.get(`http://localhost:8080/api/drugs-view/${drugId}/details`);
        setDrug(drugResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load drug details');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [drugId]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { token } };
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setMessage('');

    try {
      const item = {
        drugId: drug.drugId,
        quantity,
      };

      await axios.post("http://localhost:8080/api/items/save", item, getAuthHeaders());
      setMessage('Drug added to cart successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Failed to add drug to cart');
      setMessageType('error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const wishlistItem = {
        id: "", // The API will generate this
        drugId: drug.drugId,
        userId: 0 // The API will handle this based on the token
      };

      await axios.post('http://localhost:8080/api/wishlist', wishlistItem, {
        headers: { token }
      });

      setMessage('Drug added to wishlist successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setMessage('Failed to add drug to wishlist');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drug details...</p>
        </div>
      </div>
    );
  }

  if (!drug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Drug Not Found</h3>
          <p className="text-gray-500 mb-4">The requested drug could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Medications
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: Drug Info */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="h-48 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden group">
                {drug.imageUrl ? (
                  <img
                    src={drug.imageUrl}
                    alt={drug.drugName}
                    className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center">
                    <InformationCircleIcon className="h-24 w-24 text-primary-400 mx-auto mb-2" />
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-3">
                {drug.drugName}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">{drug.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-primary-50 rounded-xl border border-primary-100">
                <InformationCircleIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Active Ingredient</p>
                  <p className="text-gray-600">{drug.activeIngredients || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-success-50 rounded-xl border border-success-100">
                <HeartIcon className="h-6 w-6 text-success-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Category</p>
                  <p className="text-gray-600">{drug.categoryName || 'Not specified'}</p>
                </div>
              </div>

              {/* Additional Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Quality Assured</p>
                    <p className="text-gray-600 text-sm">Genuine Products</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <TruckIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Fast Delivery</p>
                    <p className="text-gray-600 text-sm">Same Day Pickup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Purchase Section */}
          <div className="lg:col-span-2 lg:sticky lg:top-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 self-start">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <ShoppingCartIcon className="h-6 w-6 mr-2 text-primary-500" />
              Add to Cart
            </h2>

            {/* Price Display */}
            <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price</span>
                <span className="text-2xl font-bold text-primary-600">${drug.price}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  min="1"
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

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

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full py-3 px-6 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleFavorite}
                className="w-full py-3 px-6 border border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center"
              >
                <HeartIcon className="h-5 w-5 mr-2" />
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugDetails;
