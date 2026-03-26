import React from 'react';

export type TimelineStatus =
  | 'CREATED'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

interface OrderTimelineProps {
  status: TimelineStatus;
  className?: string;
}

const STEPS = [
  { key: 'CREATED', label: 'Đơn hàng đã đặt', icon: 'receipt_long' },
  { key: 'PAID', label: 'Đơn hàng đã thanh toán', icon: 'payments' },
  { key: 'PROCESSING', label: 'Đã giao cho ĐVVC', icon: 'inventory_2' },
  { key: 'SHIPPED', label: 'Đang giao', icon: 'local_shipping' },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: 'task_alt' },
] as const;

const getProgressIndex = (status: TimelineStatus): number => {
  if (status === 'CREATED' || status === 'WAITING_PAYMENT') return 0;
  if (status === 'PAID') return 1;
  if (status === 'PROCESSING') return 2;
  if (status === 'SHIPPED') return 3;
  if (status === 'COMPLETED') return 4;
  return -1;
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, className = '' }) => {
  const progressIndex = getProgressIndex(status);
  const currentStepLabel = progressIndex >= 0 ? STEPS[progressIndex].label : 'Đơn đã hủy';

  return (
    <div className={`rounded-2xl border border-gray-300 dark:border-white/20 bg-white/90 dark:bg-surface-dark/70 p-4 ${className}`}>
      <p className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-200">
        Tiến trình hiện tại: <span className="text-primary font-bold">{currentStepLabel}</span>
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-[680px] px-1">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-5 left-0 right-0 h-[4px] bg-gray-300 dark:bg-white/20" />
            <div
              className={`absolute top-5 left-0 h-[4px] transition-all duration-500 ${status === 'CANCELLED' ? 'bg-red-600' : 'bg-primary'}`}
              style={{ width: `${Math.max(0, (progressIndex / (STEPS.length - 1)) * 100)}%` }}
            />

            {STEPS.map((step, index) => {
              const done = progressIndex >= index;
              const active = progressIndex === index;
              const isCancelled = status === 'CANCELLED';

              return (
                <div key={step.key} className="relative z-10 w-32 text-center">
                  <div
                    className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCancelled
                        ? 'border-gray-300 dark:border-white/20 bg-white dark:bg-surface-dark text-gray-400 dark:text-gray-500'
                        : done
                        ? `border-primary bg-primary text-white ${active ? 'ring-4 ring-primary/30 scale-110 shadow-lg shadow-primary/25' : ''}`
                        : 'border-gray-400 dark:border-white/25 bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{step.icon}</span>
                  </div>
                  <p className={`text-sm ${active ? 'font-black text-primary' : done ? 'font-bold text-gray-800 dark:text-gray-100' : 'font-semibold text-gray-500 dark:text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {status === 'CANCELLED' && (
        <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400">
          Đơn hàng đã bị hủy.
        </div>
      )}
    </div>
  );
};
