import React from 'react';
import { PRODUCTS } from '../constants';
import { Screen } from '../types';

interface CartProps {
  onNavigate: (screen: Screen) => void;
}

const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  // Mock cart items using existing products
  const cartItems = [PRODUCTS[0], PRODUCTS[2]];
  const total = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Giỏ hàng</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-8">Giỏ hàng <span className="text-gray-500 font-sans text-lg font-normal ml-2">({cartItems.length} sản phẩm)</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>
            
            {cartItems.map((item, index) => (
              <div key={index} className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:grid md:grid-cols-12 gap-6 items-center group relative hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="col-span-6 flex items-start gap-4 w-full">
                  <div className="relative size-24 md:size-28 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-surface-darker">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                  </div>
                  <div className="flex flex-col h-full justify-between py-1">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg font-serif mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">Phân loại: Tiêu chuẩn</p>
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded w-fit border border-green-200 dark:border-green-500/20">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Còn hàng
                      </div>
                    </div>
                    <button className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 mt-3 w-fit">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Xóa sản phẩm
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:hidden border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
                  <span className="text-sm text-gray-500">Đơn giá: <span className="text-gray-900 dark:text-white">{item.price.toLocaleString()}₫</span></span>
                  <span className="text-primary dark:text-accent font-bold">{item.price.toLocaleString()}₫</span>
                </div>

                <div className="hidden md:block col-span-2 text-center text-gray-900 dark:text-gray-300 font-medium">
                  {item.price.toLocaleString()}₫
                </div>
                
                <div className="col-span-2 flex justify-center w-full md:w-auto">
                  <div className="flex items-center border border-gray-300 dark:border-white/15 rounded-lg bg-white dark:bg-surface-dark h-10">
                    <button className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <input className="w-10 bg-transparent text-center text-gray-900 dark:text-white text-sm font-medium border-none focus:ring-0 p-0" type="text" defaultValue="1" />
                    <button className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
                
                <div className="hidden md:block col-span-2 text-right font-bold text-primary dark:text-accent text-lg">
                  {item.price.toLocaleString()}₫
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <a onClick={() => onNavigate('shop')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white flex items-center gap-2 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Tiếp tục mua sắm
            </a>
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-6 lg:p-8 sticky top-28 shadow-lg dark:shadow-glow-accent/5">
            <h3 className="text-xl font-serif text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Cộng giỏ hàng</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                <span>Tạm tính</span>
                <span className="text-gray-900 dark:text-white font-medium">{total.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                <span>Phí vận chuyển</span>
                <span className="text-gray-900 dark:text-white font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                <span>Giảm giá</span>
                <span className="text-primary font-medium">-0₫</span>
              </div>
            </div>
            
            <div className="relative mb-8">
              <input className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-lg py-3 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder-gray-500 transition-all" type="text" placeholder="Nhập mã giảm giá" />
              <button className="absolute right-1 top-1 bottom-1 px-4 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-accent text-xs font-bold rounded-md transition-colors uppercase">
                Áp dụng
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-900 dark:text-white font-bold text-lg">Tổng cộng</span>
                <div className="text-right">
                  <span className="text-3xl font-serif font-bold text-primary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-accent dark:to-yellow-200">{total.toLocaleString()}₫</span>
                  <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full bg-gradient-to-r from-primary to-red-800 hover:from-red-600 hover:to-red-900 text-white font-bold py-4 px-6 rounded-xl shadow-glow transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Tiến hành thanh toán
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker/50">
                <span className="material-symbols-outlined text-primary dark:text-accent mb-1">lock</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bảo mật 100%</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker/50">
                <span className="material-symbols-outlined text-primary dark:text-accent mb-1">local_shipping</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ship Toàn Quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
