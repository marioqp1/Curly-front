import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createDrug, deleteDrug, getDrugs } from './api';
import { 
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  BeakerIcon,
  TagIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ManageDrugs = () => {
  const [drugs, setDrugs] = useState([]);
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newDrug, setNewDrug] = useState({
    activeIngredientId: '',
    categoryId: '',
    drugName: '',
    description: '',
    logo: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrugs = async () => {
      const response = await getDrugs();
      setDrugs(response.data.data);
    };
    const fetchActiveIngredients = async () => {
      const response = await axios.get("http://localhost:8080/api/activeIngredient");
      setActiveIngredients(response.data.data);
    };
    const fetchCategories = async () => {
      const response = await axios.get("http://localhost:8080/api/category");
      setCategories(response.data.data);
    };
    fetchDrugs();
    fetchActiveIngredients();
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        
        try {
          const uploadResponse = await axios.post(
            'http://localhost:8080/api/images/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (uploadResponse.data) {
            imageUrl = uploadResponse.data;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const drugData = {
        ...newDrug,
        logo: imageUrl || newDrug.logo
      };

      await createDrug(drugData);
      
      // Refresh the drugs list
      const response = await getDrugs();
      setDrugs(response.data.data);
      
      // Reset form
      setNewDrug({
        activeIngredientId: '',
        categoryId: '',
        drugName: '',
        description: '',
        logo: ''
      });
      setImageFile(null);
      toast.success('Drug added successfully');
    } catch (error) {
      console.error('Error creating drug:', error);
      toast.error('Failed to create drug');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      try {
        await deleteDrug(id);
        setDrugs(drugs.filter(drug => drug.id !== id));
      } catch (error) {
        console.error('Error deleting drug:', error);
      }
    }
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <BeakerIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Manage Drugs</h1>
          </div>
          <p className="text-gray-600 text-lg">Add, edit, and manage your drug inventory</p>
        </div>

        {/* Add New Drug Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <PlusIcon className="h-6 w-6 mr-2 text-primary-500" />
            Add New Drug
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drug Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug Name
              </label>
              <input
                type="text"
                value={newDrug.drugName}
                onChange={(e) => setNewDrug({...newDrug, drugName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter drug name"
                required
              />
            </div>

            {/* Active Ingredient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Ingredient
              </label>
              <select
                value={newDrug.activeIngredientId}
                onChange={(e) => setNewDrug({...newDrug, activeIngredientId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">Select Active Ingredient</option>
                {activeIngredients.map(ingredient => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.activeIngredient}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newDrug.categoryId}
                onChange={(e) => setNewDrug({...newDrug, categoryId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug Image
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
                  />
                </label>
                {imageFile && (
                  <span className="text-sm text-green-600">{imageFile.name}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newDrug.description}
                onChange={(e) => setNewDrug({...newDrug, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter drug description"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Drug...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Drug
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Drugs List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-primary-500" />
              Drugs List ({filteredDrugs.length})
            </h2>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search drugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Drugs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrugs.map(drug => (
              <div key={drug.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                {/* Drug Image */}
                <div className="h-32 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {drug.logo ? (
                    <img 
                      src={drug.logo} 
                      alt={drug.drugName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BeakerIcon className="h-16 w-16 text-primary-400" />
                  )}
                </div>

                {/* Drug Info */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{drug.drugName}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drug.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {categories.find(cat => cat.id === drug.categoryId)?.categoryName || 'Unknown'}
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(drug.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDrugs.length === 0 && (
            <div className="text-center py-16">
              <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Drugs Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first drug.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDrugs;
