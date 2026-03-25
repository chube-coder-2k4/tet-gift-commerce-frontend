import React, { useState, useEffect } from 'react';
import { Screen, Address } from '../types';
import { cartApi, CartResponse } from '../services/cartApi';
import { addressApi } from '../services/addressApi';
import { orderApi, OrderResponse } from '../services/orderApi';
import { paymentApi, PaymentMethod } from '../services/paymentApi';
import { discountApi, DiscountResponse } from '../services/discountApi';
import { authApi } from '../services/api';
import { InvoiceButton } from '../components/InvoiceButton';

interface CheckoutProps {
  onNavigate: (screen: Screen) => void;
  onCartUpdate?: () => void;
  onOrderCreated?: (orderId: number) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onNavigate, onCartUpdate, onOrderCreated }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VN_PAY');
  const [discount, setDiscount] = useState<DiscountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [showVat, setShowVat] = useState(false);
  const [vatInfo, setVatInfo] = useState({ companyName: '', taxCode: '', phone: '', address: '' });

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cartRes, addressRes] = await Promise.all([
          cartApi.getCart(),
          addressApi.getAll(),
        ]);
        setCart(cartRes.data);
        setAddresses(addressRes.data || []);
        // Auto-select default address
        const defaultAddr = (addressRes.data || []).find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addressRes.data?.length) setSelectedAddressId(addressRes.data[0].id);
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Load discount applied from Cart
    try {
      const saved = localStorage.getItem('appliedDiscount');
      if (saved) setDiscount(JSON.parse(saved));
    } catch {}
  }, []);

  // Helper to parse custom combo data
  const parseCustomCombo = (data: string | undefined) => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(null);
    localStorage.removeItem('appliedDiscount');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    if (!cart || cart.items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // 1. Create order
      const orderRes = await orderApi.create({
        addressId: selectedAddressId,
        discountCode: discount ? discount.code : undefined,
        ...(showVat && vatInfo.companyName ? {
          vatCompanyName: vatInfo.companyName,
          vatTaxCode: vatInfo.taxCode || undefined,
          vatPhone: vatInfo.phone || undefined,
          vatAddress: vatInfo.address || undefined,
        } : {}),
      });
      const order = orderRes.data;
      setCreatedOrder(order);
      localStorage.setItem('lastOrderId', order.id.toString());

      // 2. Create payment
      const paymentRes = await paymentApi.create({
        orderId: order.id,
        method: paymentMethod,
      });

      // 3. Update cart count
      onCartUpdate?.();
      onOrderCreated?.(order.id);

      // Clean up discount from localStorage after order placed
      localStorage.removeItem('appliedDiscount');

      // 4. If VNPay, redirect to payment URL
      if (paymentMethod === 'VN_PAY' && paymentRes.data?.paymentUrl) {
        window.location.href = paymentRes.data.paymentUrl;
        return;
      }

      // 5. COD — show success
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Order placed successfully (COD)
  if (step === 'success' && createdOrder) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 rounded-2xl p-10 shadow-xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
          </div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-3">Đặt Hàng Thành Công!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Đơn hàng của bạn đã được ghi nhận thành công!</p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {paymentMethod === 'COD' ? 'Bạn sẽ thanh toán khi nhận hàng.' : 'Thanh toán đã được xử lý.'}
          </p>
          <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Chi tiết đơn hàng</h3>
            {createdOrder.items.map(item => (
              <div key={item.id} className="py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.itemName} x{item.quantity}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{item.subtotal.toLocaleString()}₫</span>
                </div>
                {item.isCustomCombo && (
                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 pl-2 border-l border-primary/30">
                    {parseCustomCombo(item.customComboData)?.items?.map((prod: any, idx: number) => (
                      <span key={idx} className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {prod.name} x{prod.quantity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {createdOrder.tierDiscountAmount != null && createdOrder.tierDiscountAmount > 0 && (
              <div className="flex justify-between py-2 text-sm text-blue-600 dark:text-blue-400">
                <span>Giảm theo đơn hàng ({createdOrder.tierDiscountPercent}%)</span>
                <span className="font-semibold">-{createdOrder.tierDiscountAmount.toLocaleString()}₫</span>
              </div>
            )}
            {createdOrder.discountCode && createdOrder.discountAmount != null && createdOrder.discountAmount > 0 && (
              <div className="flex justify-between py-2 text-sm text-green-600 dark:text-green-400">
                <span>Mã giảm giá ({createdOrder.discountCode})</span>
                <span className="font-semibold">-{createdOrder.discountAmount.toLocaleString()}₫</span>
              </div>
            )}
            <div className="flex justify-between pt-4 mt-2 border-t border-gray-200 dark:border-white/10">
              <span className="font-bold text-gray-900 dark:text-white">Tổng cộng</span>
              <span className="font-bold text-primary text-xl">{createdOrder.totalAmount.toLocaleString()}₫</span>
            </div>
          </div>
          <InvoiceButton orderId={createdOrder.id} orderStatus={createdOrder.status} variant="compact" className="justify-center mb-6" />
          <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate('home')} className="px-6 py-3 rounded-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Về trang chủ
            </button>
            <button onClick={() => onNavigate('shop')} className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-red-600 transition-colors shadow-glow">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tier discount calculation (mirrors backend logic)
  const getTierDiscountPercent = (amount: number): number => {
    if (amount >= 50_000_000) return 10;
    if (amount >= 30_000_000) return 8;
    if (amount >= 15_000_000) return 5;
    if (amount >= 10_000_000) return 3;
    return 0;
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;
  const tierPercent = getTierDiscountPercent(subtotal);
  const tierAmount = Math.round(subtotal * tierPercent / 100);
  const discountValue = discount ? discount.discountValue : 0;
  const total = Math.max(0, subtotal - tierAmount - discountValue);
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-10 py-8">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-medium">Quay lại giỏ hàng</span>
      </button>
      
      <nav className="flex mb-8 overflow-x-auto pb-2">
        <ol className="flex items-center whitespace-nowrap min-w-0 gap-2">
          <li className="text-sm">
            <a onClick={() => onNavigate('cart')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer">
              Giỏ hàng
              <span className="material-symbols-outlined mx-2 text-[16px]">chevron_right</span>
            </a>
          </li>
          <li className="text-sm font-bold text-primary flex items-center">
            Thanh toán
            <span className="material-symbols-outlined mx-2 text-[16px] text-gray-400">chevron_right</span>
          </li>
          <li className="text-sm text-gray-400">
            Hoàn tất
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Thanh toán đơn hàng</h1>
            <p className="text-gray-600 dark:text-gray-400">Chọn địa chỉ giao hàng và phương thức thanh toán.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-4 rounded-xl text-sm text-red-800 dark:text-red-400">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Address Selection */}
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Địa chỉ giao hàng
            </h3>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">Bạn chưa có địa chỉ nào</p>
                <button onClick={() => onNavigate('profile')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-colors">
                  Thêm địa chỉ
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id 
                      ? 'border-primary bg-red-50/50 dark:bg-primary/5 ring-1 ring-primary/30' 
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{addr.receiverName}</span>
                        <span className="text-gray-500 text-sm">|</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{addr.phone}</span>
                        {addr.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">Mặc định</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{addr.addressDetail}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              Phương thức thanh toán
            </h3>

            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 p-3 rounded-xl text-sm text-green-800 dark:text-green-400 shadow-sm mb-4">
              <span className="material-symbols-outlined text-[18px]">shield_lock</span>
              <span>Mọi giao dịch đều được mã hóa. Chúng tôi không lưu thông tin thẻ của bạn.</span>
            </div>

            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'VN_PAY' ? 'border-primary bg-red-50/50 dark:bg-primary/5 ring-1 ring-primary/30' : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
              }`}>
                <input type="radio" name="payment_method" value="VN_PAY" checked={paymentMethod === 'VN_PAY'} onChange={() => setPaymentMethod('VN_PAY')} className="mt-1 h-4 w-4 text-primary focus:ring-primary" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">VNPay (Thẻ/Chuyển khoản)</span>
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[8px] font-bold text-blue-800">V</div>
                      <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-[8px] font-bold text-red-600">M</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thanh toán qua App Ngân hàng, Thẻ ATM, Visa/Mastercard.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-primary bg-red-50/50 dark:bg-primary/5 ring-1 ring-primary/30' : 'border-gray-200 dark:border-white/10 hover:border-primary/50'
              }`}>
                <input type="radio" name="payment_method" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mt-1 h-4 w-4 text-primary focus:ring-primary" />
                <div className="flex-1">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Thanh toán khi nhận hàng (COD)</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thanh toán tiền mặt khi giao hàng.</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-gray-400">local_shipping</span>
              </label>
            </div>
          </div>

          {/* VAT Invoice (Optional) */}
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowVat(!showVat)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xuất hóa đơn VAT</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tùy chọn — Điền nếu bạn cần xuất hóa đơn công ty</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${showVat ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {showVat && (
              <div className="px-6 pb-6 pt-0 space-y-4 border-t border-gray-100 dark:border-white/5">
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vatInfo.companyName}
                    onChange={e => setVatInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="VD: Công ty TNHH ABC"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors placeholder:text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mã số thuế</label>
                    <input
                      type="text"
                      value={vatInfo.taxCode}
                      onChange={e => setVatInfo(prev => ({ ...prev, taxCode: e.target.value }))}
                      placeholder="VD: 0123456789"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Số điện thoại</label>
                    <input
                      type="text"
                      value={vatInfo.phone}
                      onChange={e => setVatInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="VD: 0901234567"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Địa chỉ công ty</label>
                  <input
                    type="text"
                    value={vatInfo.address}
                    onChange={e => setVatInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
            <a onClick={() => onNavigate('cart')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại giỏ hàng
            </a>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="sticky top-24 rounded-2xl bg-white dark:bg-card-dark border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-darker flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Đơn hàng</h3>
              <span className="text-xs font-semibold bg-accent text-black px-2 py-1 rounded-md">{cartItems.length} Sản phẩm</span>
            </div>
            <div className="p-5 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-surface-darker flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-gray-400">{item.itemType === 'BUNDLE' ? 'inventory_2' : 'shopping_bag'}</span>
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow ring-2 ring-white dark:ring-card-dark z-10">{item.quantity}</span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-0.5 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">{item.itemName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {item.isCustomCombo ? 'Combo tự chọn' : (item.itemType === 'BUNDLE' ? 'Combo' : 'Sản phẩm')}
                    </p>
                    
                    {item.isCustomCombo && (
                      <div className="mt-1 mb-1 space-y-0.5">
                        {parseCustomCombo(item.customComboData)?.items?.slice(0, 3).map((prod: any, idx: number) => (
                          <p key={idx} className="text-[9px] text-gray-400 truncate leading-none italic">
                            - {prod.name} x{prod.quantity}
                          </p>
                        ))}
                        {(parseCustomCombo(item.customComboData)?.items?.length || 0) > 3 && (
                          <p className="text-[9px] text-gray-400 leading-none">...</p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-[11px] font-bold text-primary mt-1">
                      {item.itemPrice.toLocaleString()}₫ x {item.quantity} = {item.subtotal.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Discount Display (read-only, applied from Cart) */}
            <div className="px-5 py-4 bg-gray-50 dark:bg-surface-darker border-y border-gray-200 dark:border-white/10">
              {discount ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">{discount.code}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">-{discount.discountValue.toLocaleString()}₫</span>
                  </div>
                  <button onClick={handleRemoveDiscount} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Xóa mã">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">confirmation_number</span>
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    Bạn có mã giảm giá? <button onClick={() => onNavigate('cart')} className="font-bold underline hover:opacity-80">Nhập mã ở Giỏ hàng</button>
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-3 bg-white dark:bg-card-dark">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Tạm tính</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">{subtotal.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Vận chuyển</span>
                <span className="text-gray-900 dark:text-gray-200 font-semibold">Miễn phí</span>
              </div>
              {tierPercent > 0 && (
                <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">trending_down</span>
                    Giảm theo đơn ({tierPercent}%)
                  </span>
                  <span className="font-bold">-{tierAmount.toLocaleString()}₫</span>
                </div>
              )}
              {discount && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Mã giảm giá</span>
                  <span className="font-bold">-{discountValue.toLocaleString()}₫</span>
                </div>
              )}
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Tổng cộng</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary tracking-tight">{total.toLocaleString()}₫</span>
                    <span className="text-xs text-gray-500">Đã bao gồm VAT</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !selectedAddressId || cartItems.length === 0}
                className="w-full mt-6 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-700 hover:brightness-110 text-white py-4 text-base font-bold shadow-lg shadow-red-500/30 dark:shadow-none transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">{isSubmitting ? 'progress_activity' : 'lock'}</span>
                <span>{isSubmitting ? 'Đang xử lý...' : paymentMethod === 'VN_PAY' ? 'Thanh Toán VNPay' : 'Đặt Hàng (COD)'}</span>
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                <span className="text-[10px] text-gray-500 font-medium">+ Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
