import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { BrandsPage } from '../pages/BrandsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { SupportPage } from '../pages/SupportPage';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

// Customer Dashboard Pages
import { ProfilePage } from '../pages/ProfilePage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { InvoicePage } from '../pages/InvoicePage';
import { AddressManagerPage } from '../pages/AddressManagerPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminBrandsPage } from '../pages/admin/AdminBrandsPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSupportPage } from '../pages/admin/AdminSupportPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />

        {/* Protected Customer Pages within Public Layout */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute pageName="shopping cart">
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute pageName="wishlist">
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute pageName="checkout">
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/success/:orderNumber"
          element={
            <ProtectedRoute pageName="order details">
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<SupportPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Customer Dashboard Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:orderNumber" element={<OrderDetailPage />} />
        <Route path="/orders/:orderNumber/invoice" element={<InvoicePage />} />
        <Route path="/addresses" element={<AddressManagerPage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="audit" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
