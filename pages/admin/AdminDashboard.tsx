import React, { useState } from 'react';
import { Screen } from '../../types';
import UserManager from './UserManager';
import RoleManager from './RoleManager';
import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import BundleManager from './BundleManager';
import OrderManager from './OrderManager';
import DiscountManager from './DiscountManager';
import BlogManager from './BlogManager';

type AdminTab = 'dashboard' | 'users' | 'roles' | 'categories' | 'products' | 'bundles' | 'orders' | 'discounts' | 'blogs';

interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void;
}

const MENU_ITEMS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: 'dashboard' },
  { key: 'users', label: 'Người dùng', icon: 'group' },
  { key: 'roles', label: 'Vai trò', icon: 'admin_panel_settings' },
  { key: 'categories', label: 'Danh mục', icon: 'category' },
  { key: 'products', label: 'Sản phẩm', icon: 'inventory_2' },
  { key: 'bundles', label: 'Combo/Bundle', icon: 'redeem' },
  { key: 'orders', label: 'Đơn hàng', icon: 'receipt_long' },
  { key: 'discounts', label: 'Mã giảm giá', icon: 'confirmation_number' },
  { key: 'blogs', label: 'Blog', icon: 'article' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return <UserManager />;
      case 'roles': return <RoleManager />;
      case 'categories': return <CategoryManager />;
      case 'products': return <ProductManager />;
      case 'bundles': return <BundleManager />;
      case 'orders': return <OrderManager />;
      case 'discounts': return <DiscountManager />;
      case 'blogs': return <BlogManager />;
      default: return <DashboardOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex-1 flex min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-white/5 transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">{sidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Back to store */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary transition-all`}
          >
            <span className="material-symbols-outlined text-xl">storefront</span>
            {sidebarOpen && <span>Về cửa hàng</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {MENU_ITEMS.find(m => m.key === activeTab)?.label || 'Tổng quan'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-surface-dark px-3 py-1.5 rounded-full">
              🎁 Tet Gift Commerce
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// ===== Dashboard Overview =====
interface DashboardOverviewProps {
  onTabChange: (tab: AdminTab) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onTabChange }) => {
  const cards: { key: AdminTab; title: string; icon: string; color: string; desc: string }[] = [
    { key: 'users', title: 'Người dùng', icon: 'group', color: 'from-blue-500 to-blue-600', desc: 'Quản lý tài khoản người dùng' },
    { key: 'roles', title: 'Vai trò', icon: 'admin_panel_settings', color: 'from-purple-500 to-purple-600', desc: 'Quản lý phân quyền' },
    { key: 'categories', title: 'Danh mục', icon: 'category', color: 'from-emerald-500 to-emerald-600', desc: 'Quản lý danh mục sản phẩm' },
    { key: 'products', title: 'Sản phẩm', icon: 'inventory_2', color: 'from-amber-500 to-amber-600', desc: 'Quản lý kho sản phẩm' },
    { key: 'bundles', title: 'Combo', icon: 'redeem', color: 'from-pink-500 to-pink-600', desc: 'Quản lý combo quà Tết' },
    { key: 'orders', title: 'Đơn hàng', icon: 'receipt_long', color: 'from-cyan-500 to-cyan-600', desc: 'Quản lý đơn hàng & trạng thái' },
    { key: 'discounts', title: 'Giảm giá', icon: 'confirmation_number', color: 'from-red-500 to-red-600', desc: 'Quản lý mã khuyến mãi' },
    { key: 'blogs', title: 'Blog', icon: 'article', color: 'from-indigo-500 to-indigo-600', desc: 'Quản lý bài viết & chủ đề' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Chào mừng đến Trang quản trị</h2>
        <p className="text-gray-500 dark:text-gray-400">Quản lý toàn bộ dữ liệu cửa hàng Quà Tết từ đây.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cards.map(card => (
          <button
            key={card.key}
            onClick={() => onTabChange(card.key)}
            className="text-left p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-white text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
