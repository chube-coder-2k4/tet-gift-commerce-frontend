import React, { useState, useCallback, useRef, useEffect } from 'react';

// ===== Types =====
interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: string;
}

interface ConfirmDialogContextType {
  confirm: (config: ConfirmDialogConfig) => Promise<boolean>;
}

// ===== Context =====
const ConfirmDialogContext = React.createContext<ConfirmDialogContextType | null>(null);

// ===== Hook =====
export const useConfirmDialog = (): ConfirmDialogContextType => {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  return ctx;
};

// ===== Provider Component =====
export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<(ConfirmDialogConfig & { resolve: (v: boolean) => void }) | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const confirm = useCallback((config: ConfirmDialogConfig): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialog({ ...config, resolve });
    });
  }, []);

  const handleConfirm = () => {
    dialog?.resolve(true);
    setDialog(null);
  };

  const handleCancel = () => {
    dialog?.resolve(false);
    setDialog(null);
  };

  // Close on Escape key
  useEffect(() => {
    if (!dialog) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dialog]);

  const VARIANT_CONFIG = {
    danger: {
      icon: 'warning',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: 'error',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    info: {
      icon: 'help',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Confirm Dialog Overlay */}
      {dialog && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === overlayRef.current) handleCancel(); }}
          style={{ animation: 'confirmFadeIn 0.15s ease-out' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
            style={{ animation: 'confirmSlideIn 0.2s ease-out' }}
          >
            {/* Content */}
            <div className="p-6 text-center">
              {/* Icon */}
              {(() => {
                const v = VARIANT_CONFIG[dialog.variant || 'danger'];
                const icon = dialog.icon || v.icon;
                return (
                  <div className={`w-14 h-14 rounded-2xl ${v.iconBg} flex items-center justify-center mx-auto mb-4`}>
                    <span className={`material-symbols-outlined text-3xl ${v.iconColor}`}>{icon}</span>
                  </div>
                );
              })()}

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {dialog.title}
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {dialog.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {dialog.cancelText || 'Hủy bỏ'}
              </button>
              <button
                onClick={handleConfirm}
                autoFocus
                className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${VARIANT_CONFIG[dialog.variant || 'danger'].buttonBg}`}
              >
                {dialog.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </ConfirmDialogContext.Provider>
  );
};

export default ConfirmDialogProvider;
