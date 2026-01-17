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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
      
      {/* Lantern Decorations */}
      <div className="absolute left-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center' }}>
          <div className="w-6 h-8 bg-gradient-to-b from-primary to-red-700 rounded-lg shadow-lg border-2 border-accent/30 relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-accent rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-accent/80 rounded-b-lg"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute right-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center', animationDelay: '0.5s' }}>
          <div className="w-6 h-8 bg-gradient-to-b from-accent to-yellow-600 rounded-lg shadow-lg border-2 border-primary/30 relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-primary rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-primary/80 rounded-b-lg"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
            <div className="relative size-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary via-red-600 to-red-900 shadow-glow group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl animate-pulse">redeem</span>
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 size-2 bg-accent rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="relative">
            <h2 className="text-xl font-display font-bold tracking-tight dark:text-white text-gray-900">
              Tet<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-accent animate-gradient">Gifts</span>
            </h2>
            {/* Chinese character decoration */}
            <div className="absolute -top-2 -right-6 text-[10px] text-primary/40 font-serif rotate-12 hidden xl:block">春</div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <a onClick={() => onNavigate('about')}
             className={`text-sm font-medium transition-colors cursor-pointer nav-link relative
               ${currentScreen === 'about' ? 'text-primary' : 'text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-white'}
             `}
          >
            Giới thiệu
          </a>
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
           {['Giới thiệu', 'Hộp quà', 'Giỏ quà', 'Túi quà', 'Rượu Tết', 'Tin tức'].map((item) => (
            <a key={item} 
               onClick={() => {
                 if (item === 'Tin tức') onNavigate('blog');
                 else if (item === 'Giới thiệu') onNavigate('about');
                 else onNavigate('shop');
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
        {/* Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 pb-16 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Giao hàng nhanh</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Nội thành 2-4h</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-accent text-xl">verified_user</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Chính hãng 100%</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cam kết hàng thật</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">currency_exchange</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Đổi trả dễ dàng</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Trong vòng 7 ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-accent text-xl">support_agent</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Hỗ trợ 24/7</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tư vấn nhiệt tình</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center bg-primary rounded-md text-white">
                <span className="material-symbols-outlined text-lg">redeem</span>
              </div>
              <h2 className="text-gray-900 dark:text-white text-xl font-display font-bold">Tet<span className="text-primary">Gifts</span></h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
              Chuyên cung cấp quà tết cao cấp, giỏ quà tết, hộp quà tết ý nghĩa cho doanh nghiệp và gia đình. Sản phẩm chất lượng, giao hàng toàn quốc.
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                <span className="text-gray-600 dark:text-gray-400">FPT University, Quận 9, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">call</span>
                <a href="tel:1900xxxx" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">1900 6969 (8h-22h)</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <a href="mailto:info@tetgifts.vn" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">info@tetgifts.vn</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Về Chúng Tôi</h3>
            {[
              'Câu chuyện thương hiệu', 
              'Tin tức & Sự kiện', 
              'Liên hệ hợp tác',
              'Điều khoản sử dụng',
              'Chính sách bảo mật'
            ].map(item => (
              <a key={item} href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm transition-colors w-fit">{item}</a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Hỗ Trợ</h3>
            {[
              'Hướng dẫn mua hàng', 
              'Chính sách giao hàng', 
              'Chính sách đổi trả', 
              'Câu hỏi thường gặp',
              'Tra cứu đơn hàng'
            ].map(item => (
              <a key={item} href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm transition-colors w-fit">{item}</a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Danh Mục</h3>
            {[
              'Hộp quà Tết cao cấp',
              'Giỏ quà Tết doanh nghiệp',
              'Túi quà Tết gia đình',
              'Set quà Tết truyền thống',
              'Quà Tết sức khỏe',
            ].map(item => (
              <a key={item} href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm transition-colors w-fit">{item}</a>
            ))}
          </div>
        </div>

      

        {/* Store Location Map */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-12 pb-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vị Trí Cửa Hàng</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">FPT University, Quận 9, TP. Hồ Chí Minh</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg h-[400px] group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4544388163936!2d106.80921857570997!3d10.84535215788081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1svi!2s!4v1705234567890!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-500"
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Thông Tin Liên Hệ</h4>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
                <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-xl">storefront</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Địa chỉ cửa hàng</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">FPT University, Quận 9, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
                <div className="size-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-accent text-xl">schedule</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Giờ mở cửa</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
                  <p className="text-xs text-accent mt-1">Tết Nguyên Đán: 9:00 - 20:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-colors group">
                <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-xl">call</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">Hotline hỗ trợ</div>
                  <a href="tel:1900xxxx" className="text-sm text-primary font-semibold hover:underline">1900 6969</a>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hỗ trợ 24/7 - Tư vấn miễn phí</p>
                </div>
              </div>

              <button className="mt-2 w-full px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-lg">directions</span>
                Chỉ Đường Đến Cửa Hàng
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center md:text-left">© 2026 TetGifts. All rights reserved. Designed with passion for Vietnamese culture.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            <span>|</span>
            <a href="#" className="hover:text-primary transition-colors">RSS</a>
            <span>|</span>
            <a href="#" className="hover:text-primary transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
