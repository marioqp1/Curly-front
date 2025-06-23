import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BuildingOffice2Icon, 
  ShoppingCartIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getCompanyById, getCompanyBranches, getPendingRequestsCount, getEmployeesCount } from './Apis';
import { toast } from 'react-hot-toast';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({
    totalBranches: 0,
    pendingRequests: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const companyResponse = await getCompanyById();
        const companyId = companyResponse.data.data.companyId;

        const branchesResponse = await getCompanyBranches(companyId);
        const branches = branchesResponse.data.data || [];
        const branchIds = branches.map(b => b.branchId);

        let pendingRequests = 0;
        let totalEmployees = 0;

        if (branchIds.length > 0) {
          const [requestsResponse, employeesResponse] = await Promise.all([
            getPendingRequestsCount(branchIds),
            getEmployeesCount(branchIds)
          ]);
          pendingRequests = requestsResponse.data;
          totalEmployees = employeesResponse.data;
        }

        setStats({
          totalBranches: branches.length,
          pendingRequests,
          totalEmployees
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Couldn't load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    {
      title: 'Company Profile',
      description: 'View and edit your company and account owner information',
      icon: BuildingOffice2Icon,
      link: '/company/profile',
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Manage Branches',
      description: 'Add, edit, and manage your pharmacy branches',
      icon: BuildingOffice2Icon,
      link: '/company/branches',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Branch Inventory',
      description: 'Manage drug inventory across all branches',
      icon: ShoppingCartIcon,
      link: '/company/inventory',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Branch Requests',
      description: 'View and manage customer requests',
      icon: ClipboardDocumentListIcon,
      link: '/company/requests',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Employee Management',
      description: 'Manage branch employees and roles',
      icon: UserGroupIcon,
      link: '/company/employees',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Company Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Welcome to your company dashboard. Manage your branches, inventory, requests, and employees all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
                   style={{ backgroundImage: `linear-gradient(to right, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})` }}>
              </div>
              
              <div className="relative p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-r ${item.color} mb-4`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors duration-300">
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ backgroundImage: `linear-gradient(to right, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})` }}>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalBranches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">New inventory item added to Main Branch</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">New employee registered at North Branch</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">New request received at South Branch</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
