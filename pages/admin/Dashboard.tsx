import React, { useState, useEffect } from 'react';
import { DashboardStats, AdminOrder, AdminProduct } from '../../types';
import { adminDashboardApi } from '../../services/adminApi';

// Complete mock data for initial render
const mockStats: DashboardStats = {
  totalUsers: 156,
  totalProducts: 48,
  totalOrders: 235,
  totalRevenue: 125000000,
  recentOrders: [
    {
      id: 1,
      orderNumber: 'ORD-001',
      customer: { id: 1, name: 'Nguyễn Văn A', email: 'a@gmail.com', phone: '0901234567' },
      totalAmount: 1250000,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'COD',
      shippingAddress: '123 Nguyễn Huệ, Q1, HCM',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      customer: { id: 2, name: 'Trần Thị B', email: 'b@gmail.com', phone: '0912345678' },
      totalAmount: 2100000,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'BANKING',
      shippingAddress: '456 Lê Lợi, Q3, HCM',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      customer: { id: 3, name: 'Phạm Văn C', email: 'c@gmail.com', phone: '0923456789' },
      totalAmount: 850000,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'VNPAY',
      shippingAddress: '789 Hai Bà Trưng, Q1, HCM',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as AdminOrder[],
  topProducts: [
    { product: { id: 1, name: 'Hộp Quà Phú Quý', price: 1250000 } as AdminProduct, soldCount: 45 },
    { product: { id: 2, name: 'Giỏ Quà Tài Lộc', price: 850000 } as AdminProduct, soldCount: 38 },
    { product: { id: 3, name: 'Rượu Vang Premium', price: 2100000 } as AdminProduct, soldCount: 28 },
    { product: { id: 4, name: 'Set Hạt Dinh Dưỡng', price: 550000 } as AdminProduct, soldCount: 25 },
  ],
  ordersByStatus: [
    { status: 'PENDING', count: 12 },
    { status: 'CONFIRMED', count: 8 },
    { status: 'PROCESSING', count: 5 },
    { status: 'SHIPPED', count: 15 },
    { status: 'DELIVERED', count: 89 },
    { status: 'CANCELLED', count: 6 },
  ],
  revenueByMonth: [
    { month: 'T10/2025', revenue: 45000000 },
    { month: 'T11/2025', revenue: 68000000 },
    { month: 'T12/2025', revenue: 125000000 },
    { month: 'T01/2026', revenue: 98000000 },
    { month: 'T02/2026', revenue: 156000000 },
    { month: 'T03/2026', revenue: 89000000 },
  ],
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(false);

  // Skip API call for now since backend has pagination bug
  // useEffect(() => {
  //   loadStats();
  // }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardApi.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: AdminOrder['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
      CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
      PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
      SHIPPED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {(stats.totalUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +12% so với tháng trước
              </p>
            </div>
            <div className="size-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">
                group
              </span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sản phẩm</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {(stats.totalProducts || 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +5 sản phẩm mới
              </p>
            </div>
            <div className="size-14 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">
                inventory_2
              </span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Đơn hàng</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {(stats.totalOrders || 0).toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                12 đơn chờ xử lý
              </p>
            </div>
            <div className="size-14 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-400">
                shopping_cart
              </span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalRevenue || 0)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +18% so với tháng trước
              </p>
            </div>
            <div className="size-14 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                payments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Doanh Thu Theo Tháng
          </h3>
          <div className="space-y-4">
            {(stats.revenueByMonth || []).map((item, index) => {
              const maxRevenue = Math.max(...(stats.revenueByMonth || []).map((r) => r.revenue), 1);
              const percentage = (item.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-20">
                    {item.month}
                  </span>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-surface-dark rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-28 text-right">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-[#3a3330]/60">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Trạng Thái Đơn Hàng
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {(stats.ordersByStatus || []).map((item, index) => {
              const statusLabels: Record<string, string> = {
                PENDING: 'Chờ xử lý',
                CONFIRMED: 'Đã xác nhận',
                PROCESSING: 'Đang xử lý',
                SHIPPED: 'Đang giao',
                DELIVERED: 'Đã giao',
                CANCELLED: 'Đã hủy',
              };
              const statusColors: Record<string, string> = {
                PENDING: 'bg-yellow-500',
                CONFIRMED: 'bg-blue-500',
                PROCESSING: 'bg-purple-500',
                SHIPPED: 'bg-indigo-500',
                DELIVERED: 'bg-green-500',
                CANCELLED: 'bg-red-500',
              };
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-surface-dark"
                >
                  <div className={`size-3 rounded-full ${statusColors[item.status]}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {statusLabels[item.status] || item.status}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đơn Hàng Gần Đây
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
            {(stats.recentOrders || []).map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.customer.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sản Phẩm Bán Chạy
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
            {(stats.topProducts || []).map((item, index) => (
              <div
                key={item.product.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-4"
              >
                <span className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">{item.soldCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">đã bán</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
