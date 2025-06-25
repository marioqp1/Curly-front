import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/drugs/search?name=${value}`);
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleDrugClick = (drugId) => {
    navigate(`/drug/details/${drugId}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for drugs..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 
                   text-black dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-yellow-400 dark:focus:border-yellow-400 
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute left-0 right-0 w-full max-w-xl mx-auto mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {searchResults.map((drug) => (
            <button
              key={drug.id}
              onClick={() => handleDrugClick(drug.id)}
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500 dark:border-yellow-400"></div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 