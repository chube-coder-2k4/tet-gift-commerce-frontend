import React, { useState } from 'react';
import { invoiceApi, InvoiceResponse } from '../services/invoiceApi';

interface InvoiceButtonProps {
  orderId: number;
  orderStatus: string;
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

/**
 * Reusable Invoice Button — handles generate + view/download PDF.
 * Only shows for orders that have been paid (PAID, PROCESSING, SHIPPED, COMPLETED).
 */
export const InvoiceButton: React.FC<InvoiceButtonProps> = ({
  orderId,
  orderStatus,
  variant = 'default',
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [error, setError] = useState('');

  // Only show for orders with successful payment
  const validStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
  if (!validStatuses.includes(orderStatus)) return null;

  const handleViewInvoice = async () => {
    setLoading(true);
    setError('');

    try {
      // First try to get existing invoice
      let inv = invoice;
      if (!inv) {
        try {
          const res = await invoiceApi.getByOrderId(orderId);
          inv = res.data;
          setInvoice(inv);
        } catch {
          // Invoice doesn't exist yet, generate it
          const res = await invoiceApi.generate(orderId);
          inv = res.data;
          setInvoice(inv);
        }
      }

      // Open PDF URL directly (Cloudinary URL)
      if (inv?.pdfUrl) {
        window.open(inv.pdfUrl, '_blank');
      } else {
        // Fallback: download via API
        await invoiceApi.downloadPdf(orderId);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo hóa đơn');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      await invoiceApi.downloadPdf(orderId);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải hóa đơn');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className={`p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">receipt_long</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Hóa đơn</p>
              {invoice ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.invoiceNumber}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Tạo & xem hóa đơn PDF</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewInvoice}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">
                {loading ? 'progress_activity' : 'visibility'}
              </span>
              {loading ? 'Đang tạo...' : 'Xem'}
            </button>
            {invoice?.pdfUrl && (
              <button
                onClick={handleDownload}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Tải PDF
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">error</span>
            {error}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleViewInvoice}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            {loading ? 'progress_activity' : 'receipt_long'}
          </span>
          {loading ? 'Đang tạo...' : 'Xem hóa đơn'}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      <button
        onClick={handleViewInvoice}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">
          {loading ? 'progress_activity' : 'receipt_long'}
        </span>
        {loading ? 'Đang tạo hóa đơn...' : 'Xem hóa đơn'}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};
