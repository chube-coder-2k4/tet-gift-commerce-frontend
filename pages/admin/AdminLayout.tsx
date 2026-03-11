import React from 'react';
import { AdminScreen } from '../../types';
import { Screen } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentScreen: AdminScreen;
  onNavigate: (screen: AdminScreen) => void;
  onExit: () => void;
}

const menuItems: { id: AdminScreen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'users', label: 'Quản lý Users', icon: 'group' },
  { id: 'products', label: 'Quản lý Sản phẩm', icon: 'inventory_2' },
  { id: 'categories', label: 'Danh mục', icon: 'category' },
  { id: 'orders', label: 'Quản lý Đơn hàng', icon: 'shopping_cart' },
  { id: 'payments', label: 'Thanh toán', icon: 'payments' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentScreen,
  onNavigate,
  onExit,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-card-dark border-r border-gray-200 dark:border-[#3a3330]/60 transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#3a3330]/60">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-glow">
                <span className="text-white font-serif font-bold text-lg">T</span>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                Admin
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400"
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                currentScreen === item.id
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Exit Button */}
        <div className="p-3 border-t border-gray-200 dark:border-[#3a3330]/60">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {sidebarOpen && <span className="font-medium text-sm">Thoát Admin</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Header */}
        <header className="h-16 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-[#3a3330]/60 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-serif font-semibold text-gray-900 dark:text-white capitalize">
              {menuItems.find((m) => m.id === currentScreen)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-primary/50 text-sm"
              />
            </div>
            {/* Notifications */}
            <button className="relative size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 size-2 bg-primary rounded-full"></span>
            </button>
            {/* Admin Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-[#3a3330]/60">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
