import React, { useState } from 'react';
import { Screen, User } from '../../../types';

interface HeaderActionsProps {
  onNavigate: (screen: Screen) => void;
  user: User | null;
  onLogout: () => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ onNavigate, user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <button 
        className="hidden md:flex items-center justify-center size-9 text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white transition-colors"
        aria-label="Search"
      >
        <span className="material-symbols-outlined text-[22px]">search</span>
      </button>
      
      <button 
        onClick={() => onNavigate('cart')}
        className="hidden sm:flex items-center justify-center size-9 text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white transition-colors relative"
        aria-label="Shopping cart"
      >
        <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
        <span className="absolute top-1 right-0 size-2 bg-gold dark:bg-primary rounded-full ring-2 ring-white dark:ring-background-dark"></span>
      </button>
      
      {user ? (
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-gold dark:bg-white text-primary dark:text-background-dark hover:bg-accent dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
          >
            <div className="size-6 rounded-full bg-primary dark:bg-background-dark flex items-center justify-center text-white dark:text-gold text-xs font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-sm font-bold max-w-[100px] truncate">{user.name}</span>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-[60]" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-[70]">
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">person</span>
                  <span className="font-medium">Tài khoản của tôi</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('cart');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">shopping_bag</span>
                  <span className="font-medium">Đơn hàng của tôi</span>
                </button>
                <hr className="my-2 border-gray-200 dark:border-white/10" />
                <button
                  onClick={() => {
                    onLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button 
          onClick={() => onNavigate('login')}
          className="hidden sm:flex px-5 py-2 rounded-full bg-gold dark:bg-white text-primary dark:text-background-dark text-sm font-bold hover:bg-accent dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
        >
          Đăng nhập
        </button>
      )}
    </>
  );
};
