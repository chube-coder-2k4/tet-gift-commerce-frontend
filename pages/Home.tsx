import React from 'react';
import { PRODUCTS } from '../constants';
import { Screen } from '../types';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  onProductClick: (id: number) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onProductClick }) => {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">Chào Xuân Giáp Thìn 2026</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-medium leading-[1.1] text-gray-900 dark:text-white tracking-tight">
              Trao Gửi <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent">Yêu Thương</span> <br />
              Tết Vẹn Tròn
            </h1>
            <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed max-w-lg font-light">
              Bộ sưu tập quà Tết cao cấp, mang đậm hương vị truyền thống kết hợp sự sang trọng hiện đại. Đẳng cấp trong từng chi tiết.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => onNavigate('about')}
                className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(217,4,41,0.5)]"
              >
                Khám Phá Ngay
              </button>
              <button className="px-8 py-3.5 rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2 group">
                Xem Catalog
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 opacity-60"></div>
              <img alt="Tet Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwzG3a-jHOHWrvj5WTR2kaCdOHE8DjnNQ0e1iXJNVTa-eiE3EEuR64UQWqdsxJx21I-5n5FiYbKi-47cnGy1MkYdvF9XDWIBEw0CRZ8YCi3Jbw6lg2p3LkrNvAY2UWYKpHMH2cAzHSRgHouxnNlmaaGrqfBjFt3nBDb_ELG8xJFZbrjVUJXgjlOVXPjUiELEUDXGvBCRbrLezmshMuwqZwGqMxMi1EnwveutVN5qyJf4aY7eo2Hq9zv2QO3QKH8fbTD0ttbZ7nsiA" />
              <div className="absolute bottom-8 left-8 z-20 glass-panel p-4 rounded-xl max-w-xs border-l-4 border-l-accent">
                <p class="text-accent text-xs font-bold uppercase mb-1">Featured Collection</p>
                <p class="text-white font-serif text-lg">Tinh Hoa Tết Việt</p>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/10 rounded-[2rem] blur-2xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Danh Mục <span className="italic text-gray-500 dark:text-gray-400">Nổi Bật</span></h2>
          <a onClick={() => onNavigate('shop')} className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-primary transition-colors flex items-center gap-1 group cursor-pointer">
            Xem tất cả <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Hộp Quà Tết', icon: 'inventory_2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlBWvaMHBQxGn_x6I2WkSTFXY3Dsh7Bt30e1EugVz_E1q-wBLHq0V8U1hpIFE769nzLvl3sX25kpU9_1oBfFHPCtSFAtx2XEYRW4p1ooNXk4mlVc5ixmeFHJbm9CBQrTl6ZPwHF7i0w-C-_7JC1QDpNuzg-MVt0SzHwLERBBNT6esHkI-Vmdvb4VlKiR1oyLL5H1InVohcGVmsKooyrvY6Nye3bKTj0xZBOeX0tj_wZL8PoQ3qRezWNLi6a8fG4rv1R3ZFUpkH8Bo' },
            { name: 'Giỏ Quà Tết', icon: 'shopping_basket', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhQutXkcjc51gtDH-rrlzGLxUjXELp79G8vCslV7FcDgkX8alX0YCt5KEg1L8_8ZRbLNUJ9WJwKc5-I0HHHmn61VLvMzvmAr0VNymAaOSx2FvM9qLkfV1LsG5Bw0bc4sasC1etKuV2_aofXx4SGY6rSBr8EwZIgCWc0aVPIaZpUcgUB33a5v62oduI5ZQvyVzK41VPdWktojPLaUqDKxkY9mGcyKa3e_J39PlUDNee4TRsppwMIYrrFVG48gjjV9mn6L66larLKMU' },
            { name: 'Túi Quà Tết', icon: 'shopping_bag', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwXFIRC3Jdlb52WZWHa2iQlPxhPfgb5LV25uR4vpaEzHK97Cc4oQipA06HlylO2Jb-Mc-d3xrwLwLE6Ua0mWq16p94H7oeMRKINb2h2BsNMMKxq0tRUUF-Yw0jgLgVHKyaXGdwskGIu1HUdVyXoHdIs7uu3Rs_G_2w-1f9NMq6UaFhlu-brsa3YNB709kFbyv9P5VqbQ_4WdzCVwouMl6Oi48fxPLvH8i0sYIs7M1ivkxf3hEXzuYYtukLOqB2ijrCMEoPR8YEE6Y' },
            { name: 'Rượu Vang', icon: 'wine_bar', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO_cDL_WwfWU4aDmCak4W6RCuR7_7ACX95kW-X-chS5LNk9cU62tql31HffUW6UC0aM9IBWfOTDyPOqVy3EPWsEmecStO9v3BZjT-Z1Z_rekXghfUqBdKs3iJcRSKNm8CTccfQeKqF70t9sXRlcEP603hgodwOZ38ynHcuuD3yrHRNRlqXB-RXGb5X1iYiqR3DnuW3j2amGLrHqgnCsnL4Rqd-bUCt4Zo9KDM26w_t6iNcHy82brxugaMu5pIRsou89wsseeTNUvA' },
          ].map((cat, idx) => (
            <a key={idx} onClick={() => onNavigate('shop')} className="group relative block overflow-hidden rounded-2xl aspect-[3/4] border border-gray-200 dark:border-white/5 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
              <img alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" src={cat.img} />
              <div className="absolute bottom-0 p-6 z-20 w-full transform transition-transform duration-300">
                <span className="material-symbols-outlined text-accent text-2xl mb-2 opacity-80">{cat.icon}</span>
                <h3 className="text-xl font-display font-semibold text-white mb-1">{cat.name}</h3>
                <p className="text-gray-400 text-xs font-light translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Khám phá ngay</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* New Collection */}
      <div className="w-full bg-gray-50 dark:bg-[#0a0a0c] border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">New Collection</span>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Xuân Giáp Thìn <span className="italic font-light text-gray-500">2026</span></h2>
            </div>
            <div className="flex gap-3">
              <button className="size-10 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/5 text-gray-900 dark:text-white transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.slice(0, 4).map((product) => (
              <div key={product.id} className="group bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5 cursor-pointer" onClick={() => onProductClick(product.id)}>
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-background-dark">
                  <img alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src={product.image} />
                  {product.discount && <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">-{product.discount}%</div>}
                  {product.isHot && <div className="absolute top-3 left-3 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">HOT</div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="size-10 bg-white text-background-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-accent text-xs">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`material-symbols-outlined text-[14px] fill-current ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-primary font-bold text-lg">{product.price.toLocaleString()}₫</span>
                  {product.originalPrice && <span className="text-gray-400 dark:text-gray-600 text-sm line-through">{product.originalPrice.toLocaleString()}₫</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Offer Banner */}
      <div className="w-full max-w-7xl px-4 md:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 to-[#2d0a0a] border border-white/10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvhISll5J5hhOI-UbsktqYO1W_96_4VOC1ETq0h_D8k_OdDM9myXOS-gS7IOpVz5H1xp13hWXfx_pmmXKpnKw9gt57RjEhJUyNf01oz8DpO3ybU34wWJ3PSM-o6_okxs8UgwkVzXLQoR0u13OrJpLxV3zGmDVVxBhh63htFJ6pynHh5v3CWiKUk0hjwLBmovlGls6ieXp_nStUnrNW4RMmf1XXHdbvChFunmuO013vXfOr5Z13gLR7PyTho5TxL2bo_kRn7nZKTGc')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="flex flex-col gap-4 z-10 max-w-xl text-center md:text-left">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Special Offer</span>
            <h3 className="text-white text-4xl md:text-5xl font-serif leading-tight">
              Mua Sớm Giảm Sâu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Đón Tết Sum Vầy</span>
            </h3>
            <p className="text-gray-300 text-lg font-light mt-2">
              Giảm thêm <span className="text-white font-bold">15%</span> cho đơn hàng đặt trước ngày 20/01. <br className="hidden md:block" />
              Sử dụng mã: <span className="font-mono text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded ml-1">TET2026</span>
            </p>
          </div>
          <div className="z-10 relative">
            <button 
              onClick={() => onNavigate('shop')}
              className="bg-gradient-to-r from-primary to-red-600 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-glow hover:shadow-[0_0_25px_rgba(239,35,60,0.6)] hover:scale-105 transition-all border border-white/10"
            >
              Mua Ngay Kẻo Lỡ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
