import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowLeftIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  StarIcon,
  FunnelIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const DrugsPage = () => {
    const { categoryId } = useParams();
    const { state } = useLocation();
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'price-asc', 'price-desc'
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [availability, setAvailability] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:8080/api/drugs-view/category/${categoryId}`, {
            headers: {
                // Token is still commented out here as per your changes
                // Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setDrugs(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching drugs:', error);
                if (error.response && error.response.status === 401) {
                    console.log('Unauthorized, redirecting to login...');
                    navigate('/login');
                }
                setLoading(false);
            });
    }, [categoryId, navigate, token]);

    const handleDrugClick = (drugId) => {
        navigate(`/drug/details/${drugId}`);
    };

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
    
        setMessage('');
        try {
          const item = {
            drugId: product.drugId,
            quantity: 1, // Default quantity
          };
          await axios.post("http://localhost:8080/api/items/save", item, { headers: { token } });
          setMessage(`${product.drugName} added to cart!`);
          setMessageType('success');
        } catch (error) {
          console.error('Error adding to cart:', error);
          setMessage(`Failed to add ${product.drugName} to cart.`);
          setMessageType('error');
        } finally {
          setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleAddToWishlist = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
    
        setMessage('');
        try {
          const wishlistItem = {
            drugId: product.drugId,
          };
          await axios.post('http://localhost:8080/api/wishlist', wishlistItem, { headers: { token } });
          setMessage(`${product.drugName} added to wishlist!`);
          setMessageType('success');
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          setMessage(`Failed to add ${product.drugName} to wishlist.`);
          setMessageType('error');
        } finally {
          setTimeout(() => setMessage(''), 3000);
        }
    };

    const filteredAndSortedDrugs = drugs
        .filter(drug => {
            const matchesSearch = drug.drugName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                drug.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = drug.price >= priceRange.min && drug.price <= priceRange.max;
            const matchesAvailability = availability === 'all' || 
                                      (availability === 'in-stock' && drug.available) ||
                                      (availability === 'out-of-stock' && !drug.available);
            return matchesSearch && matchesPrice && matchesAvailability;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                default:
                    return a.drugName.localeCompare(b.drugName);
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center font-sans transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading medications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 font-sans transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <button onClick={() => navigate('/')} className="hover:text-primary-600">Home</button>
                    <span>/</span>
                    <button onClick={() => navigate('/categories')} className="hover:text-primary-600">Categories</button>
                    <span>/</span>
                    <span className="text-primary-600">{state?.categoryName}</span>
                </nav>

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-100 p-3 rounded-xl">
                                <TagIcon className="h-10 w-10 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {state?.categoryName || 'Loading...'}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {filteredAndSortedDrugs.length} medications available
                                </p>
                            </div>
                        </div>
                        
                        {/* Search and Controls */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search medications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 shadow-md bg-white text-gray-900 placeholder-gray-400 transition-all duration-300"
                                />
                                <MagnifyingGlassIcon className="h-6 w-6 text-primary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <FunnelIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    {viewMode === 'grid' ? (
                                        <ListBulletIcon className="h-5 w-5 text-gray-600" />
                                    ) : (
                                        <ViewColumnsIcon className="h-5 w-5 text-gray-600" />
                                    )}
                                </button>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Sidebar */}
                {showFilters && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4">Filters</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200"
                                        placeholder="Min"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                                <select
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200"
                                >
                                    <option value="all">All Products</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drugs Grid/List */}
                <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }>
                    {filteredAndSortedDrugs.map(drug => (
                        <div
                            key={drug.drugId}
                            className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
                        >
                            <div 
                                className="relative h-48 cursor-pointer"
                                onClick={() => handleDrugClick(drug.drugId)}
                            >
                                <img
                                    src={drug.imageUrl || drug.logo}
                                    alt={drug.drugName}
                                    className="w-full h-full object-contain p-4"
                                />
                                <div className="absolute top-2 right-2">
                                    {drug.available ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <h3 
                                    className="font-semibold text-gray-800 text-sm h-10 mb-2 cursor-pointer"
                                    onClick={() => handleDrugClick(drug.drugId)}
                                >
                                    {drug.drugName}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">{drug.form || 'Box'}</p>
                                
                                <div className="mt-auto">
                                    <p className="text-sm font-bold text-blue-600 mb-3">
                                        From {drug.price} EGP
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(drug);
                                            }}
                                            className="w-full flex items-center justify-center py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <PlusIcon className="h-5 w-5 mr-1" />
                                            <span>Add</span>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToWishlist(drug);
                                            }}
                                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500 transition-colors"
                                            title="Add to Wishlist"
                                        >
                                            <HeartIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredAndSortedDrugs.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
                        <TagIcon className="h-16 w-16 text-primary-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">No Medications Found</h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search terms.' : 'No medications available in this category.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrugsPage;
