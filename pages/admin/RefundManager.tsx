import React, { useState, useEffect, useCallback } from 'react';
import { adminRefundApi, OrderResponse, PageResponse } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

const RefundManager: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'REFUNDED'>('ALL');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Export state
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exporting, setExporting] = useState(false);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminRefundApi.getAll(filterStatus, page, 10);
      const data = res.data as PageResponse<OrderResponse>;
      setOrders(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải danh sách hoàn tiền' });
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);
  useEffect(() => { setPage(0); }, [filterStatus]);

  const { confirm } = useConfirmDialog();

  const handleConfirmRefund = async (orderId: number) => {
    const ok = await confirm({
      title: 'Xác nhận hoàn tiền',
      message: 'Bạn đã chuyển khoản hoàn tiền cho khách hàng? Hành động này sẽ đánh dấu đơn hàng là "Đã hoàn tiền".',
      confirmText: 'Xác nhận đã hoàn tiền',
      cancelText: 'Quay lại',
      variant: 'warning',
      icon: 'price_check',
    });
    if (!ok) return;
    setConfirmingId(orderId);
    try {
      await adminRefundApi.confirm(orderId);
      setMsg({ type: 'success', text: `Đã xác nhận hoàn tiền cho đơn hàng #${orderId}` });
      fetchRefunds();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xác nhận hoàn tiền thất bại' });
    } finally {
      setConfirmingId(null);
    }
    setTimeout(() => setMsg(null), 4000);
  };

  const handleExport = async () => {
    if (!exportStartDate || !exportEndDate) {
      setMsg({ type: 'error', text: 'Vui lòng chọn khoảng thời gian trước khi xuất báo cáo.' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    setExporting(true);
    try {
      await adminRefundApi.exportReport(filterStatus, exportStartDate, exportEndDate, exportFormat);
      setMsg({ type: 'success', text: `Xuất báo cáo (${filterStatus === 'ALL' ? 'Tất cả' : filterStatus === 'PENDING' ? 'Chờ xử lý' : 'Đã hoàn'}) thành công!` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xuất báo cáo thất bại' });
    } finally {
      setExporting(false);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">currency_exchange</span>
            Yêu cầu hoàn tiền
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} {filterStatus === 'PENDING' ? 'yêu cầu đang chờ xử lý' : filterStatus === 'REFUNDED' ? 'yêu cầu đã hoàn tiền' : 'yêu cầu'}</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-surface-dark p-1 rounded-xl shadow-inner border border-gray-200 dark:border-white/5 w-full sm:w-auto">
          <button onClick={() => setFilterStatus('ALL')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${filterStatus === 'ALL' ? 'bg-white dark:bg-white/10 text-primary shadow-sm dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Tất cả</button>
          <button onClick={() => setFilterStatus('PENDING')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${filterStatus === 'PENDING' ? 'bg-white dark:bg-white/10 text-orange-600 dark:text-orange-400 shadow-sm dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <span className="size-1.5 rounded-full bg-orange-500"></span>
            Chờ xử lý
          </button>
          <button onClick={() => setFilterStatus('REFUNDED')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${filterStatus === 'REFUNDED' ? 'bg-white dark:bg-white/10 text-teal-600 dark:text-teal-400 shadow-sm dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <span className="size-1.5 rounded-full bg-teal-500"></span>
            Đã hoàn
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-6 p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-emerald-500">download</span>
          Xuất báo cáo hoàn tiền
        </h3>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Từ ngày</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={e => setExportStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Đến ngày</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={e => setExportEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Định dạng</label>
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as 'xlsx' | 'csv')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white focus:border-primary outline-none"
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg whitespace-nowrap"
          >
            <span className={`material-symbols-outlined text-lg ${exporting ? 'animate-spin' : ''}`}>
              {exporting ? 'progress_activity' : 'file_download'}
            </span>
            {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      {/* Refund Table */}
      {loading ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined animate-spin text-3xl text-gray-400">progress_activity</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">inbox</span>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Không có yêu cầu hoàn tiền nào</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã ĐH</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khách hàng</th>
                  <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số tiền hoàn</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày đặt</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngân hàng</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STK</th>
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chủ TK</th>
                  <th className="text-center px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.customerName || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerEmail || '—'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.receiverPhone || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg">
                        {order.refundBankName || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-700 dark:text-gray-300">{order.refundBankAccount || '—'}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{order.refundAccountHolder || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      {order.status === 'CANCELLED_PENDING_REFUND' ? (
                        <button
                          onClick={() => handleConfirmRefund(order.id)}
                          disabled={confirmingId === order.id}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 mx-auto shadow-md"
                        >
                          <span className={`material-symbols-outlined text-sm ${confirmingId === order.id ? 'animate-spin' : ''}`}>
                            {confirmingId === order.id ? 'progress_activity' : 'price_check'}
                          </span>
                          {confirmingId === order.id ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Đã hoàn tiền
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                    <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.customerName || 'Khách hàng'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 pt-3 space-y-3">
                    {/* Bank Info */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thông tin ngân hàng</p>
                      <div className="grid grid-cols-1 gap-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Ngân hàng:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{order.refundBankName || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">STK:</span>
                          <span className="font-mono font-semibold text-gray-900 dark:text-white">{order.refundBankAccount || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Chủ TK:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{order.refundAccountHolder || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    {order.status === 'CANCELLED_PENDING_REFUND' ? (
                      <button
                        onClick={() => handleConfirmRefund(order.id)}
                        disabled={confirmingId === order.id}
                        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                      >
                        <span className={`material-symbols-outlined text-lg ${confirmingId === order.id ? 'animate-spin' : ''}`}>
                          {confirmingId === order.id ? 'progress_activity' : 'price_check'}
                        </span>
                        {confirmingId === order.id ? 'Đang xử lý...' : 'Xác nhận đã hoàn tiền'}
                      </button>
                    ) : (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-sm font-bold">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          Đã hoàn tiền
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="mt-4 px-1" />
          )}
        </>
      )}
    </div>
  );
};

export default RefundManager;
