import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    fetch("http://localhost:8080/api/category")
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    // Fetch featured products (now using the correct endpoint)
    fetch("http://localhost:8080/api/drugs-view/featured-drugs")
      .then(response => response.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setFeaturedProducts(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching featured products:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/category/${categoryId}`, { state: { categoryName } });
  };

  const handleProductClick = (productId) => {
    navigate(`/drug/details/${productId}`);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/drugs/search?name=${value}`);
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSubscribe = async () => {
    setSubscribeMessage("");
    if (!subscribeEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subscribeEmail)) {
      setSubscribeMessage("Please enter a valid email address.");
      return;
    }
    try {
      await axios.get(`http://localhost:8080/email/send-email/subscribe?to=${encodeURIComponent(subscribeEmail)}`);
      setSubscribeMessage("Subscribed successfully! Check your email.");
      setSubscribeEmail("");
    } catch (error) {
      setSubscribeMessage("Failed to subscribe. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-400 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Discover a wide range of pharmaceutical products to support your health and wellness journey
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for medications..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 
                           bg-white/10 backdrop-blur-sm
                           text-white placeholder-white/70
                           focus:ring-2 focus:ring-white/50 transition-all duration-300 shadow-lg"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-white/70 absolute left-4 top-1/2 transform -translate-y-1/2" />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 w-full max-w-2xl mx-auto mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => handleProductClick(drug.id)}
                      className="w-full px-4 py-3 text-left bg-white hover:bg-gray-100 text-gray-900 border-b border-gray-200 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center">
                        {drug.logo && (
                          <img
                            src={drug.logo}
                            alt={drug.drugName}
                            className="w-10 h-10 object-contain rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium">{drug.drugName}</div>
                          <div className="text-sm text-gray-500">
                            {drug.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <TruckIcon className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold ml-4">Fast Delivery</h3>
            </div>
            <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold ml-4">Authentic Products</h3>
            </div>
            <p className="text-gray-600">100% genuine medications from trusted manufacturers</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold ml-4">24/7 Support</h3>
            </div>
            <p className="text-gray-600">Round-the-clock customer service assistance</p>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by category</h2>
          <p className="text-gray-600">Find the right medication for your health needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {categories.slice(0, 8).map(category => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.categoryName)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className={`relative h-40 ${
                  category.categoryName === 'Featured' ? 'bg-blue-600' : 'bg-blue-100'
                }`}>
                  {category.logo ? (
                    <img 
                      src={category.logo} 
                      alt={category.categoryName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SparklesIcon className="w-16 h-16 text-primary-400" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4 text-center">
                  <h3 className="text-md font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {category.categoryName}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            View All Categories
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover our most popular medications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {featuredProducts.map(product => (
            <div
              key={product.drugId}
              onClick={() => handleProductClick(product.drugId)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:scale-105"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.drugName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  {product.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.drugName}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-primary-600 font-semibold">
                    <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                    <span>{product.price}</span>
                  </div>
                  <button className="flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-white/90 mb-8">Subscribe to our newsletter for the latest updates and offers</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 text-black"
                value={subscribeEmail}
                onChange={e => setSubscribeEmail(e.target.value)}
              />
              <button
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                onClick={handleSubscribe}
                type="button"
              >
                Subscribe
              </button>
            </div>
          </div>
          {subscribeMessage && (
            <div className="mt-4 text-white bg-primary-700 bg-opacity-80 rounded-lg px-4 py-2 inline-block">
              {subscribeMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 