import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/signin-signup/Signup';
import Login from './components/signin-signup/Login';
import DrugDetails from './components/user_view/DrugDetails';
import CategoriesPage from './components/user_view/CategoriesPage';
import DrugsPage from './components/user_view/DrugsPage';
import AdminDashboard from './components/admin_dashboard/AdminDashboard';
import ManageDrugs from './components/admin_dashboard/ManageDrugs';
import ManageActiveIngredients from './components/admin_dashboard/ManageActiveIngredients';
import ManageCategories from './components/admin_dashboard/ManageCategories';
import ManageBranches from './components/company_dashboard/ManageBranches';
import CompanyDashboard from './components/company_dashboard/CompanyDashboard';
import ManageInventoryDrugs from './components/company_dashboard/ManageInventoryDrugs';
import Navbar from './components/navbar/Navbar';
import CartPage from './components/cart/CartPage';
import LoginHistory from './components/orders/Orders';
import Profile from './components/profile/Profile';
import HomePage from './components/user_view/HomePage';
import WishlistPage from './components/user_view/WishlistPage';
import OrdersManagement from './components/company_dashboard/OrdersManagement';
import OrderStatus from './components/user_view/OrderStatus';
import BranchRequests from './components/company_dashboard/BranchRequests';
import RequestStatus from './components/user_view/RequestStatus';
import BranchManagement from './components/company_dashboard/BranchManagement';
import BranchInventory from './components/company_dashboard/BranchInventory';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import CompanyProfile from './components/company_dashboard/CompanyProfile';
import BranchDashboard from './components/branch_dashboard/BranchDashboard';
import ForgotPassword from './components/signin-signup/ForgotPassword';
import ResetPassword from './components/signin-signup/ResetPassword';
import PrescriptionReader from './components/user_view/PrescriptionReader';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <ToastContainer />
        <Toaster position="top-right" />
        
        <Routes>
          {/* Define your routes here */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<DrugsPage />} />
          <Route path="/drug/details/:drugId" element={<DrugDetails />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/manage-drugs" element={<ManageDrugs />} />
          <Route path="/admin-dashboard/manage-active-ingredients" element={<ManageActiveIngredients />} />
          <Route path="/admin-dashboard/manage-categories" element={<ManageCategories />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/branches" element={<ManageBranches />} />
          <Route path="/company/inventory" element={<BranchInventory />} />
          <Route path="/company/requests" element={<BranchRequests />} />
          <Route path="/company/employees" element={<BranchManagement />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<LoginHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/company/orders" element={<OrdersManagement />} />
          <Route path="/orders/:orderId" element={<OrderStatus />} />
          <Route path="/requests" element={<RequestStatus />} />
          <Route path="/branch/dashboard" element={<BranchDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/prescription-reader" element={<PrescriptionReader />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
