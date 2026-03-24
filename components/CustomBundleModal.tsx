import React, { useState, useEffect, useMemo } from 'react';
import { productApi, ProductResponse } from '../services/productApi';
import { bundleApi } from '../services/bundleApi';
import { cartApi } from '../services/cartApi';

interface CustomBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomBundleModal: React.FC<CustomBundleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number }[]>([]);
  const [bundleName, setBundleName] = useState('Combo tự chọn của tôi');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setSelectedItems([]);
      setBundleName('Combo tự chọn của tôi');
      setError('');
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const all: ProductResponse[] = [];
      let page = 0;
      let totalPages = 1;

      while (page < totalPages && page < 5) {
        const res = await productApi.getAll({ page, size: 50, sortBy: 'createdAt', sortDir: 'desc' });
        if (res.data) {
          all.push(...res.data.data);
          totalPages = res.data.totalPages;
        }
        page++;
      }
      setProducts(all);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const currentTotal = useMemo(() => {
    let total = 0;
    selectedItems.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) total += p.price * item.quantity;
    });
    return total;
  }, [selectedItems, products]);

  const handleUpdateQuantity = (productId: number, qtyAction: 'add' | 'remove') => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (!existing && qtyAction === 'add') {
        return [...prev, { productId, quantity: 1 }];
      }
      return prev.map(i => {
        if (i.productId === productId) {
          return { ...i, quantity: qtyAction === 'add' ? i.quantity + 1 : i.quantity - 1 };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  };

  const getQuantity = (productId: number) => {
    return selectedItems.find(i => i.productId === productId)?.quantity || 0;
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm.');
      return;
    }
    if (!bundleName.trim()) {
      setError('Vui lòng nhập tên cho Combo.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      // 1. Create Bundle
      const bundleRes = await bundleApi.create({
        name: bundleName.trim(),
        price: currentTotal,
        isCustom: false,
        description: 'Combo thiết kế theo ý khách hàng',
        products: selectedItems,
      });

      const newBundleId = bundleRes.data;

      // 2. Add bundle to cart
      await cartApi.addItem({
        itemType: 'BUNDLE',
        bundleId: newBundleId,
        quantity: 1,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo mã giảm giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-transparent">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">redeem</span>
              Tạo Combo Theo Ý Muốn
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tự do kết hợp các sản phẩm yêu thích của bạn</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-red-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Product Selection */}
          <div className="flex-1 border-r border-gray-100 dark:border-white/10 flex flex-col overflow-hidden bg-white dark:bg-transparent">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-white sticky top-0 dark:bg-card-dark z-10 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                Sản phẩm có sẵn
              </h3>
              <p className="text-xs text-gray-500">
                Thêm tối đa tuỳ thích vào gói quà
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {loadingProducts ? (
                <div className="flex justify-center py-10">
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Không có sản phẩm nào khả dụng.</div>
              ) : (
                products.map(p => {
                  const qty = getQuantity(p.id);
                  return (
                    <div key={p.id} className={`flex gap-3 p-3 rounded-xl border transition-all ${qty > 0 ? 'border-primary bg-red-50/50 dark:bg-primary/5' : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10">
                        {p.primaryImage ? (
                          <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-gray-400">inventory_2</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                          <span className="text-xs text-primary font-bold">{p.price.toLocaleString()}₫</span>
                        </div>
                        <div className="flex justify-end mt-1">
                          {qty > 0 ? (
                            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-lg h-7 px-1 w-fit">
                              <button onClick={() => handleUpdateQuantity(p.id, 'remove')} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors">
                                <span className="material-symbols-outlined text-sm">remove</span>
                              </button>
                              <span className="text-sm font-bold min-w-[12px] text-center dark:text-white">{qty}</span>
                              <button onClick={() => handleUpdateQuantity(p.id, 'add')} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-white/5 text-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">add</span>
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleUpdateQuantity(p.id, 'add')}
                              className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              Thêm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Custom Bundle Overview */}
          <div className="w-full md:w-[320px] lg:w-[380px] bg-gray-50/50 dark:bg-surface-darker/30 flex flex-col shrink-0">
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
              <div className="mb-6 mb-4">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Tên Combo của bạn
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={bundleName}
                    onChange={(e) => {
                      setBundleName(e.target.value);
                      setError('');
                    }}
                    placeholder="VD: Quà biếu Sếp..."
                    maxLength={50}
                    className="w-full bg-white dark:bg-card-dark border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400">edit</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b border-gray-200 dark:border-white/10 pb-2">
                  Các sản phẩm đã chọn ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)})
                </h3>
                
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-300 dark:border-white/20">
                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-4xl mb-2">shopping_basket</span>
                    <p className="text-xs text-gray-500">Chưa có sản phẩm nào. Hãy click "Thêm" từ danh sách bên trái.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map(item => {
                      const p = products.find(prod => prod.id === item.productId);
                      if (!p) return null;
                      return (
                        <div key={item.productId} className="flex justify-between items-center bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                          <div className="flex-1 min-w-0 pr-3">
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</h5>
                            <p className="text-xs text-gray-500 mt-0.5">{p.price.toLocaleString()}₫ x {item.quantity}</p>
                          </div>
                          <span className="font-bold text-primary text-sm whitespace-nowrap">
                            {(p.price * item.quantity).toLocaleString()}₫
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Total & Action */}
            <div className="p-5 bg-white dark:bg-card-dark border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
              {error && (
                <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 px-3 py-2 rounded-lg flex items-center gap-1.5 border border-red-100 dark:border-red-400/20">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="flex justify-between items-end mb-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tổng tạm tính:</span>
                <span className="text-2xl font-black text-primary dark:text-accent">
                  {currentTotal.toLocaleString()}₫
                </span>
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
                className="w-full h-12 flex justify-center items-center gap-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBundleModal;
