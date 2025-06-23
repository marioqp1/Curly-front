import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch("http://localhost:8080/api/category", {
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        // Ensure we have valid data before setting it
        if (data && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error('Invalid data format received:', data);
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        if (error.response && error.response.status === 401) {
          console.log('Unauthorized, redirecting to login...');
          navigate('/login');
        }
        setLoading(false);
        setCategories([]);
      });
  }, [navigate, token]);

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/category/${categoryId}`, { state: { categoryName } });
  };

  // Add null check and default value for categoryName
  const filteredCategories = categories.filter(category =>
    category && category.categoryName && 
    category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Search */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <HeartIcon className="h-12 w-12 text-primary-500 mr-3 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Pharmacy Categories
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-8">Find the right medication for your health needs</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300 shadow-sm"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredCategories.map(category => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.categoryName)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Image Container */}
                <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                  {category.logo ? (
                    <img 
                      src={category.logo} 
                      alt={category.categoryName || 'Category'}
                      className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <SparklesIcon className="w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-primary-500/20 transition-all duration-300 flex items-center justify-center">
                    <ArrowRightIcon className="w-8 h-8 text-primary-500 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors text-center">
                    {category.categoryName || 'Unnamed Category'}
                  </h3>
                  
                  {/* Action Indicator */}
                  <div className="flex items-center justify-center text-primary-500 text-sm font-medium group-hover:text-primary-700 transition-colors">
                    <span>Browse Products</span>
                    <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-16">
            <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Categories will appear here when they are added to the system.'}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto text-center border border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-4">
            Your Health, Our Priority
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Browse through our comprehensive collection of pharmaceutical products organized by categories. 
            Each category contains carefully curated medications to help you find exactly what you need for your health and wellness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
