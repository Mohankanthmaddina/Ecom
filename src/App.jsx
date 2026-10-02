import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Categories from './components/Categories';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Success from './components/Success';
import UserDashboard from './components/UserDashboard';
import OrderHistory from './components/OrderHistory';
import OrderDetails from './components/OrderDetails';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProductList from './components/admin/AdminProductList';
import AdminCategoryList from './components/admin/AdminCategoryList';
import AdminOrderList from './components/admin/AdminOrderList';
import AdminUserList from './components/admin/AdminUserList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homepage" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/search-results" element={<ProductList />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/success/:orderId" element={<Success />} />

        {/* User Account Routes */}
        <Route path="/profile" element={<ProtectedRoute requiredRole="USER"><UserDashboard /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute requiredRole="USER"><UserProfile /></ProtectedRoute>} />
        <Route path="/profile/orders" element={<ProtectedRoute requiredRole="USER"><OrderHistory /></ProtectedRoute>} />
        <Route path="/profile/orders/:orderId" element={<ProtectedRoute requiredRole="USER"><OrderDetails /></ProtectedRoute>} />

        {/* Admin Workspace Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProductList /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requiredRole="ADMIN"><AdminCategoryList /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requiredRole="ADMIN"><AdminOrderList /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUserList /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
