import React, { useState, useEffect, useCallback } from 'react';
import { Screen } from '../types';
import { authApi } from '../services/api';
import { orderApi, OrderResponse, OrderStatus, PageResponse } from '../services/orderApi';
import { paymentApi, PaymentResponse } from '../services/paymentApi';
import { useConfirmDialog } from '../components/ConfirmDialog';

interface OrdersProps {
  onNavigate: (screen: Screen) => void;
}

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string; bg: string }> = {
  CREATED: { label: 'Đã tạo', color: 'text-blue-700 dark:text-blue-400', icon: 'edit_note', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  WAITING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-amber-700 dark:text-amber-400', icon: 'schedule', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-700 dark:text-emerald-400', icon: 'paid', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  PROCESSING: { label: 'Đang xử lý', color: 'text-indigo-700 dark:text-indigo-400', icon: 'pending', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-cyan-700 dark:text-cyan-400', icon: 'local_shipping', bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-green-700 dark:text-green-400', icon: 'check_circle', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700 dark:text-red-400', icon: 'cancel', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};

const PAYMENT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chưa thanh toán', color: 'text-amber-600 dark:text-amber-400' },
  SUCCESS: { label: 'Đã thanh toán', color: 'text-green-600 dark:text-green-400' },
  FAILED: { label: 'Thất bại', color: 'text-red-600 dark:text-red-400' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-600 dark:text-gray-400' },
  EXPIRED: { label: 'Hết hạn', color: 'text-gray-500 dark:text-gray-500' },
};

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<Record<number, PaymentResponse>>({});
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await orderApi.getMyOrders(pageNum, 10);
      const data = res.data as PageResponse<OrderResponse>;
      setOrders(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    fetchOrders(page);
  }, [page, fetchOrders, onNavigate]);

  const handleToggleDetail = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    // Fetch payment info if not cached
    if (!paymentInfo[orderId]) {
      try {
        const res = await paymentApi.getByOrderId(orderId);
        setPaymentInfo(prev => ({ ...prev, [orderId]: res.data }));
      } catch {
        // Payment info may not exist for some orders
      }
    }
  };

  const { confirm } = useConfirmDialog();

  const handleCancelOrder = async (orderId: number) => {
    const ok = await confirm({
      title: 'Hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.',
      confirmText: 'Hủy đơn',
      cancelText: 'Quay lại',
      variant: 'warning',
      icon: 'cancel',
    });
    if (!ok) return;
    setCancellingId(orderId);
    try {
      const res = await orderApi.cancel(orderId);
      // Update order in list
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      setSuccessMsg('Đã hủy đơn hàng thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Hủy đơn hàng thất bại');
      setTimeout(() => setError(''), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (status: OrderStatus) => status === 'CREATED' || status === 'WAITING_PAYMENT';

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (!authApi.isAuthenticated()) return null;

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark min-h-screen py-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Quay lại</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {totalItems > 0 ? `${totalItems} đơn hàng` : 'Chưa có đơn hàng nào'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'ALL' as const, label: 'Tất cả' },
            { key: 'CREATED' as const, label: 'Đã tạo' },
            { key: 'WAITING_PAYMENT' as const, label: 'Chờ TT' },
            { key: 'PAID' as const, label: 'Đã TT' },
            { key: 'PROCESSING' as const, label: 'Xử lý' },
            { key: 'SHIPPED' as const, label: 'Giao hàng' },
            { key: 'COMPLETED' as const, label: 'Hoàn thành' },
            { key: 'CANCELLED' as const, label: 'Đã hủy' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFilterStatus(item.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filterStatus === item.key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-7xl text-gray-300 dark:text-gray-600 mb-4">inbox</span>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {filterStatus === 'ALL' ? 'Chưa có đơn hàng nào' : 'Không có đơn hàng nào'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filterStatus === 'ALL' ? 'Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên!' : 'Không tìm thấy đơn hàng với trạng thái này.'}
            </p>
            {filterStatus !== 'ALL' ? (
              <button
                onClick={() => setFilterStatus('ALL')}
                className="px-6 py-3 border border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Xem tất cả đơn hàng
              </button>
            ) : (
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
              >
                Mua sắm ngay
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Order List */}
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const statusCfg = STATUS_CONFIG[order.status];
                const isExpanded = expandedOrderId === order.id;
                const payment = paymentInfo[order.id];

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => handleToggleDetail(order.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${statusCfg.bg} border flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined ${statusCfg.color}`}>{statusCfg.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Đơn hàng {formatDate(order.createdAt).split(',')[0]}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                                <span className="material-symbols-outlined text-sm">{statusCfg.icon}</span>
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {formatDate(order.createdAt)} · {order.items.length} sản phẩm
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-black text-primary">{order.totalAmount.toLocaleString()}₫</p>
                          </div>
                          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-white/5">
                        {/* Items */}
                        <div className="p-5">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                            Sản phẩm
                          </h4>
                          <div className="space-y-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between gap-4 py-3 px-4 bg-gray-50 dark:bg-surface-dark rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-surface-darker flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-gray-500 text-lg">
                                      {item.itemType === 'BUNDLE' ? 'redeem' : 'shopping_bag'}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.itemName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.itemType === 'BUNDLE' ? 'Combo' : 'Sản phẩm'} · {item.priceSnapshot.toLocaleString()}₫ × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{item.subtotal.toLocaleString()}₫</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Info */}
                        {(order.receiverName || order.shippingAddress) && (
                          <div className="px-5 pb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">local_shipping</span>
                              Thông tin giao hàng
                            </h4>
                            <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {order.receiverName && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Người nhận</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.receiverName}</p>
                                  </div>
                                )}
                                {order.receiverPhone && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Số điện thoại</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.receiverPhone}</p>
                                  </div>
                                )}
                                {order.shippingAddress && (
                                  <div className="sm:col-span-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Địa chỉ</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.shippingAddress}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Discount Info */}
                        {order.discountCode && (
                          <div className="px-5 pb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">sell</span>
                              Mã giảm giá
                            </h4>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                              <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold font-mono tracking-wider border border-emerald-200 dark:border-emerald-700/40">
                                {order.discountCode}
                              </span>
                              {order.discountAmount != null && order.discountAmount > 0 && (
                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                  -{order.discountAmount.toLocaleString()}₫
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Info */}
                        {payment && (
                          <div className="px-5 pb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">credit_card</span>
                              Thanh toán
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phương thức</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {payment.method === 'VN_PAY' ? 'VNPay' : 'COD'}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trạng thái</p>
                                <p className={`text-sm font-bold ${PAYMENT_STATUS_LABEL[payment.status]?.color || 'text-gray-900 dark:text-white'}`}>
                                  {PAYMENT_STATUS_LABEL[payment.status]?.label || payment.status}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số tiền</p>
                                <p className="text-sm font-bold text-primary">{payment.amount.toLocaleString()}₫</p>
                              </div>
                              {payment.paidAt && (
                                <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-xl">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thanh toán lúc</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(payment.paidAt)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* VAT Info */}
                        {order.vatCompanyName && (
                          <div className="px-5 pb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">description</span>
                              Thông tin xuất hóa đơn
                            </h4>
                            <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl text-sm space-y-1">
                              <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Công ty:</span> {order.vatCompanyName}</p>
                              {order.vatTaxCode && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">MST:</span> {order.vatTaxCode}</p>}
                              {order.vatPhone && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">SĐT:</span> {order.vatPhone}</p>}
                              {order.vatAddress && <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Địa chỉ:</span> {order.vatAddress}</p>}
                            </div>
                          </div>
                        )}

                        {/* Order Summary + Actions */}
                        <div className="px-5 pb-5">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-xl border border-primary/10 dark:border-primary/20">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền đơn hàng</p>
                              <p className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString()}₫</p>
                            </div>
                            <div className="flex gap-3">
                              {canCancel(order.status) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.id); }}
                                  disabled={cancellingId === order.id}
                                  className="px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    {cancellingId === order.id ? 'progress_activity' : 'close'}
                                  </span>
                                  {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                                </button>
                              )}
                              {order.status === 'WAITING_PAYMENT' && payment?.method === 'VN_PAY' && payment?.paymentUrl && (
                                <a
                                  href={payment.paymentUrl}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                  <span className="material-symbols-outlined text-lg">payments</span>
                                  Thanh toán ngay
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      i === page
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))}
                {page + 3 < totalPages && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
