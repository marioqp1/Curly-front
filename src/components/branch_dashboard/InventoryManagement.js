import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  CubeTransparentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const InventoryManagement = () => {
  const [inventoryDrugs, setInventoryDrugs] = useState([]);
  const [availableDrugs, setAvailableDrugs] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [newInventoryDrug, setNewInventoryDrug] = useState({
    drugId: '',
    price: 0,
    stock: 0
  });
  const [editingDrug, setEditingDrug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch employee's branch ID and initial data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/branches/branch-for-employee', {
          headers: { token }
        });
        setBranchId(response.data.data.branchId);
      } catch (error) {
        console.error('Error fetching employee branch data:', error);
        toast.error('Failed to load branch data');
      }
    };
    fetchEmployeeData();
  }, []);

  // Fetch inventory drugs when branchId is available
  useEffect(() => {
    const fetchInventoryDrugs = async () => {
      if (branchId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/api/inventory-drugs/branch/${branchId}`, {
            headers: { token }
          });
          setInventoryDrugs(response.data.data);
        } catch (error) {
          console.error('Error fetching inventory drugs:', error);
          toast.error('Failed to load inventory data');
        }
      }
    };
    fetchInventoryDrugs();
  }, [branchId]);

  // Fetch available drugs for adding to inventory
  useEffect(() => {
    const fetchAvailableDrugs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/drugs', {
          headers: { token }
        });
        setAvailableDrugs(response.data.data);
      } catch (error) {
        console.error('Error fetching available drugs:', error);
        toast.error('Failed to load available drugs');
      }
    };
    fetchAvailableDrugs();
  }, []);

  const handleAddInventoryDrug = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const drugData = {
        drugId: newInventoryDrug.drugId,
        price: parseFloat(newInventoryDrug.price),
        stock: parseInt(newInventoryDrug.stock),
        branchId: branchId
      };

      console.log('Sending drug data:', drugData); // For debugging

      const response = await axios.post(
        'http://localhost:8080/api/inventory-drugs/save',
        drugData,
        {
          headers: { token }
        }
      );
      
      setInventoryDrugs([...inventoryDrugs, response.data.data]);
      setNewInventoryDrug({
        drugId: '',
        price: 0,
        stock: 0
      });

      toast.success('Drug added to inventory successfully!');
      setMessage('Drug added to inventory successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error adding inventory drug:', error);
      toast.error('Failed to add drug to inventory');
      setMessage('Failed to add drug to inventory');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventoryDrug = async (inventoryDrug) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8080/api/inventory-drugs/update/${inventoryDrug.id}`,
        inventoryDrug,
        {
          headers: { token }
        }
      );

      const response = await axios.get(
        `http://localhost:8080/api/inventory-drugs/branch/${branchId}`,
        {
          headers: { token }
        }
      );
      setInventoryDrugs(response.data.data);
      setEditingDrug(null);
      toast.success('Inventory updated successfully!');
      setMessage('Inventory updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating inventory drug:', error);
      toast.error('Failed to update inventory');
      setMessage('Failed to update inventory');
      setMessageType('error');
    }
  };

  const handleDeleteInventoryDrug = async (inventoryDrug) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:8080/api/inventory-drugs/delete/${inventoryDrug.id}`,
          {
            headers: { token }
          }
        );
        setInventoryDrugs(inventoryDrugs.filter(drug => drug.id !== inventoryDrug.id));
        toast.success('Item deleted from inventory');
        setMessage('Item deleted from inventory');
        setMessageType('success');
      } catch (error) {
        console.error('Error deleting inventory drug:', error);
        toast.error('Failed to delete item from inventory');
        setMessage('Failed to delete item from inventory');
        setMessageType('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <CubeTransparentIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Branch Inventory</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your branch's inventory and stock levels</p>
        </div>

        {/* Add New Inventory Drug Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <PlusIcon className="h-6 w-6 mr-2 text-primary-500" />
            Add Drug to Inventory
          </h2>
          
          <form onSubmit={handleAddInventoryDrug} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Drug Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug
              </label>
              <select
                value={newInventoryDrug.drugId}
                onChange={(e) => setNewInventoryDrug({ ...newInventoryDrug, drugId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">Select Drug</option>
                {availableDrugs.map((drug) => (
                  <option key={drug.id} value={drug.id}>
                    {drug.drugName}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newInventoryDrug.price}
                onChange={(e) => setNewInventoryDrug({...newInventoryDrug, price: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter price"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={newInventoryDrug.stock}
                onChange={(e) => setNewInventoryDrug({...newInventoryDrug, stock: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter stock quantity"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding to Inventory...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add to Inventory
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              messageType === 'success' 
                ? 'bg-success-50 text-success-700 border border-success-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <XCircleIcon className="h-5 w-5 mr-2" />
              )}
              {message}
            </div>
          )}
        </div>

        {/* Search and Inventory List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ArchiveBoxIcon className="h-6 w-6 mr-2 text-primary-500" />
              Current Inventory ({inventoryDrugs.length})
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

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryDrugs
              .filter(drug => drug.drugName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(inventoryDrug => (
                <div key={inventoryDrug.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                  {/* Drug Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BeakerIcon className="h-5 w-5 mr-2 text-primary-500" />
                      {inventoryDrug.drugName}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      inventoryDrug.stock > 10 
                        ? 'bg-success-100 text-success-800' 
                        : inventoryDrug.stock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {inventoryDrug.stock > 10 ? 'In Stock' : inventoryDrug.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </div>
                  </div>

                  {/* Drug Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Price</span>
                      </div>
                      <span className="font-medium text-gray-800">${inventoryDrug.price}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ArchiveBoxIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Stock</span>
                      </div>
                      <span className="font-medium text-gray-800">{inventoryDrug.stock} units</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingDrug(inventoryDrug)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteInventoryDrug(inventoryDrug)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {inventoryDrugs.length === 0 && (
            <div className="text-center py-16">
              <CubeTransparentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Inventory Items Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding drugs to your inventory.'}
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingDrug && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Inventory Item</h3>
              <div className="space-y-4">
                <p className="text-gray-600 mb-2">Drug: <strong>{editingDrug.drugName}</strong></p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDrug.price}
                    onChange={(e) => setEditingDrug({...editingDrug, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editingDrug.stock}
                    onChange={(e) => setEditingDrug({...editingDrug, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleUpdateInventoryDrug(editingDrug)}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingDrug(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement; 