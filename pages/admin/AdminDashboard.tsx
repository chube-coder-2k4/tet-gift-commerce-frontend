import React, { useState } from 'react';
import { Screen } from '../../types';
import { chatbotApi } from '../../services/chatbotApi';
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
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSyncEmbeddings = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await chatbotApi.syncEmbeddings();
      setSyncResult({
        success: true,
        message: `Đồng bộ thành công! ${res.data.productsEmbedded} sản phẩm, ${res.data.bundlesEmbedded} combo đã được embedded.`,
      });
    } catch {
      setSyncResult({
        success: false,
        message: 'Đồng bộ embeddings thất bại. Vui lòng thử lại.',
      });
    } finally {
      setSyncLoading(false);
    }
  };

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

      {/* AI Embeddings Sync */}
      <div className="mt-8 p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đồng bộ AI Chatbot</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật embeddings cho AI tìm kiếm sản phẩm chính xác hơn</p>
            </div>
          </div>
          <button
            onClick={handleSyncEmbeddings}
            disabled={syncLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span className={`material-symbols-outlined text-lg ${syncLoading ? 'animate-spin' : ''}`}>
              {syncLoading ? 'progress_activity' : 'sync'}
            </span>
            {syncLoading ? 'Đang đồng bộ...' : 'Đồng bộ AI'}
          </button>
        </div>
        {syncResult && (
          <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${
            syncResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
          }`}>
            <span className="material-symbols-outlined text-base align-middle mr-1">
              {syncResult.success ? 'check_circle' : 'error'}
            </span>
            {syncResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
