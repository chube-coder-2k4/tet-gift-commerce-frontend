import React, { useState, useEffect } from 'react';
import { AdminOrder } from '../../types';
import { adminOrderApi } from '../../services/adminApi';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const pageSize = 10;

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrderApi.getAll(page, pageSize);
      let data = response.data.content || [];
      
      // Client-side filtering
      if (statusFilter) {
        data = data.filter((order: AdminOrder) => order.status === statusFilter);
      }
      
      setOrders(data);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || data.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    try {
      await adminOrderApi.updateStatus(orderId, newStatus);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Không thể cập nhật trạng thái đơn hàng');
    }
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
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Quản lý Đơn hàng
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {totalElements} đơn hàng
          </p>
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
              placeholder="Tìm theo mã đơn, tên khách hàng..."
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
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
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
                    Mã đơn
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Số SP
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.customer.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                      {order.items.length}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(order)}
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
        {!loading && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
            <p>Không có đơn hàng nào</p>
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
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-3xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60 sticky top-0 bg-white dark:bg-card-dark">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-surface-dark">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái hiện tại</p>
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED')}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPED">Đang giao</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Hủy đơn</option>
                  </select>
                )}
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Họ tên</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customer.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Số điện thoại</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Sản phẩm</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-surface-dark"
                    >
                      <div className="size-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined">image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 dark:bg-primary/20">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Tổng cộng
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>

              {/* Notes */}
              {selectedOrder.note && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Ghi chú</h4>
                  <p className="text-gray-600 dark:text-gray-300 p-3 rounded-xl bg-gray-50 dark:bg-surface-dark">
                    {selectedOrder.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
