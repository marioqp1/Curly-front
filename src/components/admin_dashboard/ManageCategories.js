import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createCategory, deleteCategory, getCategories } from './api';
import { 
  PlusIcon, 
  TrashIcon, 
  PhotoIcon, 
  TagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ categoryName: '', logo: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const response = await getCategories();
      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        setError('Invalid data format received from server');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again later.');
      setCategories([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImageFile(file);
      setError(null);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('imageFile', imageFile);

    try {
      const response = await axios.post('http://localhost:8080/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let imageURL = newCategory.logo; // Keep existing image if no new one uploaded
      
      if (imageFile) {
        imageURL = await handleUploadImage();
        if (!imageURL) {
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const categoryData = { 
        ...newCategory, 
        logo: imageURL 
      };
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      if (editingCategory) {
        // Update existing category
        const response = await axios.put(
          `http://localhost:8080/api/category/${editingCategory.id}`, 
          {
            categoryName: categoryData.categoryName,
            logo: categoryData.logo
          },
          {
            headers: {
              'token': token,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.data) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? response.data.data : cat
          ));
          setSuccessMessage('Category updated successfully!');
          setEditingCategory(null);
          setNewCategory({ categoryName: '', logo: '' });
          setImageFile(null);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        // Create new category
        const response = await createCategory(categoryData);
        if (response.data && response.data.data) {
          setCategories([...categories, response.data.data]);
          setSuccessMessage('Category added successfully!');
          setNewCategory({ categoryName: '', logo: '' });
          setImageFile(null);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to save category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      categoryName: category.categoryName,
      logo: category.logo
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategory({ categoryName: '', logo: '' });
    setImageFile(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    
    setDeleteLoading(id);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await deleteCategory(id);
      setCategories(categories.filter(category => category.id !== id));
      setSuccessMessage('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredCategories = categories.filter(category => {
    if (!category || !category.categoryName) return false;
    const searchLower = searchTerm.toLowerCase();
    return category.categoryName.toLowerCase().includes(searchLower);
  });

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <TagIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Manage Categories</h1>
          </div>
          <p className="text-gray-600 text-lg">Add, edit, and manage your product categories</p>
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

        {/* Add/Edit Category Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              {editingCategory ? (
                <>
                  <TagIcon className="h-6 w-6 mr-2 text-primary-500" />
                  Edit Category
                </>
              ) : (
                <>
                  <PlusIcon className="h-6 w-6 mr-2 text-primary-500" />
                  Add New Category
                </>
              )}
            </div>
            {editingCategory && (
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
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.categoryName}
                onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter category name"
                required
                maxLength={50}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <PhotoIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Choose Image</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    required={!editingCategory}
                  />
                </label>
                {imageFile && (
                  <span className="text-sm text-green-600">{imageFile.name}</span>
                )}
                {!imageFile && newCategory.logo && (
                  <span className="text-sm text-gray-600">Current image set</span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {editingCategory ? 'Updating Category...' : 'Adding Category...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {editingCategory ? (
                    <>
                      <TagIcon className="h-5 w-5 mr-2" />
                      Update Category
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Category
                    </>
                  )}
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <TagIcon className="h-6 w-6 mr-2 text-primary-500" />
              Categories List ({filteredCategories.length})
            </h2>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
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
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <>
              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(category => (
                  <div key={category.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Category Image */}
                    <div className="h-32 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg mb-4 flex items-center justify-center">
                      {category.logo ? (
                        <img 
                          src={category.logo} 
                          alt={category.categoryName}
                          className="h-20 w-20 object-contain"
                        />
                      ) : (
                        <TagIcon className="h-16 w-16 text-primary-400" />
                      )}
                    </div>

                    {/* Category Info */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.categoryName}</h3>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <TagIcon className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteLoading === category.id}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === category.id ? (
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
              {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                  <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first category.'}
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

export default ManageCategories;
