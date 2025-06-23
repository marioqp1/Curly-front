import React, { useState, useEffect } from 'react';
import { getInventoryDrugsForBranch, createInventoryDrug, updateInventoryDrug, deleteInventoryDrug, getCompanyById, getBranchesByPharmacyId, getDrugs } from './Apis';
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
import axios from 'axios';

const ManageInventoryDrugs = () => {
  const [inventoryDrugs, setInventoryDrugs] = useState([]);
  const [company, setCompany] = useState({});
  const [branches, setBranches] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [newInventoryDrug, setNewInventoryDrug] = useState({
    drugId: '',
    price: 0,
    stock: 0,
    branchId: ''
  });
  const [editingDrug, setEditingDrug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await getCompanyById();
        setCompany(companyResponse.data.data);
        const companyId = companyResponse.data.data.companyId;

        const branchesResponse = await getBranchesByPharmacyId(companyId);
        setBranches(branchesResponse.data.data);
        if (branchesResponse.data.data.length > 0) {
          setSelectedBranchId(branchesResponse.data.data[0].branchId);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setMessage('Failed to load company data');
        setMessageType('error');
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchInventoryDrugs = async () => {
      if (selectedBranchId) {
        try {
          const response = await getInventoryDrugsForBranch(selectedBranchId);
          setInventoryDrugs(response.data.data);
        } catch (error) {
          console.error('Error fetching inventory drugs:', error);
        }
      }
    };
    fetchInventoryDrugs();
  }, [selectedBranchId]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await getDrugs();
        //console.log(response.data.data);
        setDrugs(response.data.data);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      }
    };
    fetchDrugs();
  }, []);

  const handleAddInventoryDrug = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      console.log('Selected drugId from state:', newInventoryDrug.drugId);
      
      const drugData = {
        drugId: newInventoryDrug.drugId,
        price: newInventoryDrug.price,
        stock: newInventoryDrug.stock,
        branchId: selectedBranchId
      };

      console.log('Sending drug data:', drugData);
      const response = await axios.post(
        'http://localhost:8080/api/inventory-drugs/save',
        drugData,
        {
          headers: {
            'token': token
          }
        }
      );
      
      setInventoryDrugs([...inventoryDrugs, response.data.data]);
      setNewInventoryDrug({
        drugId: '',
        price: 0,
        stock: 0,
        branchId: ''
      });

      setMessage('Inventory drug added successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error adding inventory drug:', error);
      setMessage('Failed to add inventory drug');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventoryDrug = async (inventoryDrugId, updatedData) => {
    try {
      console.log("Id sent :  ");
      console.log(inventoryDrugId);
      console.log("data sent: ")    
      console.log(updatedData);
      
      await updateInventoryDrug(inventoryDrugId, updatedData);

      const response = await getInventoryDrugsForBranch(selectedBranchId);
      setInventoryDrugs(response.data.data);
      setEditingDrug(null);
      setMessage('Inventory drug updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating inventory drug:', error);
      setMessage('Failed to update inventory drug');
      setMessageType('error');
    }
  };

  const handleDeleteInventoryDrug = async (inventoryDrugId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventoryDrug(inventoryDrugId);
        setInventoryDrugs(inventoryDrugs.filter(drug => drug.inventoryDrugId !== inventoryDrugId));
        setMessage('Inventory drug deleted successfully!');
        setMessageType('success');
      } catch (error) {
        console.error('Error deleting inventory drug:', error);
        setMessage('Failed to delete inventory drug');
        setMessageType('error');
      }
    }
  };

  const getDrugName = (drugId) => {
    const drug = drugs.find(d => d.drugId === drugId);
    //console.log(drug);
    return drug ? drug.drugName : 'Unknown Drug';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.branchId === branchId);
    return branch ? branch.branchName : 'Unknown Branch';
  };

  const filteredInventoryDrugs = inventoryDrugs.filter(drug => {
    const drugName = getDrugName(drug.drugId).toLowerCase();
    return drugName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <CubeTransparentIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Manage Inventory</h1>
          </div>
          <p className="text-gray-600 text-lg">Control inventory levels and stock management</p>
        </div>

        {/* Branch Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Branch</h2>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch.branchId} value={branch.branchId}>
                {branch.branchName} - {branch.address}
              </option>
            ))}
            </select>
              </div>
                {selectedBranchId && (
                  <>
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
          onChange={(e) => {
            const selectedValue = e.target.value;
            console.log('Selected value from dropdown:', selectedValue);
            setNewInventoryDrug({ ...newInventoryDrug, drugId: selectedValue });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          required
        >
          <option value="">Select Drug</option>
          {drugs.map((drug) => (
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
                  Inventory for {getBranchName(selectedBranchId)} ({filteredInventoryDrugs.length})
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
                {filteredInventoryDrugs.map(inventoryDrug => (
                  <div key={inventoryDrug.inventoryDrugId} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Drug Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <BeakerIcon className="h-5 w-5 mr-2 text-primary-500" />
                        {getDrugName(inventoryDrug.Id)}
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
                        onClick={() => handleDeleteInventoryDrug(inventoryDrug.inventoryDrugId)}
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
              {filteredInventoryDrugs.length === 0 && (
                <div className="text-center py-16">
                  <CubeTransparentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Inventory Items Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Start by adding drugs to your inventory.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editingDrug && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Inventory Item</h3>
              <div className="space-y-4">
              
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
                <p className="text-gray-600 mb-2">Drug: <strong>{editingDrug.drugName}</strong></p>

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
                  onClick={() => handleUpdateInventoryDrug(editingDrug.id, editingDrug)}
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

export default ManageInventoryDrugs;


