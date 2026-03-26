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
import DashboardStats from './DashboardStats';
import SettingManager from './SettingManager';

type AdminTab = 'dashboard' | 'users' | 'roles' | 'categories' | 'products' | 'bundles' | 'orders' | 'discounts' | 'blogs' | 'settings';

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
  { key: 'settings', label: 'Cài đặt', icon: 'settings' },
];

// Quick action card color mappings for Tết theme
const QUICK_CARD_COLORS: Record<string, { from: string; to: string }> = {
  users: { from: '#D4230A', to: '#B01C08' },
  roles: { from: '#9B59B6', to: '#7D3C98' },
  categories: { from: '#27AE60', to: '#1E8449' },
  products: { from: '#F5A623', to: '#E8961D' },
  bundles: { from: '#D4230A', to: '#F5A623' },
  orders: { from: '#2980B9', to: '#1F618D' },
  discounts: { from: '#E74C3C', to: '#C0392B' },
  blogs: { from: '#8E44AD', to: '#6C3483' },
  settings: { from: '#7F8C8D', to: '#34495E' },
};

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
      case 'settings': return <SettingManager />;
      default: return <DashboardOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="admin-tet-theme flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className={`admin-tet-sidebar ${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(201,169,138,0.15)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏮</span>
              <span className="text-lg font-black" style={{ color: '#FFD700' }}>Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#C9A98A' }}
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
              className={`admin-tet-menu-item w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium ${
                activeTab === item.key ? 'active' : ''
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Back to store */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(201,169,138,0.15)' }}>
          <button
            onClick={() => onNavigate('home')}
            className="admin-tet-menu-item w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium"
          >
            <span className="material-symbols-outlined">storefront</span>
            {sidebarOpen && <span>Về cửa hàng</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ background: '#FDF6EC' }}>
        {/* Top Bar */}
        <div className="admin-tet-topbar h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">
              {MENU_ITEMS.find(m => m.key === activeTab)?.label || 'Tổng quan'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="admin-brand-badge text-xs font-medium px-3 py-1.5 rounded-full">
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

  const cards: { key: AdminTab; title: string; icon: string; desc: string }[] = [
    { key: 'users', title: 'Người dùng', icon: 'group', desc: 'Quản lý tài khoản người dùng' },
    { key: 'roles', title: 'Vai trò', icon: 'admin_panel_settings', desc: 'Quản lý phân quyền' },
    { key: 'categories', title: 'Danh mục', icon: 'category', desc: 'Quản lý danh mục sản phẩm' },
    { key: 'products', title: 'Sản phẩm', icon: 'inventory_2', desc: 'Quản lý kho sản phẩm' },
    { key: 'bundles', title: 'Combo', icon: 'redeem', desc: 'Quản lý combo quà Tết' },
    { key: 'orders', title: 'Đơn hàng', icon: 'receipt_long', desc: 'Quản lý đơn hàng & trạng thái' },
    { key: 'discounts', title: 'Giảm giá', icon: 'confirmation_number', desc: 'Quản lý mã khuyến mãi' },
    { key: 'blogs', title: 'Blog', icon: 'article', desc: 'Quản lý bài viết & chủ đề' },
    { key: 'settings', title: 'Cài đặt', icon: 'settings', desc: 'Cấu hình hệ thống & nhạc nền' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#2D1810' }}>
          🏮 Chào mừng đến Trang quản trị
        </h2>
        <p style={{ color: '#8B6355' }}>Quản lý toàn bộ dữ liệu cửa hàng Quà Tết từ đây.</p>
      </div>

      {/* Revenue Charts, Top Products & Top Customers */}
      <DashboardStats />

      {/* Quick Access Cards */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#2D1810' }}>
          <span className="material-symbols-outlined" style={{ color: '#D4230A' }}>apps</span>
          Quản lý nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cards.map(card => {
            const colors = QUICK_CARD_COLORS[card.key] || { from: '#D4230A', to: '#B01C08' };
            return (
              <button
                key={card.key}
                onClick={() => onTabChange(card.key)}
                className="admin-quick-card text-left p-5 group"
              >
                <div
                  className="quick-icon mb-4 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                >
                  <span className="material-symbols-outlined text-white text-2xl">{card.icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#2D1810' }}>{card.title}</h3>
                <p className="text-sm" style={{ color: '#8B6355' }}>{card.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Embeddings Sync */}
      <div className="admin-sync-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #D4230A, #F5A623)' }}
            >
              <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#2D1810' }}>Đồng bộ AI Chatbot</h3>
              <p className="text-sm" style={{ color: '#8B6355' }}>Cập nhật embeddings cho AI tìm kiếm sản phẩm chính xác hơn</p>
            </div>
          </div>
          <button
            onClick={handleSyncEmbeddings}
            disabled={syncLoading}
            className="admin-sync-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
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
