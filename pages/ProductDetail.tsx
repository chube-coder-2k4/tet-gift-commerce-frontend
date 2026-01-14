import React from 'react';
import { PRODUCTS } from '../constants';
import { Screen } from '../types';

interface ProductDetailProps {
  onNavigate: (screen: Screen) => void;
  productId: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onNavigate, productId }) => {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <a onClick={() => onNavigate('shop')} className="hover:text-primary transition-colors cursor-pointer">Hộp quà Tết</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 group shadow-sm">
            <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.image} />
            <div className="absolute top-4 left-4 flex gap-2">
              {product.discount && <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-glow">-{product.discount}%</span>}
              <span className="bg-accent text-black text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">Best Seller</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <button key={i} className={`aspect-square rounded-xl border overflow-hidden transition-colors ${i === 1 ? 'border-primary' : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}>
                <img alt={`Thumbnail ${i}`} className="w-full h-full object-cover" src={product.image} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-[18px] fill-current ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-300 underline font-medium ml-1">{product.rating} ({product.reviews} đánh giá)</span>
            </div>
            <span className="w-px h-4 bg-gray-300 dark:bg-white/20"></span>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-[18px] fill-current">check_circle</span>
              <span>Còn hàng</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-primary">{product.price.toLocaleString()}₫</span>
            {product.originalPrice && <span className="text-xl text-gray-400 dark:text-gray-500 line-through">{product.originalPrice.toLocaleString()}₫</span>}
          </div>

          <div className="prose prose-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            <p>Sản phẩm là sự kết hợp tinh tế giữa truyền thống và hiện đại. Bộ sản phẩm bao gồm rượu vang cao cấp, hạt macca, hạt điều rang muối và trà thượng hạng. Thiết kế hộp sơn mài sang trọng, mang ý nghĩa tài lộc, thịnh vượng cho năm mới.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Số lượng</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-white/15 rounded-lg bg-white dark:bg-surface-dark h-12 w-32">
                <button className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input className="flex-1 w-full bg-transparent text-center text-gray-900 dark:text-white font-medium border-none focus:ring-0 p-0" type="text" defaultValue="1" />
                <button className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={() => onNavigate('cart')}
              className="flex-1 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-glow transition-all flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined group-hover:animate-bounce">shopping_cart</span>
              Thêm vào giỏ
            </button>
            <button className="sm:w-auto w-full border border-gray-300 dark:border-white/20 hover:border-accent hover:text-accent text-gray-900 dark:text-white font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 bg-white dark:bg-white/5">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-white/10 pt-6">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-gray-100 dark:bg-surface-dark flex items-center justify-center border border-gray-200 dark:border-white/10 text-accent shrink-0">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Giao hàng nhanh</h4>
                <p className="text-xs text-gray-500">Nội thành 2-4h</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-gray-100 dark:bg-surface-dark flex items-center justify-center border border-gray-200 dark:border-white/10 text-accent shrink-0">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Chính hãng 100%</h4>
                <p className="text-xs text-gray-500">Hoàn tiền nếu giả</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
