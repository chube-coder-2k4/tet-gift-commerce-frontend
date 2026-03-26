import React, { useMemo, useState } from 'react';
import { Screen } from '../types';
import { orderApi, OrderResponse, OrderStatus } from '../services/orderApi';
import { CopyTextButton } from '../components/CopyTextButton';

interface TrackOrderProps {
  onNavigate: (screen: Screen) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string; bg: string }> = {
  CREATED: { label: 'Đã tạo', color: 'text-blue-700 dark:text-blue-400', icon: 'edit_note', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  WAITING_PAYMENT: { label: 'Chờ thanh toán', color: 'text-amber-700 dark:text-amber-400', icon: 'schedule', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-700 dark:text-emerald-400', icon: 'paid', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  PROCESSING: { label: 'Đang xử lý', color: 'text-indigo-700 dark:text-indigo-400', icon: 'pending', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-cyan-700 dark:text-cyan-400', icon: 'local_shipping', bg: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-green-700 dark:text-green-400', icon: 'check_circle', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700 dark:text-red-400', icon: 'cancel', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};

const PROGRESS_STEPS = [
  { key: 'CREATED', label: 'Đơn đã đặt', icon: 'receipt_long' },
  { key: 'PAID', label: 'Đã thanh toán', icon: 'payments' },
  { key: 'PROCESSING', label: 'Đang xử lý', icon: 'inventory_2' },
  { key: 'SHIPPED', label: 'Đang giao', icon: 'local_shipping' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: 'check_circle' },
] as const;

const getProgressIndex = (status: OrderStatus): number => {
  if (status === 'CREATED' || status === 'WAITING_PAYMENT') return 0;
  if (status === 'PAID') return 1;
  if (status === 'PROCESSING') return 2;
  if (status === 'SHIPPED') return 3;
  if (status === 'COMPLETED') return 4;
  return -1;
};

const TrackOrder: React.FC<TrackOrderProps> = ({ onNavigate }) => {
  const [orderCode, setOrderCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);

  const canSubmit = useMemo(() => orderCode.trim().length >= 3, [orderCode]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const onTrack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = orderCode.trim();
    if (!code) {
      setError('Vui lòng nhập mã đơn hàng để tra cứu.');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await orderApi.trackByCode(code);
      setOrder(res.data);
    } catch (err: any) {
      setError(err?.message || 'Không tìm thấy đơn hàng với mã này.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusCfg = order ? STATUS_CONFIG[order.status] : null;
  const progressIndex = order ? getProgressIndex(order.status) : -1;

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Quay lại trang chủ
        </button>

        <div className="bg-white dark:bg-card-dark rounded-3xl border border-gray-200/90 dark:border-white/10 p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Tra cứu đơn hàng</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Nhập mã đơn hàng để xem trạng thái đơn và thông tin giao nhận.
          </p>

          <form onSubmit={onTrack} className="flex flex-col sm:flex-row gap-3">
            <input
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Ví dụ: ORD-2026-000123"
              className="flex-1 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-surface-dark px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="rounded-xl px-5 py-3 font-bold text-white bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {order && statusCfg && (
          <div className="mt-6 bg-white dark:bg-card-dark rounded-3xl border border-gray-200/90 dark:border-white/10 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-xl font-black text-primary tracking-wide">{order.orderCode || '-'}</p>
                  {order.orderCode && <CopyTextButton text={order.orderCode} />}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Đặt lúc: {formatDate(order.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                <span className="material-symbols-outlined text-base">{statusCfg.icon}</span>
                {statusCfg.label}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="mb-7 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-surface-dark/60 p-4 md:p-5">
              <div className="overflow-x-auto">
                <div className="min-w-[720px] px-1">
                  <div className="relative flex items-start justify-between">
                    <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 dark:bg-white/10" />
                    <div
                      className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(0, (progressIndex / (PROGRESS_STEPS.length - 1)) * 100)}%` }}
                    />

                    {PROGRESS_STEPS.map((step, index) => {
                      const done = progressIndex >= index;
                      const active = progressIndex === index;

                      return (
                        <div key={step.key} className="relative z-10 w-32 text-center">
                          <div
                            className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                              done
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 dark:border-white/20 bg-white dark:bg-surface-dark text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">{step.icon}</span>
                          </div>
                          <p className={`text-[11px] font-bold ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {order.status === 'CANCELLED' && (
                <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400">
                  Đơn hàng đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ shop.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-surface-dark p-4 border border-gray-200/80 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Người nhận</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.receiverName || '-'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-surface-dark p-4 border border-gray-200/80 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.receiverPhone || '-'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-surface-dark p-4 md:col-span-2 border border-gray-200/80 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Địa chỉ giao hàng</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.shippingAddress || '-'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Sản phẩm</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-surface-dark p-3 border border-gray-200/80 dark:border-white/10">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.itemName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} x {item.priceSnapshot.toLocaleString()}₫</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.subtotal.toLocaleString()}₫</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Tổng giá trị đơn</span>
              <span className="text-2xl font-black text-primary">{order.totalAmount.toLocaleString()}₫</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
