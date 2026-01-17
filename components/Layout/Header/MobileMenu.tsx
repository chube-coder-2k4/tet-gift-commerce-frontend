import React from 'react';
import { Screen } from '../../../types';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (screen: Screen) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onToggle, onNavigate }) => {
  const handleNavigation = (item: string) => {
    if (item === 'Tin tức') onNavigate('blog');
    else if (item === 'Giới thiệu') onNavigate('about');
    else onNavigate('shop');
    onToggle();
  };

  return (
    <>
      <button 
        onClick={onToggle} 
        className="lg:hidden flex items-center justify-center text-white/90 dark:text-white"
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-[26px]">menu</span>
      </button>
      
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-surface-dark border-b border-primary/20 dark:border-white/10 shadow-xl p-4 flex flex-col gap-4 animate-fade-in">
          {['Giới thiệu', 'Hộp quà', 'Giỏ quà', 'Túi quà', 'Rượu Tết', 'Tin tức'].map((item) => (
            <a 
              key={item} 
              onClick={() => handleNavigation(item)}
              className="text-text-light-main dark:text-gray-300 font-medium py-2 hover:text-primary dark:hover:text-white cursor-pointer transition-colors"
            >
              {item}
            </a>
          ))}
          <button 
            onClick={() => { 
              onNavigate('login'); 
              onToggle(); 
            }}
            className="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-red-600 transition-colors shadow-md"
          >
            Đăng nhập
          </button>
        </div>
      )}
    </>
  );
};
