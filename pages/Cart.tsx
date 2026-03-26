import React, { useState, useEffect } from 'react';
import { cartApi, CartResponse } from '../services/cartApi';
import { discountApi, DiscountResponse } from '../services/discountApi';
import { authApi } from '../services/api';
import { productApi } from '../services/productApi';
import { bundleApi } from '../services/bundleApi';
import { Screen } from '../types';
import CustomBundleModal, { CustomComboPayload, CustomComboSelection } from '../components/CustomBundleModal';

interface CartProps {
  onNavigate: (screen: Screen) => void;
  onCartUpdate?: () => void;
  onBundleClick?: (id: number) => void;
}

const Cart: React.FC<CartProps> = ({ onNavigate, onCartUpdate, onBundleClick }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<DiscountResponse | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingComboItemId, setEditingComboItemId] = useState<number | null>(null);
  const [editingComboItemQuantity, setEditingComboItemQuantity] = useState(1);
  const [editingComboInitialItems, setEditingComboInitialItems] = useState<CustomComboSelection[]>([]);
  const [editingComboName, setEditingComboName] = useState('Combo tự chọn của tôi');
  const [itemImageMap, setItemImageMap] = useState<Record<string, string>>({});

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getAppliedDiscountAmount = (discountData: DiscountResponse | null, amount: number): number => {
    if (!discountData) return 0;

    const actual = toNumber(discountData.actualDiscountAmount);
    if (actual > 0) return actual;

    const aliasAmount = toNumber((discountData as DiscountResponse).discountAmount);
    if (aliasAmount > 0) return aliasAmount;

    const discountValue = toNumber(discountData.discountValue);
    if (discountData.discountType === 'PERCENTAGE') {
      const percentAmount = Math.round((amount * discountValue) / 100);
      const maxCap = toNumber(discountData.maxDiscountAmount);
      return maxCap > 0 ? Math.min(percentAmount, maxCap) : percentAmount;
    }

    return discountValue;
  };

  // Helper to parse custom combo data
  const parseCustomCombo = (data: string | undefined) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  // Load saved discount from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('appliedDiscount');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDiscount(parsed);
        setDiscountCode(parsed.code || '');
      }
    } catch {}
  }, []);

  const fetchCart = async () => {
    if (!authApi.isAuthenticated()) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const enrichItemImages = async () => {
      if (!cart?.items?.length) return;

      const missingItems = cart.items.filter((item) => {
        const key = `${item.itemType}-${item.itemId}`;
        const inlineImage = item.primaryImage || item.image || item.imageUrl;
        return !inlineImage && !itemImageMap[key];
      });

      if (missingItems.length === 0) return;

      const results = await Promise.all(
        missingItems.map(async (item) => {
          const key = `${item.itemType}-${item.itemId}`;
          try {
            if (item.itemType === 'PRODUCT') {
              const res = await productApi.getById(item.itemId);
              const p = res.data;
              const image = p.primaryImage || p.image || p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '';
              return { key, image };
            }

            const res = await bundleApi.getById(item.itemId);
            return { key, image: res.data?.image || '' };
          } catch {
            return { key, image: '' };
          }
        })
      );

      setItemImageMap((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r.image) next[r.key] = r.image;
        }
        return next;
      });
    };

    enrichItemImages();
  }, [cart?.items, itemImageMap]);

  const getCartItemImage = (item: NonNullable<CartResponse['items']>[number]) => {
    const inlineImage = item.primaryImage || item.image || item.imageUrl;
    if (inlineImage) return inlineImage;
    return itemImageMap[`${item.itemType}-${item.itemId}`] || '';
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItem(itemId);
    try {
      const res = await cartApi.updateQuantity(itemId, newQuantity);
      setCart((prev) => {
        if (!prev?.items?.length) return res.data;

        const oldIndex = new Map(prev.items.map((it, idx) => [it.id, idx]));
        const sortedItems = [...(res.data?.items || [])].sort((a, b) => {
          const ai = oldIndex.get(a.id);
          const bi = oldIndex.get(b.id);
          if (ai === undefined && bi === undefined) return 0;
          if (ai === undefined) return 1;
          if (bi === undefined) return -1;
          return ai - bi;
        });

        return {
          ...res.data,
          items: sortedItems,
        };
      });
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setRemovingItem(itemId);
    try {
      await cartApi.removeItem(itemId);
      await fetchCart();
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearCart = async () => {
    setClearingCart(true);
    try {
      await cartApi.clearCart();
      setCart(null);
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setClearingCart(false);
    }
  };

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) return;

    const totalPrice = cart?.totalPrice || 0;

    setValidatingDiscount(true);
    setDiscountError('');
    try {
      const res = await discountApi.validate(discountCode.trim(), totalPrice);
      if (res.data) {
        setDiscount(res.data);
        setDiscountError('');
        // Save to localStorage for Checkout
        localStorage.setItem('appliedDiscount', JSON.stringify(res.data));
      } else {
        setDiscountError('Mã giảm giá không hợp lệ');
        setDiscount(null);
        localStorage.removeItem('appliedDiscount');
      }
    } catch (err: any) {
      setDiscountError(err?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setDiscount(null);
      localStorage.removeItem('appliedDiscount');
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    setDiscountCode('');
    localStorage.removeItem('appliedDiscount');
  };

  const openCreateComboModal = () => {
    setEditingComboItemId(null);
    setEditingComboItemQuantity(1);
    setEditingComboInitialItems([]);
    setEditingComboName('Combo tự chọn của tôi');
    setIsBundleModalOpen(true);
  };

  const handleEditCustomCombo = (item: NonNullable<CartResponse['items']>[number]) => {
    const parsed = parseCustomCombo(item.customComboData);
    const initialItems: CustomComboSelection[] = (parsed?.items || [])
      .map((prod: any) => ({
        productId: Number(prod?.productId),
        quantity: Math.max(1, Number(prod?.quantity) || 1),
      }))
      .filter((prod: CustomComboSelection) => Number.isFinite(prod.productId) && prod.productId > 0);

    if (initialItems.length === 0) {
      console.warn('Custom combo data is missing productId, cannot prefill editor.');
      return;
    }

    setEditingComboItemId(item.id);
    setEditingComboItemQuantity(item.quantity || 1);
    setEditingComboInitialItems(initialItems);
    setEditingComboName(parsed?.name || item.itemName || 'Combo tự chọn của tôi');
    setIsBundleModalOpen(true);
  };

  const handleSubmitEditedCombo = async (payload: CustomComboPayload) => {
    if (!editingComboItemId) return;

    await cartApi.removeItem(editingComboItemId);
    await cartApi.addItem({
      itemType: 'BUNDLE',
      bundleId: 1,
      quantity: editingComboItemQuantity,
      isCustomCombo: true,
      customComboData: JSON.stringify(payload),
    });
  };

  // Not logged in
  if (!authApi.isAuthenticated()) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">shopping_cart</span>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem giỏ hàng</p>
        <button onClick={() => onNavigate('login')} className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all">
          Đăng nhập
        </button>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;
  const totalItems = cart?.totalItems || 0;
  const appliedDiscountAmount = getAppliedDiscountAmount(discount, totalPrice);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate('shop')}
        className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-medium">Tiếp tục mua hàng</span>
      </button>
      
      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Giỏ hàng</span>
      </nav>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">
          Giỏ hàng <span className="text-gray-500 font-sans text-lg font-normal ml-2">({totalItems} sản phẩm)</span>
        </h1>
        <button 
          onClick={openCreateComboModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">redeem</span>
          Tạo Combo Tự Chọn
        </button>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">shopping_cart</span>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('shop')} className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all">
              Khám phá sản phẩm
            </button>
            <button onClick={openCreateComboModal} className="px-8 py-3 rounded-full bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">redeem</span>
              Tạo Combo Tự Chọn
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>
            
            {cartItems.map((item) => (
              <div key={item.id} className={`p-6 border-b border-gray-200 dark:border-white/5 flex flex-col md:grid md:grid-cols-12 gap-6 items-center group relative hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${removingItem === item.id ? 'opacity-50' : ''}`}>
                <div className="col-span-6 flex items-start gap-4 w-full">
                  <div className="relative size-24 md:size-28 shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-surface-darker flex items-center justify-center">
                    {getCartItemImage(item) ? (
                      <img
                        src={getCartItemImage(item)}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-gray-400">{item.itemType === 'BUNDLE' ? 'inventory_2' : 'shopping_bag'}</span>
                    )}
                  </div>
                  <div className="flex flex-col h-full justify-between py-1">
                    <div>
                      <h3
                        className={`font-bold text-gray-900 dark:text-white text-lg font-serif mb-1 ${(item.itemType === 'BUNDLE' && !item.isCustomCombo) ? 'hover:text-primary cursor-pointer' : ''}`}
                        onClick={() => { if (item.itemType === 'BUNDLE' && !item.isCustomCombo) onBundleClick?.(item.itemId); }}
                      >{item.itemName}</h3>
                      <p className="text-xs text-gray-500 mb-2">Loại: {item.isCustomCombo ? 'Combo tự chọn' : (item.itemType === 'BUNDLE' ? 'Combo' : 'Sản phẩm')}</p>
                      
                      {/* Render Custom Combo items if present */}
                      {item.isCustomCombo && (
                        <div className="mt-2 mb-3 bg-gray-50 dark:bg-black/20 p-2.5 rounded-lg border border-gray-200 dark:border-white/5 max-w-[240px]">
                          <p className="text-[10px] uppercase font-bold text-primary dark:text-accent tracking-wider mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">list_alt</span>
                            Chi tiết Combo
                          </p>
                          <div className="space-y-1">
                            {parseCustomCombo(item.customComboData)?.items?.map((prod: any, idx: number) => (
                              <div key={idx} className="flex justify-between gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                                <span className="truncate">{prod.name} <span className="text-gray-400 dark:text-gray-500 font-mono">x{prod.quantity}</span></span>
                                <span className="shrink-0 font-medium font-mono text-[10px]">{(prod.price * prod.quantity).toLocaleString()}₫</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleEditCustomCombo(item)}
                            className="mt-2 text-[11px] text-primary hover:underline font-semibold"
                          >
                            Sửa combo
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded w-fit border border-green-200 dark:border-green-500/20">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Còn hàng
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removingItem === item.id}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 mt-3 w-fit disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">{removingItem === item.id ? 'hourglass_empty' : 'delete'}</span>
                      Xóa sản phẩm
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:hidden border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
                  <span className="text-sm text-gray-500">Đơn giá: <span className="text-gray-900 dark:text-white">{item.itemPrice.toLocaleString()}₫</span></span>
                  <span className="text-primary dark:text-accent font-bold">{item.subtotal.toLocaleString()}₫</span>
                </div>

                <div className="hidden md:block col-span-2 text-center text-gray-900 dark:text-gray-300 font-medium">
                  {item.itemPrice.toLocaleString()}₫
                </div>
                
                <div className="col-span-2 flex justify-center w-full md:w-auto">
                  <div className="flex items-center border border-gray-300 dark:border-white/15 rounded-lg bg-white dark:bg-surface-dark h-10">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingItem === item.id || item.quantity <= 1}
                      className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-10 text-center text-gray-900 dark:text-white text-sm font-medium">
                      {updatingItem === item.id ? '...' : item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItem === item.id}
                      className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>
                
                <div className="hidden md:block col-span-2 text-right font-bold text-primary dark:text-accent text-lg">
                  {item.subtotal.toLocaleString()}₫
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <a onClick={() => onNavigate('shop')} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white flex items-center gap-2 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Tiếp tục mua sắm
            </a>
            <button 
              onClick={handleClearCart}
              disabled={clearingCart}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">{clearingCart ? 'hourglass_empty' : 'delete_sweep'}</span>
              Xóa tất cả
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-6 lg:p-8 sticky top-28 shadow-lg dark:shadow-glow-accent/5">
            <h3 className="text-xl font-serif text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Cộng giỏ hàng</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span className="text-gray-900 dark:text-white font-medium">{totalPrice.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                <span>Phí vận chuyển</span>
                <span className="text-gray-900 dark:text-white font-medium">Miễn phí</span>
              </div>
              {discount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                    Giảm giá
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-bold">
  -{appliedDiscountAmount.toLocaleString()}₫
</span>                </div>
              )}
            </div>
            
            {/* Discount Code Input */}
            <div className="relative mb-4">
              {!discount ? (
                <>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-gray-50 dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-lg py-3 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent placeholder-gray-500 transition-all" 
                      type="text" 
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') handleValidateDiscount(); }}
                    />
                    <button 
                      onClick={handleValidateDiscount}
                      disabled={validatingDiscount || !discountCode.trim()}
                      className="px-4 bg-primary hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors uppercase disabled:opacity-50"
                    >
                      {validatingDiscount ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  {discountError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{discountError}</p>}
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
    <span className="text-sm font-bold text-green-700 dark:text-green-400">
      {discount.code}
    </span>
                      {/* Hiển thị Badge loại giảm giá để người dùng dễ hiểu */}
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-200 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded border border-green-300">
      {discount.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm trực tiếp'}
    </span>
                    </div>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
            Tiết kiệm: <span className="font-semibold text-gray-700">-{appliedDiscountAmount.toLocaleString()}₫</span>
                      {/* Chỉ hiện % nếu là loại Percentage, nếu không thì ẩn đi hoặc hiện text khác */}
                      {discount.discountType === 'PERCENTAGE' && ` (áp dụng mức giảm ${discount.discountValue}%)`}
  </span>
                  </div>
                  <button onClick={handleRemoveDiscount} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Xóa mã">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-900 dark:text-white font-bold text-lg">Tổng cộng</span>
                <div className="text-right">
<span className="text-3xl font-serif font-bold text-primary ...">
  {Math.max(0, totalPrice - appliedDiscountAmount).toLocaleString()}₫
</span>                  <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</p>
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
      )}

      {/* Custom Bundle Modal Option */}
      <CustomBundleModal 
        isOpen={isBundleModalOpen} 
        onClose={() => {
          setIsBundleModalOpen(false);
          setEditingComboItemId(null);
        }} 
        onSuccess={() => {
          fetchCart();
          onCartUpdate?.();
        }}
        initialSelectedItems={editingComboInitialItems}
        initialBundleName={editingComboName}
        submitLabel={editingComboItemId ? 'Lưu combo' : 'Thêm vào giỏ hàng'}
        onSubmitCustomCombo={editingComboItemId ? handleSubmitEditedCombo : undefined}
      />
    </div>
  );
};

export default Cart;
