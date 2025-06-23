import React, { useState, useEffect } from 'react';
import './css/BranchDashboard.css';
import InventoryManagement from './InventoryManagement';
import RequestsManagement from './RequestsManagement';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import logo from '../../icons/logo.png';

const BranchDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [branchInfo, setBranchInfo] = useState({
    name: 'Loading...',
    totalProducts: 0,
    pendingRequests: 0,
    totalEmployees: 0,
    monthlyRevenue: 0,
    stockValue: 0
  });
  const [companyLogo, setCompanyLogo] = useState(logo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // 1. Get branch info
        const branchResponse = await axios.get('http://localhost:8080/api/branches/branch-for-employee', {
          headers: { token }
        });
        const branchData = branchResponse.data.data;
        const branchId = branchData.branchId;
        const branchName = branchData.branchName || 'Branch Name';

        // Set branch name immediately
        setBranchInfo(prev => ({ ...prev, name: branchName }));

        if (branchId) {
          // 2. Fetch other data
          const [companyResponse, inventoryResponse, requestsResponse] = await Promise.all([
            axios.get(`http://localhost:8080/api/company/get/by-branch/${branchId}`, { headers: { token } }),
            axios.get(`http://localhost:8080/api/inventory-drugs/branch/${branchId}`, { headers: { token } }),
            axios.get('http://localhost:8080/api/request/get-all', { headers: { token } })
          ]);

          // Update logo
          if (companyResponse.data.data && companyResponse.data.data.logoUrl) {
            setCompanyLogo(companyResponse.data.data.logoUrl);
          }

          // Update stats
          const totalProducts = inventoryResponse.data.data ? inventoryResponse.data.data.length : 0;
          const pendingRequests = requestsResponse.data.data ? requestsResponse.data.data.filter(r => r.status === 'PENDING').length : 0;
          
          setBranchInfo(prev => ({
            ...prev,
            totalProducts,
            pendingRequests
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setBranchInfo(prev => ({ ...prev, name: 'Branch Name' })); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Products',
      value: branchInfo.totalProducts,
      icon: ArchiveBoxIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Requests',
      value: branchInfo.pendingRequests,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Employees',
      value: branchInfo.totalEmployees,
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(branchInfo.monthlyRevenue),
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Stock Value',
      value: formatCurrency(branchInfo.stockValue),
      icon: ChartBarIcon,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="branch-dashboard">
      {/* Branch Header */}
      <div className="dashboard-header-wrapper">
        <div className="dashboard-header">
          <div className="header-content flex items-center gap-4">
            <div className="branch-info flex items-center gap-4">
              <img src={companyLogo} alt="Company Logo" className="h-16 w-16 rounded-full shadow-md border-2 border-blue-200 object-cover" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{branchInfo.name}</h1>
                <p className="text-primary-500 text-lg">Branch Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <ArchiveBoxIcon className="tab-icon" />
            <span>Inventory Management</span>
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <ClipboardDocumentListIcon className="tab-icon" />
            <span>Requests Management</span>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'requests' && <RequestsManagement />}
      </div>
    </div>
  );
};

export default BranchDashboard; 