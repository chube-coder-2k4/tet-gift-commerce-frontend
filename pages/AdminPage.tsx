import React, { useState } from 'react';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import UserManagement from './admin/UserManagement';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import PaymentManagement from './admin/PaymentManagement';
import { AdminScreen, Screen } from '../types';

interface AdminPageProps {
  onNavigate: (screen: Screen) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [currentAdminScreen, setCurrentAdminScreen] = useState<AdminScreen>('dashboard');

  const handleAdminNavigate = (screen: AdminScreen) => {
    setCurrentAdminScreen(screen);
  };

  const renderAdminContent = () => {
    switch (currentAdminScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'categories':
        return <CategoryManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout
      currentScreen={currentAdminScreen}
      onNavigate={handleAdminNavigate}
      onExit={() => onNavigate('home')}
    >
      {renderAdminContent()}
    </AdminLayout>
  );
};

export default AdminPage;
