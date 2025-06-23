import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BeakerIcon, 
  CubeIcon, 
  TagIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDrugs: 0,
    totalCategories: 0,
    totalIngredients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { token };

        const [drugsRes, categoriesRes, ingredientsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/drugs', { headers }),
          axios.get('http://localhost:8080/api/category', { headers }),
          axios.get('http://localhost:8080/api/activeIngredient', { headers })
        ]);

        setStats({
          totalDrugs: drugsRes.data.data?.length || 0,
          totalCategories: categoriesRes.data.data?.length || 0,
          totalIngredients: ingredientsRes.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch system overview stats', error);
        // Keep stats at 0
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardItems = [
    {
      title: 'Manage Drugs',
      icon: BeakerIcon,
      path: '/admin-dashboard/manage-drugs',
      description: 'Add, edit, and manage drug inventory',
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Manage Active Ingredients',
      icon: CubeIcon,
      path: '/admin-dashboard/manage-active-ingredients',
      description: 'Control active ingredients database',
      color: 'from-success-500 to-success-600'
    },
    {
      title: 'Manage Categories',
      icon: TagIcon,
      path: '/admin-dashboard/manage-categories',
      description: 'Organize drug categories and classifications',
      color: 'from-accent-500 to-accent-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <ChartBarIcon className="h-12 w-12 text-primary-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your pharmacy system efficiently</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-10 w-10" />
                      <div className="text-right">
                        <div className="text-sm opacity-90">Management</div>
                        <div className="text-xs opacity-75">System</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="mt-4 flex items-center text-primary-500 text-sm font-medium group-hover:text-primary-700 transition-colors">
                      <span>Access Module</span>
                      <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <div className="text-3xl font-bold text-primary-600">{loading ? '...' : stats.totalDrugs}</div>
              <div className="text-gray-600 text-sm">Total Drugs</div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-xl">
              <div className="text-3xl font-bold text-success-600">{loading ? '...' : stats.totalCategories}</div>
              <div className="text-gray-600 text-sm">Categories</div>
            </div>
            <div className="text-center p-4 bg-accent-50 rounded-xl">
              <div className="text-3xl font-bold text-accent-600">{loading ? '...' : stats.totalIngredients}</div>
              <div className="text-gray-600 text-sm">Active Ingredients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
