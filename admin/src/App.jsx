import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import AdminSidebar from './components/common/AdminSidebar';

import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AcademicStructurePage from './pages/AcademicStructurePage';
import NotesListPage from './pages/NotesListPage';
import NotesEditorPage from './pages/NotesEditorPage';
import PricingManagementPage from './pages/PricingManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import OrdersManagementPage from './pages/OrdersManagementPage';
import SupportManagementPage from './pages/SupportManagementPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route wrapper for Admin Portal
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F7] dark:bg-[#141414]">
        <div className="w-8 h-8 rounded-full border-3 border-brand-200 border-t-brand-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="flex min-h-screen bg-[#FBF9F7] dark:bg-[#141414] text-gray-900 dark:text-gray-100 font-sans transition-colors">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
};

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/academic"
          element={
            <ProtectedAdminRoute>
              <AcademicStructurePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedAdminRoute>
              <NotesListPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/notes/new"
          element={
            <ProtectedAdminRoute>
              <NotesEditorPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/notes/edit/:noteId"
          element={
            <ProtectedAdminRoute>
              <NotesEditorPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedAdminRoute>
              <PricingManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedAdminRoute>
              <UserManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedAdminRoute>
              <OrdersManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedAdminRoute>
              <SupportManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedAdminRoute>
              <SettingsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;
