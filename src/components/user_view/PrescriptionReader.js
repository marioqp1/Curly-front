import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  ArrowUpTrayIcon, 
  XMarkIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const PrescriptionReader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [matchingDrugs, setMatchingDrugs] = useState([]);
  const [searchingDrugs, setSearchingDrugs] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});
  const [cartMessage, setCartMessage] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Sending file:', selectedFile.name, 'Size:', selectedFile.size);
      
      const response = await axios.post('http://localhost:8000/analyze-image', formData);

      console.log('API Response:', response.data);

      if (response.data.success) {
        setAnalysis(response.data);
        
        // Extract drug names and search for matching drugs in inventory
        const drugNames = formatAnalysis(response.data.analysis);
        if (drugNames.length > 0) {
          await searchMatchingDrugs(drugNames);
        }
      } else {
        setError('Failed to analyze the prescription');
      }
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      
      // More specific error messages
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          setError('Invalid file format. Please upload an image file.');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error: ${error.response.data?.detail || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError('Failed to analyze the prescription. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    setMatchingDrugs([]);
    setCartMessage('');
  };

  const formatAnalysis = (analysisText) => {
    if (!analysisText) return [];
    
    // Handle comma-separated drug names (new format)
    if (analysisText.includes(',')) {
      return analysisText
        .split(',')
        .map(drug => drug.trim())
        .filter(drug => drug.length > 0)
        .map(drug => {
          // Clean up drug names - remove common prefixes/suffixes
          return drug
            .replace(/^(take|use|apply|administer)\s+/i, '') // Remove action words
            .replace(/\s+(tablet|capsule|syrup|drops|cream|ointment|gel|injection|oral|topical)$/i, '') // Remove dosage forms
            .replace(/\s+\d+\s*(mg|ml|mcg|units?)$/i, '') // Remove dosage amounts
            .replace(/^\d+\s*[-.]?\s*/, '') // Remove leading numbers
            .replace(/\s*[-.]?\s*\d+$/, '') // Remove trailing numbers
            .trim();
        })
        .filter(drug => drug.length > 2); // Final filter for very short lines
    }
    
    // Handle newline-separated drug names (old format)
    let lines = analysisText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\*\s*/, '')); // Remove leading asterisk and spaces
    
    // Filter out common non-drug terms and clean up drug names
    const filteredLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Skip common non-drug terms
      const skipTerms = [
        'prescription', 'doctor', 'pharmacy', 'date', 'patient', 'name', 'address',
        'phone', 'email', 'signature', 'dosage', 'instructions', 'take', 'times',
        'daily', 'weekly', 'monthly', 'refill', 'quantity', 'tablets', 'capsules',
        'mg', 'ml', 'mcg', 'units', 'tablet', 'capsule', 'syrup', 'drops',
        'cream', 'ointment', 'gel', 'injection', 'inject', 'oral', 'topical'
      ];
      
      // Skip if line contains only these terms
      if (skipTerms.some(term => lowerLine.includes(term) && line.length < 20)) {
        return false;
      }
      
      // Skip very short lines (likely not drug names)
      if (line.length < 3) {
        return false;
      }
      
      return true;
    });
    
    // Clean up drug names - remove common prefixes/suffixes
    return filteredLines.map(line => {
      return line
        .replace(/^(take|use|apply|administer)\s+/i, '') // Remove action words
        .replace(/\s+(tablet|capsule|syrup|drops|cream|ointment|gel|injection|oral|topical)$/i, '') // Remove dosage forms
        .replace(/\s+\d+\s*(mg|ml|mcg|units?)$/i, '') // Remove dosage amounts
        .replace(/^\d+\s*[-.]?\s*/, '') // Remove leading numbers
        .replace(/\s*[-.]?\s*\d+$/, '') // Remove trailing numbers
        .trim();
    }).filter(line => line.length > 2); // Final filter for very short lines
  };

  // Search for matching drugs in inventory
  const searchMatchingDrugs = async (drugNames) => {
    setSearchingDrugs(true);
    setMatchingDrugs([]);
    
    try {
      // Get all drugs from the system
      const allDrugsResponse = await axios.get('http://localhost:8080/api/drugs-view/featured-drugs');
      const allDrugs = allDrugsResponse.data.data || [];
      
      console.log('All drugs from system:', allDrugs.length);
      
      const matchingDrugsList = [];
      
      // Search for each extracted drug name in the system
      for (const extractedDrugName of drugNames) {
        const cleanDrugName = extractedDrugName.toLowerCase().trim();
        
        // Find matching drugs in the system
        const matches = allDrugs.filter(drug => {
          const drugName = drug.drugName?.toLowerCase() || '';
          const description = drug.description?.toLowerCase() || '';
          const companyName = drug.companyName?.toLowerCase() || '';
          
          // Check if the extracted drug name is contained in any of the drug fields
          return drugName.includes(cleanDrugName) || 
                 description.includes(cleanDrugName) || 
                 companyName.includes(cleanDrugName) ||
                 cleanDrugName.includes(drugName.split(' ')[0]); // Partial match with first word
        });
        
        console.log(`Found ${matches.length} matches for "${extractedDrugName}"`);
        
        // Add matching drugs to the list
        matchingDrugsList.push(...matches);
      }
      
      // Remove duplicates based on drugId
      const uniqueMatches = matchingDrugsList.filter((drug, index, self) => 
        index === self.findIndex(d => d.drugId === drug.drugId)
      );
      
      console.log('Total unique matches found:', uniqueMatches.length);
      setMatchingDrugs(uniqueMatches);
      
    } catch (error) {
      console.error('Error searching for matching drugs:', error);
    } finally {
      setSearchingDrugs(false);
    }
  };

  // Add drug to cart
  const handleAddToCart = async (drug) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartMessage('Please log in to add items to cart');
      setTimeout(() => setCartMessage(''), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [drug.drugId]: true }));
    setCartMessage('');

    try {
      const item = {
        drugId: drug.drugId,
        quantity: 1,
      };

      await axios.post('http://localhost:8080/api/items/save', item, {
        headers: { token }
      });

      setCartMessage(`${drug.drugName} added to cart successfully!`);
      setTimeout(() => setCartMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMessage('Failed to add drug to cart');
      setTimeout(() => setCartMessage(''), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [drug.drugId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beta Warning Banner */}
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Beta Feature - Limited Accuracy
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  This prescription reader is currently in beta testing. While we strive for accuracy, 
                  the AI analysis may not be 100% reliable. Please:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Verify the detected drugs match your prescription</li>
                  <li>Check drug details before adding to cart</li>
                  <li>Consult with your pharmacist if unsure</li>
                  <li>Contact support if you notice any errors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-12 w-12 text-primary-600 dark:text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prescription Reader
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a prescription image and we'll analyze it to extract the drug names
          </p>
        </div>

        {/* Cart Message */}
        {cartMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
            {cartMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Prescription
            </h2>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-yellow-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg"
                    />
                    <div className="flex items-center justify-center space-x-2">
                      <PhotoIcon className="h-5 w-5 text-primary-600 dark:text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Click to change image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ArrowUpTrayIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Upload prescription image
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="flex-1 bg-primary-600 dark:bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze Prescription'
                )}
              </button>
              
              {selectedFile && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Analysis Results
            </h2>

            {analysis ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Analysis Complete
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Found {formatAnalysis(analysis.analysis).length} drug(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Detected Drugs:
                  </h3>
                  <div className="space-y-2">
                    {formatAnalysis(analysis.analysis).map((drug, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 bg-primary-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600 dark:text-yellow-400">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {drug}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.filename && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-medium">File:</span> {analysis.filename}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Upload and analyze a prescription to see results here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Matching Drugs Section */}
        {matchingDrugs.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available in Our Store
              </h2>
              {searchingDrugs && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                  Searching inventory...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingDrugs.map((drug) => (
                <div
                  key={drug.drugId}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {drug.drugName}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {drug.companyName}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary-600 dark:text-yellow-400 font-semibold">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">{drug.price}</span>
                        </div>
                        <div className="flex items-center">
                          {drug.available ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">In Stock</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">Out of Stock</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {drug.available && (
                    <button
                      onClick={() => handleAddToCart(drug)}
                      disabled={addingToCart[drug.drugId]}
                      className="w-full flex items-center justify-center py-2 px-3 bg-primary-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {addingToCart[drug.drugId] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon className="h-4 w-4 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {matchingDrugs.length === 0 && !searchingDrugs && analysis && (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No matching drugs found in our inventory
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Try searching manually or contact our support
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
            How to use:
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200 mr-3 mt-0.5">
                1
              </span>
              Take a clear photo of your prescription or upload an existing image
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200 mr-3 mt-0.5">
                2
              </span>
              Click "Analyze Prescription" to process the image
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200 mr-3 mt-0.5">
                3
              </span>
              View the detected drug names in the results section
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionReader; 