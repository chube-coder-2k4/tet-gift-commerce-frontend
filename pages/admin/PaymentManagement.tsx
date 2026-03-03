import React, { useState, useEffect } from 'react';
import { AdminPayment } from '../../types';
import { adminPaymentApi } from '../../services/adminApi';

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  const pageSize = 10;

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, methodFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await adminPaymentApi.getAll(page, pageSize);
      let data = response.data.content || [];
      
      // Client-side filtering
      if (statusFilter) {
        data = data.filter((p: AdminPayment) => p.status === statusFilter);
      }
      if (methodFilter) {
        data = data.filter((p: AdminPayment) => p.method === methodFilter);
      }
      
      setPayments(data);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || data.length);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setPayments([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'COMPLETED':
        return 'Thành công';
      case 'FAILED':
        return 'Thất bại';
      case 'REFUNDED':
        return 'Hoàn tiền';
      default:
        return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'VNPAY':
        return 'account_balance';
      case 'MOMO':
        return 'phone_iphone';
      case 'COD':
        return 'local_shipping';
      case 'BANK_TRANSFER':
        return 'account_balance_wallet';
      default:
        return 'payment';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'VNPAY':
        return 'VNPay';
      case 'MOMO':
        return 'MoMo';
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      default:
        return method;
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const completedPayments = payments.filter((p) => p.status === 'COMPLETED');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Quản lý Thanh toán
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {totalElements} giao dịch
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                payments
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Doanh thu</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Thành công</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {completedPayments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                pending
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang chờ</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo mã giao dịch, mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="COMPLETED">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Hoàn tiền</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả phương thức</option>
            <option value="VNPAY">VNPay</option>
            <option value="MOMO">MoMo</option>
            <option value="COD">COD</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-surface-dark border-b border-gray-200 dark:border-[#3a3330]/60">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mã giao dịch
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {payment.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                        {payment.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">
                          {getMethodIcon(payment.method)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {getMethodLabel(payment.method)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(payment)}
                          className="size-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3">credit_card_off</span>
            <p>Không có giao dịch nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#3a3330]/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3a3330]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3a3330]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                  Chi tiết thanh toán
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã giao dịch</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">
                    {selectedPayment.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng</p>
                  <p className="font-mono font-medium text-blue-600 dark:text-blue-400">
                    {selectedPayment.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phương thức</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-gray-400">
                      {getMethodIcon(selectedPayment.method)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getMethodLabel(selectedPayment.method)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedPayment.status
                    )}`}
                  >
                    {getStatusLabel(selectedPayment.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian tạo</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian thanh toán</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.paidAt)}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Số tiền</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
