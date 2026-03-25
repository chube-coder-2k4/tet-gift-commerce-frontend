import React, { useState, useEffect } from 'react';
import { bundleApi, BundleResponse } from '../services/bundleApi';
import { cartApi } from '../services/cartApi';
import { Screen } from '../types';
import { authApi } from '../services/api';
import Pagination from '../components/Pagination';
import CustomBundleModal from '../components/CustomBundleModal';

interface BundlesProps {
  onNavigate: (screen: Screen) => void;
  onCartUpdate?: () => void;
  onProductClick?: (id: number) => void;
  onBundleClick?: (id: number) => void;
}

const Bundles: React.FC<BundlesProps> = ({ onNavigate, onCartUpdate, onBundleClick }) => {
  const [bundles, setBundles] = useState<BundleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      setIsLoading(true);
      try {
        const res = await bundleApi.getAll({
          page,
          size: 12,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
        setBundles(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 0);
        setTotalItems(res.data?.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch bundles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundles();
  }, [page]);

  const handleAddToCart = async (e: React.MouseEvent, bundleId: number) => {
    e.stopPropagation();
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    setAddingToCart(bundleId);
    try {
      await cartApi.addItem({ itemType: 'BUNDLE', bundleId, quantity: 1 });
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to add bundle to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="w-full bg-background-light dark:bg-background-dark min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-gray-200 dark:border-white/10 pb-6">
          <div>
            <nav className="flex mb-4 text-sm text-gray-500 dark:text-gray-400">
              <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white font-medium">Combo Quà Tết</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-black font-serif text-gray-900 dark:text-white tracking-tight">
              Combo Quà Tết
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-2xl">
              Khám phá các bộ Combo được tuyển chọn kỹ lưỡng, mang đậm ý nghĩa văn hóa và sự tinh tế dành cho dịp Tết này. ({totalItems} bộ)
            </p>
          </div>
          <button 
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">redeem</span>
            Tạo Combo Tự Chọn
          </button>
        </div>

        {/* List Section */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-gray-300 dark:text-gray-600 mb-4 block">redeem</span>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Chưa có combo nào</h3>
            <p className="text-gray-500">Các combo quà Tết sẽ sớm được cập nhật.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="group bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark rounded-2xl p-5 border border-primary/10 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full" onClick={() => onBundleClick?.(bundle.id)}>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-5 bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-white/5">
                    {bundle.image ? (
                      <img alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={bundle.image} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-yellow-500/5">
                        <span className="material-symbols-outlined text-6xl text-primary/30">redeem</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                      <span className="material-symbols-outlined text-[14px]">redeem</span>
                      Combo
                    </div>

                    {/* Quick Add Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => handleAddToCart(e, bundle.id)}
                        disabled={addingToCart === bundle.id}
                        className="h-12 w-12 bg-white text-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 shadow-xl"
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {addingToCart === bundle.id ? 'hourglass_empty' : 'add_shopping_cart'}
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {bundle.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                      {bundle.description || `Bao gồm ${bundle.products.length} sản phẩm`}
                    </p>
                    <div className="flex border-t border-gray-100 dark:border-white/10 pt-4 items-center justify-between mt-auto">
                      <span className="text-primary font-black text-2xl">{bundle.price.toLocaleString()}₫</span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50">
                        {bundle.products.length} món
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="numbered" />
              </div>
            )}
          </>
        )}
      </div>

      <CustomBundleModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSuccess={() => {
          onCartUpdate?.();
        }}
      />
    </div>
  );
};

export default Bundles;
