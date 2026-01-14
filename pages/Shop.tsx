import React from 'react';
import { PRODUCTS } from '../constants';
import { Screen } from '../types';

interface ShopProps {
  onNavigate: (screen: Screen) => void;
  onProductClick: (id: number) => void;
}

const Shop: React.FC<ShopProps> = ({ onNavigate, onProductClick }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Tất cả sản phẩm</span>
      </nav>
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div className="pb-6 border-b border-gray-200 dark:border-white/10 lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-gray-900 dark:text-white">Bộ lọc</h3>
              <button className="text-xs text-primary font-medium hover:underline">Xóa tất cả</button>
            </div>
            <div className="mb-8">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Loại sản phẩm</h4>
              <div className="space-y-3">
                {['Tất cả', 'Hộp quà Tết', 'Giỏ quà Tết', 'Túi quà Tết', 'Rượu Tết'].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={idx === 0} className="rounded border-gray-300 dark:border-white/20 bg-transparent text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Khoảng giá</h4>
              <div className="space-y-3">
                {['Tất cả', 'Dưới 500K', '500K - 1 Triệu', 'Trên 1 Triệu'].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="price" defaultChecked={idx === 0} className="border-gray-300 dark:border-white/20 bg-transparent text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>
        
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">Bộ Sưu Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent italic">Quà Tết 2024</span></h1>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
              <div className="relative w-full md:w-96 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                <input type="text" className="w-full bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Tìm kiếm hộp quà, rượu tết..." />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sắp xếp:</span>
                  <select className="bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-0 cursor-pointer">
                    <option>Nổi bật nhất</option>
                    <option>Mới nhất</option>
                    <option>Giá: Thấp đến Cao</option>
                    <option>Giá: Cao đến Thấp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="group bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5 flex flex-col h-full cursor-pointer" onClick={() => onProductClick(product.id)}>
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-background-dark">
                  <img alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src={product.image} />
                  {product.discount && <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">-{product.discount}%</div>}
                  {product.isHot && <div className="absolute top-3 left-3 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">HOT</div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="size-10 bg-white text-background-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-glow">
                      <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    </button>
                    <button className="size-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-accent font-medium uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-accent text-xs">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-[14px] fill-current ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-3 border-t border-gray-100 dark:border-white/5 pt-3">
                    <span className="text-primary font-bold text-lg">{product.price.toLocaleString()}₫</span>
                    {product.originalPrice && <span className="text-gray-400 dark:text-gray-600 text-sm line-through">{product.originalPrice.toLocaleString()}₫</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
