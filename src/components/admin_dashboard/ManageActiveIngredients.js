import React, { useState, useEffect, useRef } from 'react';
import { createActiveIngredient, deleteActiveIngredient, getActiveIngredients } from './api';
import { 
  PlusIcon, 
  TrashIcon, 
  BeakerIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ManageActiveIngredients = () => {
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [newActiveIngredient, setNewActiveIngredient] = useState({
    activeIngredient: '',
    ingredientArabicName: '',
    description: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    fetchActiveIngredients();
  }, []);

  const fetchActiveIngredients = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await getActiveIngredients();
      if (response.data && Array.isArray(response.data.data)) {
        setActiveIngredients(response.data.data);
      } else {
        setError('Invalid data format received from server');
        setActiveIngredients([]);
      }
    } catch (err) {
      console.error('Error fetching active ingredients:', err);
      setError('Failed to fetch active ingredients. Please try again later.');
      setActiveIngredients([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingIngredient) {
        // Update existing ingredient
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          return;
        }

        const response = await fetch(`http://localhost:8080/api/activeIngredient/${editingIngredient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify(newActiveIngredient)
        });

        if (!response.ok) {
          throw new Error('Failed to update active ingredient');
        }

        const data = await response.json();
        setActiveIngredients(activeIngredients.map(ing => 
          ing.id === editingIngredient.id ? data.data : ing
        ));
        setSuccessMessage('Active ingredient updated successfully!');
        setEditingIngredient(null);
      } else {
        // Create new ingredient
        const response = await createActiveIngredient(newActiveIngredient);
        setActiveIngredients([...activeIngredients, response.data.data]);
        setSuccessMessage('Active ingredient added successfully!');
      }

      setNewActiveIngredient({
        activeIngredient: '',
        ingredientArabicName: '',
        description: ''
      });

      if (descriptionRef.current) {
        descriptionRef.current.style.height = '50px';
      }
    } catch (error) {
      console.error('Error saving active ingredient:', error);
      setError(error.message || 'Failed to save active ingredient. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewActiveIngredient({
      activeIngredient: ingredient.activeIngredient,
      ingredientArabicName: ingredient.ingredientArabicName,
      description: ingredient.description
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
    setNewActiveIngredient({
      activeIngredient: '',
      ingredientArabicName: '',
      description: ''
    });
    if (descriptionRef.current) {
      descriptionRef.current.style.height = '50px';
    }
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteActiveIngredient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this active ingredient? This action cannot be undone.')) return;
    
    setDeletingId(id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteActiveIngredient(id);
      setActiveIngredients(activeIngredients.filter(ingredient => ingredient.id !== id));
      setSuccessMessage('Active ingredient deleted successfully!');
    } catch (error) {
      console.error('Error deleting active ingredient:', error);
      setError('Failed to delete active ingredient. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewActiveIngredient({ ...newActiveIngredient, [name]: value });

    if (name === 'description' && descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const filteredIngredients = activeIngredients.filter(ingredient => {
    if (!ingredient || !ingredient.activeIngredient) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      ingredient.activeIngredient.toLowerCase().includes(searchLower) ||
      (ingredient.ingredientArabicName && ingredient.ingredientArabicName.toLowerCase().includes(searchLower)) ||
      (ingredient.description && ingredient.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <BeakerIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Manage Active Ingredients</h1>
          </div>
          <p className="text-gray-600 text-lg">Add, edit, and manage your active ingredients</p>
        </div>

        {/* Messages */}
        {(error || successMessage) && (
          <div className={`mb-8 p-4 rounded-lg flex items-center justify-between ${
            error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            <div className="flex items-center">
              {error ? (
                <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              )}
              <span>{error || successMessage}</span>
            </div>
            <button
              onClick={clearMessages}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              {editingIngredient ? (
                <>
                  <BeakerIcon className="h-6 w-6 mr-2 text-primary-500" />
                  Edit Active Ingredient
                </>
              ) : (
                <>
                  <PlusIcon className="h-6 w-6 mr-2 text-primary-500" />
                  Add New Active Ingredient
                </>
              )}
            </div>
            {editingIngredient && (
              <button
                onClick={handleCancelEdit}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Cancel Edit
              </button>
            )}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Active Ingredient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Ingredient Name
              </label>
              <input
                type="text"
                name="activeIngredient"
                value={newActiveIngredient.activeIngredient}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter active ingredient name"
                required
                maxLength={100}
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arabic Name
              </label>
              <input
                type="text"
                name="ingredientArabicName"
                value={newActiveIngredient.ingredientArabicName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter Arabic name"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={newActiveIngredient.description}
                onChange={handleChange}
                ref={descriptionRef}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Enter description"
                style={{ minHeight: '50px' }}
                maxLength={500}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isAdding ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {editingIngredient ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {editingIngredient ? (
                    <>
                      <BeakerIcon className="h-5 w-5 mr-2" />
                      Update Active Ingredient
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Active Ingredient
                    </>
                  )}
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Active Ingredients List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BeakerIcon className="h-6 w-6 mr-2 text-primary-500" />
              Active Ingredients List ({filteredIngredients.length})
            </h2>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search active ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Loading State */}
          {fetchLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading active ingredients...</p>
            </div>
          ) : (
            <>
              {/* Ingredients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIngredients.map(ingredient => (
                  <div key={ingredient.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Ingredient Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{ingredient.activeIngredient}</h3>
                      {ingredient.ingredientArabicName && (
                        <p className="text-gray-600 mb-2">{ingredient.ingredientArabicName}</p>
                      )}
                      {ingredient.description && (
                        <p className="text-sm text-gray-500 line-clamp-3">{ingredient.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <BeakerIcon className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteActiveIngredient(ingredient.id)}
                        disabled={deletingId === ingredient.id}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === ingredient.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredIngredients.length === 0 && (
                <div className="text-center py-16">
                  <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Ingredients Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first active ingredient.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageActiveIngredients;
