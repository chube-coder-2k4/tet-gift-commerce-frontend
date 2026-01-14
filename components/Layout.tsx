import React, { useState, useEffect } from 'react';
import { Screen } from '../types';

interface NavProps {
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

export const Header: React.FC<NavProps> = ({ onNavigate, currentScreen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="size-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-red-900 shadow-glow">
            <span className="material-symbols-outlined text-white text-xl">redeem</span>
          </div>
          <h2 className="text-xl font-display font-bold tracking-tight dark:text-white text-gray-900">Tet<span className="text-primary">Gifts</span></h2>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {['Hộp quà', 'Giỏ quà', 'Túi quà', 'Rượu Tết'].map((item) => (
            <a key={item} 
               onClick={() => onNavigate('shop')}
               className={`text-sm font-medium transition-colors cursor-pointer nav-link relative
                 ${currentScreen === 'shop' ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white'}
               `}
            >
              {item}
            </a>
          ))}
          <a onClick={() => onNavigate('blog')}
             className={`text-sm font-medium transition-colors cursor-pointer nav-link relative
               ${currentScreen === 'blog' ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white'}
             `}
          >
            Tin tức
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center justify-center size-9 text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <button className="hidden md:flex items-center justify-center size-9 text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          
          <button 
            onClick={() => onNavigate('cart')}
            className="hidden sm:flex items-center justify-center size-9 text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            <span className="absolute top-1 right-0 size-2 bg-primary rounded-full ring-2 ring-white dark:ring-background-dark"></span>
          </button>
          
          <button 
            onClick={() => onNavigate('login')}
            className="hidden sm:flex px-5 py-2 rounded-full bg-primary/10 dark:bg-white text-primary dark:text-background-dark text-sm font-bold hover:bg-primary/20 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            Đăng nhập
          </button>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden flex items-center justify-center text-gray-900 dark:text-white">
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/10 p-4 flex flex-col gap-4 animate-fade-in">
           {['Hộp quà', 'Giỏ quà', 'Túi quà', 'Rượu Tết', 'Tin tức'].map((item) => (
            <a key={item} 
               onClick={() => {
                 onNavigate(item === 'Tin tức' ? 'blog' : 'shop');
                 setIsMenuOpen(false);
               }}
               className="text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-primary"
            >
              {item}
            </a>
          ))}
          <button 
            onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
            className="w-full py-3 rounded-lg bg-primary text-white font-bold"
          >
            Đăng nhập
          </button>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-surface-darker pt-20 pb-10 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center bg-primary rounded-md text-white">
                <span className="material-symbols-outlined text-lg">redeem</span>
              </div>
              <h2 className="text-gray-900 dark:text-white text-xl font-display font-bold">Tet<span className="text-primary">Gifts</span></h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
              Chuyên cung cấp quà tết cao cấp, giỏ quà tết, hộp quà tết ý nghĩa cho doanh nghiệp và gia đình.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Về Chúng Tôi</h3>
            {['Câu chuyện thương hiệu', 'Tin tức & Sự kiện', 'Tuyển dụng', 'Liên hệ hợp tác'].map(item => (
              <a key={item} href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm transition-colors w-fit">{item}</a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Hỗ Trợ</h3>
            {['Hướng dẫn mua hàng', 'Chính sách giao hàng', 'Chính sách đổi trả', 'Bảo mật thông tin'].map(item => (
              <a key={item} href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm transition-colors w-fit">{item}</a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Đăng Ký Nhận Tin</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Nhận thông tin ưu đãi mới nhất.</p>
            <div className="flex flex-col gap-3">
              <input type="email" placeholder="Email của bạn" className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary w-full transition-colors" />
              <button className="bg-primary text-white font-bold px-4 py-3 rounded-lg text-sm hover:bg-red-700 transition-colors w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">© 2024 Tet Gifts. Designed with passion.</p>
        </div>
      </div>
    </footer>
  );
};
