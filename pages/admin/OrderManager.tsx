import React, { useState, useEffect, useCallback } from 'react';
import { adminOrderApi, adminPaymentApi, OrderResponse, OrderStatus, PaymentResponse, PageResponse } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';
import { InvoiceButton } from '../../components/InvoiceButton';
import Pagination from '../../components/Pagination';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  CREATED: { label: 'Đã tạo', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  WAITING_PAYMENT: { label: 'Chờ thanh toán', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
  SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
};

const ALL_STATUSES: OrderStatus[] = ['CREATED', 'WAITING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<Record<number, PaymentResponse | null>>({});
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const data = res.data as PageResponse<OrderResponse>;
      setOrders(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải đơn hàng' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!paymentInfo[orderId]) {
      try {
        const res = await adminPaymentApi.getByOrderId(orderId);
        setPaymentInfo(prev => ({ ...prev, [orderId]: res.data as PaymentResponse }));
      } catch {
        setPaymentInfo(prev => ({ ...prev, [orderId]: null }));
      }
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      await adminOrderApi.updateStatus(orderId, newStatus);
      setMsg({ type: 'success', text: `Cập nhật trạng thái → ${STATUS_MAP[newStatus].label}` });
      fetchOrders();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Cập nhật thất bại' });
    } finally {
      setUpdatingStatus(null);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const { confirm } = useConfirmDialog();

  const handleCancel = async (orderId: number) => {
    const ok = await confirm({
      title: 'Hủy đơn hàng',
      message: 'Đơn hàng sẽ bị hủy và không thể khôi phục. Bạn có chắc chắn?',
      confirmText: 'Hủy đơn',
      cancelText: 'Quay lại',
      variant: 'warning',
      icon: 'cancel',
    });
    if (!ok) return;
    setUpdatingStatus(orderId);
    try {
      await adminOrderApi.cancel(orderId);
      setMsg({ type: 'success', text: 'Đã hủy đơn hàng!' });
      fetchOrders();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Hủy thất bại' });
    } finally {
      setUpdatingStatus(null);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} đơn hàng</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12"><span className="material-symbols-outlined animate-spin text-3xl text-gray-400">progress_activity</span></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Không có đơn hàng</div>
        ) : orders.map(order => {
          const st = STATUS_MAP[order.status as OrderStatus] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
          const isExpanded = expandedId === order.id;
          const payment = paymentInfo[order.id];

          return (
            <div key={order.id} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden hover:shadow-md transition-all">
              {/* Header row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">Đơn hàng {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.customerName && <><span className="font-medium text-gray-700 dark:text-gray-300">{order.customerName}</span> · </>}{order.items?.length || 0} sản phẩm
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-white/5 pt-4 space-y-4">
                  {/* Customer Info */}
                  {(order.customerName || order.customerEmail) && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">person</span>
                        Khách hàng
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{(order.customerName || 'K').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{order.customerName || 'Khách hàng'}</p>
                          {order.customerEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customerEmail}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Info */}
                  {(order.receiverName || order.shippingAddress) && (
                    <div className="p-3 bg-gray-50 dark:bg-surface-darker rounded-xl">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        Giao hàng
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        {order.receiverName && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Người nhận: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{order.receiverName}</span>
                          </div>
                        )}
                        {order.receiverPhone && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">SĐT: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{order.receiverPhone}</span>
                          </div>
                        )}
                        {order.shippingAddress && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Địa chỉ: </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{order.shippingAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Sản phẩm</p>
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={item.id || i} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-surface-darker rounded-xl text-sm">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{item.itemName || 'Sản phẩm'}</span>
                            <span className="text-gray-400 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Discount Info */}
                  {order.tierDiscountAmount != null && order.tierDiscountAmount > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">trending_down</span>
                        Giảm theo đơn hàng
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-700/40">
                          -{order.tierDiscountPercent}%
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          -{formatCurrency(order.tierDiscountAmount)}
                        </span>
                        {order.subtotalBeforeDiscount != null && (
                          <span className="text-xs text-gray-400 ml-auto">
                            Subtotal: {formatCurrency(order.subtotalBeforeDiscount)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Total luôn hiện ở các đơn */}
                  {(order.totalAmount + (order.discountAmount || 0) + (order.tierDiscountAmount || 0)) && (
                      <div  className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">payments</span>
                          Giá tạm tính (chưa áp mã giảm giá)
                        </h4>
                        <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                                <span className="font-bold text-gray-900 dark:text-white">
                                     {(order.totalAmount + (order.discountAmount || 0) + (order.tierDiscountAmount || 0)).toLocaleString()}₫
                                </span>
                        </div>
                      </div>
                  )}


                  {/* Discount Info */}
                  {order.discountCode && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800/30">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">sell</span>
                          Thông tin ưu đãi
                        </p>

                        {/* Dòng giá tạm tính (Giá gốc) */}
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/50">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Giá tạm tính:</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-through decoration-gray-400">
        {formatCurrency(order.totalAmount + (order.discountAmount || 0))}
      </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold font-mono tracking-wider border border-emerald-200 dark:border-emerald-700/40">
          {order.discountCode}
        </span>
                          </div>

                          {order.discountAmount != null && order.discountAmount > 0 && (
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          -{formatCurrency(order.discountAmount)}
        </span>
                          )}
                        </div>
                      </div>
                  )}

                  {/* Payment Info */}
                  {payment && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Thanh toán</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Phương thức: <b className="text-gray-900 dark:text-white">{payment.method}</b></span>
                        <span className="text-gray-600 dark:text-gray-400">Trạng thái: <b className={payment.status === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'}>{payment.status}</b></span>
                      </div>
                    </div>
                  )}

                  {/* VAT Info */}
                  {order.vatCompanyName && (
                    <div className="p-3 bg-gray-50 dark:bg-surface-darker rounded-xl">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Xuất hóa đơn</p>
                      <div className="text-sm space-y-0.5 text-gray-700 dark:text-gray-300">
                        <p><span className="font-medium">Công ty:</span> {order.vatCompanyName}</p>
                        {order.vatTaxCode && <p><span className="font-medium">MST:</span> {order.vatTaxCode}</p>}
                        {order.vatAddress && <p><span className="font-medium">Địa chỉ:</span> {order.vatAddress}</p>}
                      </div>
                    </div>
                  )}

                  {/* Invoice */}
                  <InvoiceButton orderId={order.id} orderStatus={order.status} variant="card" />

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 block mb-1">Cập nhật trạng thái</label>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updatingStatus === order.id || order.status === 'CANCELLED' || order.status === 'COMPLETED'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white focus:border-primary outline-none disabled:opacity-50"
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                      </select>
                    </div>
                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={updatingStatus === order.id}
                        className="mt-5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="mt-4 px-1" />
      )}
    </div>
  );
};

export default OrderManager;
