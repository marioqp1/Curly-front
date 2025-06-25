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
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recently Added");
  const priceDropCount = wishlistItems.filter(item => item.oldPrice && item.price < item.oldPrice).length;
  const [clearing, setClearing] = useState(false);
  const [addingAll, setAddingAll] = useState(false);

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

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) return;
    setClearing(true);
    setMessage("");
    try {
      const token = localStorage.getItem('token');
      // Remove each item in parallel
      await Promise.all(wishlistItems.map(item =>
        axios.delete('http://localhost:8080/api/wishlist', {
          headers: { token },
          data: {
            id: item.id,
            drugId: item.drugId,
            userId: 0
          }
        })
      ));
      setWishlistItems([]);
      setMessage('Wishlist cleared successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to clear wishlist');
      setMessageType('error');
    } finally {
      setClearing(false);
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    setAddingAll(true);
    setMessage("");
    try {
      const token = localStorage.getItem('token');
      // Only add available items
      const availableItems = wishlistItems.filter(item => item.available);
      await Promise.all(availableItems.map(item =>
        axios.post('http://localhost:8080/api/items/save', {
          drugId: item.drugId,
          quantity: 1
        }, {
          headers: { token }
        })
      ));
      setMessage('All available items added to cart!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to add all items to cart');
      setMessageType('error');
    } finally {
      setAddingAll(false);
    }
  };

  // Filter and sort wishlist items
  const filteredItems = wishlistItems.filter(item =>
    item.drugName.toLowerCase().includes(search.toLowerCase())
  );
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sort === "Recently Added") return 0;
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 bg-transparent hover:bg-gray-100 hover:text-primary-600 transition-colors group px-4 py-2 rounded-lg">
              <ArrowLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center ml-4">
              <HeartIcon className="h-8 w-8 text-primary-500 mr-3" />
              My Wishlist
            </h1>
            <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">{wishlistItems.length} items</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors">
            Share Wishlist
          </button>
        </div>
        {/* Price Drop Info */}
        {priceDropCount > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 font-medium flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            Great news! {priceDropCount} item{priceDropCount > 1 ? 's' : ''} have price drops
          </div>
        )}
        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search your wishlist..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          >
            <option>Recently Added</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAddAllToCart} disabled={addingAll || wishlistItems.length === 0} className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add All to Cart</button>
            <button onClick={handleClearWishlist} disabled={clearing || wishlistItems.length === 0} className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Clear Wishlist</button>
          </div>
        </div>
        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.drugId}
              className={`bg-white rounded-xl shadow-md overflow-hidden border ${item.price < item.oldPrice ? 'border-green-400' : 'border-gray-100'} transform hover:scale-[1.01] transition-all duration-200 hover:shadow-lg p-2 cursor-pointer`}
              onClick={() => navigate(`/drug/details/${item.drugId}`)}
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
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {item.bestSeller && <span className="px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-bold">Best Seller</span>}
                  {item.price < item.oldPrice && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-400">Price Drop!</span>}
                  {item.isNew && <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">New</span>}
                  {item.isPopular && <span className="px-2 py-0.5 rounded-full bg-yellow-600 text-white text-xs font-bold">Popular</span>}
                  {!item.available && <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold">Out of Stock</span>}
                  {item.prescriptionRequired && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-400">Prescription Required</span>}
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleRemoveFromWishlist(item.drugId, item.id); }}
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
                  {item.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">${item.oldPrice}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {item.available ? (
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToCart(item.drugId); }}
                      disabled={addingToCart}
                      className="w-full py-2 px-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow hover:shadow-md text-sm"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-1" />
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 px-2 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-sm cursor-not-allowed"
                    >
                      Notify When Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage; 