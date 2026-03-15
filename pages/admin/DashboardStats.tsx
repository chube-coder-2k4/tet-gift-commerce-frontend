import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { adminOrderApi, OrderResponse } from '../../services/adminApi';

// ===== Types =====
type Period = 'day' | 'week' | 'month';
type ChartMode = 'area' | 'bar';

interface RevenueDataPoint {
  label: string;
  revenue: number;
  orders: number;
  sortKey: number;
}

interface TopProduct {
  rank: number;
  name: string;
  type: 'PRODUCT' | 'BUNDLE';
  quantity: number;
  revenue: number;
}

interface TopCustomer {
  rank: number;
  userId: number;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
}

// ===== Helpers =====
const formatVND = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return value.toString();
};

const formatFullVND = (value: number): string =>
  value.toLocaleString('vi-VN') + '₫';

const REVENUE_STATUSES: string[] = ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];

function computeStats(orders: OrderResponse[]): Stats {
  const revenueOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status));
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter(o =>
    ['CREATED', 'WAITING_PAYMENT', 'PROCESSING', 'SHIPPED'].includes(o.status)
  ).length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    avgOrderValue: revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0,
  };
}

function getISOWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupByPeriod(orders: OrderResponse[], period: Period): RevenueDataPoint[] {
  const revenueOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status));

  const map = new Map<string, { revenue: number; orders: number; sortKey: number }>();

  for (const order of revenueOrders) {
    const date = new Date(order.createdAt);
    let key: string;
    let sortKey: number;

    switch (period) {
      case 'day': {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        sortKey = date.getTime();
        break;
      }
      case 'week': {
        const weekStart = getISOWeekStart(date);
        key = weekStart.toISOString().split('T')[0];
        sortKey = weekStart.getTime();
        break;
      }
      case 'month': {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        sortKey = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        break;
      }
    }

    const existing = map.get(key) || { revenue: 0, orders: 0, sortKey };
    map.set(key, {
      revenue: existing.revenue + order.totalAmount,
      orders: existing.orders + 1,
      sortKey,
    });
  }

  return Array.from(map.entries())
    .sort(([, a], [, b]) => a.sortKey - b.sortKey)
    .map(([key, data]) => {
      let label: string;
      switch (period) {
        case 'day': {
          const [, m, d] = key.split('-');
          label = `${d}/${m}`;
          break;
        }
        case 'week': {
          const d = new Date(key);
          const end = new Date(d);
          end.setDate(end.getDate() + 6);
          label = `${d.getDate()}/${d.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
          break;
        }
        case 'month': {
          const [y, m] = key.split('-');
          label = `Th.${parseInt(m)}/${y}`;
          break;
        }
      }
      return { label, revenue: data.revenue, orders: data.orders, sortKey: data.sortKey };
    });
}

function getTopProducts(orders: OrderResponse[], limit = 10): TopProduct[] {
  const revenueOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status));
  const map = new Map<string, { type: 'PRODUCT' | 'BUNDLE'; quantity: number; revenue: number }>();

  for (const order of revenueOrders) {
    for (const item of order.items) {
      const key = `${item.itemType}:${item.itemName}`;
      const existing = map.get(key) || { type: item.itemType, quantity: 0, revenue: 0 };
      map.set(key, {
        type: item.itemType,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotal,
      });
    }
  }

  return Array.from(map.entries())
    .map(([key, data]) => ({
      rank: 0,
      name: key.split(':').slice(1).join(':'),
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

function getTopCustomers(orders: OrderResponse[], limit = 10): TopCustomer[] {
  const revenueOrders = orders.filter(o =>
    REVENUE_STATUSES.includes(o.status) && o.userId
  );

  if (revenueOrders.length === 0) return [];

  const map = new Map<number, { name: string; email: string; orderCount: number; totalSpent: number }>();

  for (const order of revenueOrders) {
    if (!order.userId) continue;
    const existing = map.get(order.userId) || {
      name: order.customerName || 'Khách hàng',
      email: order.customerEmail || '',
      orderCount: 0,
      totalSpent: 0,
    };
    map.set(order.userId, {
      ...existing,
      orderCount: existing.orderCount + 1,
      totalSpent: existing.totalSpent + order.totalAmount,
    });
  }

  return Array.from(map.entries())
    .map(([userId, data]) => ({ rank: 0, userId, ...data }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

// ===== Custom Tooltip =====
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 dark:text-gray-300">
            {entry.name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}:
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {entry.name === 'revenue' ? formatFullVND(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ===== Loading Skeleton =====
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-white/5 rounded-2xl" />
      ))}
    </div>
    <div className="h-[400px] bg-gray-200 dark:bg-white/5 rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-[380px] bg-gray-200 dark:bg-white/5 rounded-2xl" />
      <div className="h-[380px] bg-gray-200 dark:bg-white/5 rounded-2xl" />
    </div>
  </div>
);

// ===== Medal Component =====
const Medal: React.FC<{ rank: number }> = ({ rank }) => {
  const medals = ['🥇', '🥈', '🥉'];
  if (rank <= 3) {
    return <span className="text-lg">{medals[rank - 1]}</span>;
  }
  return (
    <span className="size-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
      {rank}
    </span>
  );
};

// ===== Main Component =====
const DashboardStats: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('day');
  const [chartMode, setChartMode] = useState<ChartMode>('area');

  // Fetch all orders (handle pagination)
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const allOrders: OrderResponse[] = [];
        let page = 0;
        let totalPages = 1;
        const MAX_PAGES = 10;

        while (page < totalPages && page < MAX_PAGES) {
          const res = await adminOrderApi.getAll({ page, size: 100, sortBy: 'createdAt', sortDir: 'desc' });
          if (res.data) {
            allOrders.push(...res.data.data);
            totalPages = res.data.totalPages;
          }
          page++;
        }
        setOrders(allOrders);
      } catch (err: any) {
        console.error('Failed to fetch orders for stats:', err);
        setError(err?.message || 'Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Computed data
  const stats = useMemo(() => computeStats(orders), [orders]);
  const revenueData = useMemo(() => groupByPeriod(orders, period), [orders, period]);
  const topProducts = useMemo(() => getTopProducts(orders), [orders]);
  const topCustomers = useMemo(() => getTopCustomers(orders), [orders]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">error</span>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Tổng doanh thu',
      value: formatFullVND(stats.totalRevenue),
      icon: 'payments',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders.toLocaleString(),
      icon: 'receipt_long',
      gradient: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
    },
    {
      title: 'Đơn hoàn thành',
      value: stats.completedOrders.toLocaleString(),
      icon: 'check_circle',
      gradient: 'from-violet-500 to-violet-600',
      bgGlow: 'bg-violet-500/10',
    },
    {
      title: 'Giá trị trung bình',
      value: formatFullVND(stats.avgOrderValue),
      icon: 'trending_up',
      gradient: 'from-amber-500 to-amber-600',
      bgGlow: 'bg-amber-500/10',
    },
  ];

  const periodOptions: { key: Period; label: string }[] = [
    { key: 'day', label: 'Ngày' },
    { key: 'week', label: 'Tuần' },
    { key: 'month', label: 'Tháng' },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`relative overflow-hidden p-5 bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 group hover:shadow-lg transition-all`}
          >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${card.bgGlow} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{card.title}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Revenue Chart ===== */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 p-6">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              Biểu đồ doanh thu
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Thống kê doanh thu theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : 'tháng'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Type Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-surface-dark rounded-lg">
              <button
                onClick={() => setChartMode('area')}
                className={`p-1.5 rounded-md transition-all ${
                  chartMode === 'area'
                    ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Area Chart"
              >
                <span className="material-symbols-outlined text-lg">area_chart</span>
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={`p-1.5 rounded-md transition-all ${
                  chartMode === 'bar'
                    ? 'bg-white dark:bg-card-dark text-primary shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Bar Chart"
              >
                <span className="material-symbols-outlined text-lg">bar_chart</span>
              </button>
            </div>

            {/* Period Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-surface-dark rounded-lg">
              {periodOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    period === opt.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <span className="material-symbols-outlined text-5xl mb-3">show_chart</span>
            <p className="text-sm font-medium">Chưa có dữ liệu doanh thu</p>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d90429" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d90429" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffb703" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffb703" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatVND(v)}
                    dx={-8}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d90429"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 3, fill: '#d90429', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#d90429', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d90429" />
                      <stop offset="100%" stopColor="#8b1a2b" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatVND(v)}
                    dx={-8}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Doanh thu ({formatVND(stats.totalRevenue)})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-sm">info</span>
            Tính trên đơn đã thanh toán
          </div>
        </div>
      </div>

      {/* ===== Top Products + Top Customers ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">inventory_2</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Top sản phẩm bán chạy
            </h3>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-medium">
              {topProducts.length} sản phẩm
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">inventory</span>
              <p className="text-sm">Chưa có dữ liệu sản phẩm</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {topProducts.map((product) => (
                <div
                  key={`${product.name}-${product.rank}`}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <Medal rank={product.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      {product.type === 'BUNDLE' && (
                        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                          Combo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Đã bán {product.quantity} sản phẩm
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary dark:text-[#daa520]">
                      {formatFullVND(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">group</span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Top khách hàng
            </h3>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-medium">
              {topCustomers.length} khách hàng
            </span>
          </div>

          {topCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
              <p className="text-sm">Chưa có dữ liệu khách hàng</p>
              <p className="text-xs mt-1 text-gray-300 dark:text-gray-600 max-w-[220px] text-center">
                Cần có đơn hàng đã thanh toán để hiển thị
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {topCustomers.map((customer) => (
                <div
                  key={customer.userId}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <Medal rank={customer.rank} />
                  <div className="size-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {customer.email || `${customer.orderCount} đơn hàng`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary dark:text-[#daa520]">
                      {formatFullVND(customer.totalSpent)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {customer.orderCount} đơn
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
