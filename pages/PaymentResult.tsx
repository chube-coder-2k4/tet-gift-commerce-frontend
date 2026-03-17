import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { paymentApi, PaymentResponse } from '../services/paymentApi';
import { orderApi, OrderResponse } from '../services/orderApi';
import { InvoiceButton } from '../components/InvoiceButton';

interface PaymentResultProps {
  onNavigate: (screen: Screen) => void;
}

const PaymentResult: React.FC<PaymentResultProps> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const processPaymentResult = async () => {
      try {
        // Parse VNPay return URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hasQueryParams = Array.from(urlParams.keys()).length > 0;
        let orderId: number | null = null;
        let verifiedPayment: PaymentResponse | null = null;

        // 1) Callback flow: gửi toàn bộ params lên backend để xác thực chữ ký
        if (hasQueryParams) {
          const callbackParams = Object.fromEntries(urlParams.entries());
          const callbackRes = await paymentApi.verifyVnpayCallback(callbackParams);
          verifiedPayment = callbackRes.data;
          orderId = verifiedPayment?.orderId ?? null;

          if (!isCancelled) {
            setPayment(verifiedPayment);
            if (verifiedPayment?.status === 'SUCCESS') {
              setStatus('success');
            } else {
              setStatus('failed');
              setErrorMsg(callbackRes.message || 'Thanh toán thất bại hoặc lỗi xác thực.');
            }
          }

          // Dọn URL sau khi đã verify xong
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 2) Fallback flow: nếu không có callback params, dùng lastOrderId
        if (!orderId) {
          const savedOrderId = localStorage.getItem('lastOrderId');
          if (savedOrderId) {
            orderId = parseInt(savedOrderId);
            localStorage.removeItem('lastOrderId');
          }
        }

        // Fetch order and payment details if we have orderId
        if (orderId && !isNaN(orderId)) {
          try {
            const orderRes = await orderApi.getById(orderId);
            if (!isCancelled) {
              setOrder(orderRes.data);
            }

            if (!verifiedPayment) {
              const paymentRes = await paymentApi.getByOrderId(orderId);
              if (!isCancelled) {
                setPayment(paymentRes.data);
              }

              // Chỉ tự xác định khi không đi callback verify
              if (!hasQueryParams) {
                if (paymentRes.data.status === 'SUCCESS') {
                  setStatus('success');
                } else {
                  setStatus('failed');
                  setErrorMsg('Thanh toán chưa hoàn tất.');
                }
              }
            } else if (!hasQueryParams) {
              if (verifiedPayment.status === 'SUCCESS') {
                setStatus('success');
              } else {
                setStatus('failed');
                setErrorMsg('Thanh toán chưa hoàn tất.');
              }
            }
          } catch {
            // Order/payment fetch failed but callback verify may have succeeded already
            if (!isCancelled && !hasQueryParams) {
              setStatus('failed');
              setErrorMsg('Không thể tải thông tin đơn hàng.');
            }
          }
        } else if (!hasQueryParams && !isCancelled) {
          setStatus('failed');
          setErrorMsg('Không tìm thấy thông tin thanh toán.');
        }
      } catch {
        if (!isCancelled) {
          setStatus('failed');
          setErrorMsg('Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
        }
      }
    };

    processPaymentResult();
    return () => {
      isCancelled = true;
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đang xử lý thanh toán</h2>
          <p className="text-gray-500 dark:text-gray-400">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          {/* Status Header */}
          <div className={`p-8 text-center ${
            status === 'success'
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
              : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
              status === 'success'
                ? 'bg-green-100 dark:bg-green-900/40'
                : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              <span className={`material-symbols-outlined text-5xl ${
                status === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {status === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <h1 className={`text-2xl font-black mb-2 ${
              status === 'success'
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            }`}>
              {status === 'success' ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {status === 'success'
                ? 'Đơn hàng của bạn đã được xác nhận thành công.'
                : errorMsg || 'Thanh toán không thành công. Vui lòng thử lại.'}
            </p>
          </div>

          {/* Order & Payment Details */}
          <div className="p-6 space-y-4">
            {order && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng</span>
                  <span className="text-sm font-bold text-primary">#{order.id}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Số lượng</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.items.length} sản phẩm</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(order.createdAt)}</span>
                </div>
                {order.tierDiscountAmount != null && order.tierDiscountAmount > 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                    <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">trending_down</span>
                      Giảm theo đơn ({order.tierDiscountPercent}%)
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">-{order.tierDiscountAmount.toLocaleString()}₫</span>
                  </div>
                )}
                {order.discountCode && order.discountAmount != null && order.discountAmount > 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sell</span>
                      Mã {order.discountCode}
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">-{order.discountAmount.toLocaleString()}₫</span>
                  </div>
                )}
              </div>
            )}

            {payment && (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Phương thức</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {payment.method === 'VN_PAY' ? 'VNPay' : 'Thanh toán khi nhận hàng'}
                  </span>
                </div>
                {payment.transactionId && (
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-white/5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã giao dịch</span>
                    <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{payment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-primary">{payment.amount.toLocaleString()}₫</span>
                </div>
              </div>
            )}

            {/* Items List */}
            {order && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Chi tiết sản phẩm</h3>
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-surface-dark rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.priceSnapshot.toLocaleString()}₫ × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white ml-4">{item.subtotal.toLocaleString()}₫</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Download */}
          {status === 'success' && order && (
            <div className="px-6">
              <InvoiceButton orderId={order.id} orderStatus={order.status} variant="card" />
            </div>
          )}

          {/* Actions */}
          <div className="p-6 pt-2 space-y-3">
            {status === 'success' ? (
              <>
                <button
                  onClick={() => onNavigate('orders')}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full py-3 rounded-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">shopping_bag</span>
                  Tiếp tục mua sắm
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('orders')}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full py-3 rounded-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">home</span>
                  Về trang chủ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
