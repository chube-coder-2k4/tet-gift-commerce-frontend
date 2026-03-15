import React from 'react';
import { Screen } from '../../../types';

interface NavigationProps {
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentScreen }) => {
  return (
    <nav className="hidden lg:flex items-center gap-8">
      <a 
        onClick={() => onNavigate('about')}
        className={`text-sm font-medium transition-colors cursor-pointer nav-link relative
          ${currentScreen === 'about' ? 'text-gold dark:text-primary' : 'text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white'}
        `}
      >
        Giới thiệu
      </a>
      {[
        { label: 'Hộp quà', category: 'Hộp quà' },
        { label: 'Giỏ quà', category: 'Giỏ quà' },
        { label: 'Túi quà', category: 'Túi quà' },
        { label: 'Rượu Tết', category: 'Rượu Tết' },
      ].map((item) => (
        <a 
          key={item.label} 
          onClick={() => onNavigate('shop')}
          className="text-sm font-medium transition-colors cursor-pointer nav-link relative text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white"
        >
          {item.label}
        </a>
      ))}
      <a 
        onClick={() => onNavigate('blog')}
        className={`text-sm font-medium transition-colors cursor-pointer nav-link relative
          ${currentScreen === 'blog' ? 'text-gold dark:text-primary' : 'text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white'}
        `}
      >
        Tin tức
      </a>
    </nav>
  );
};
