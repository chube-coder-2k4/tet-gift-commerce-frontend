import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { adminOrderApi, OrderResponse, adminStatisticApi, TopCustomerResponse } from '../../services/adminApi';

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



// ===== Count-up Hook =====
function useCountUp(end: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (end === prevEnd.current) return;
    prevEnd.current = end;

    const startTime = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startValue + (end - startValue) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [end, duration]);

  return value;
}

// ===== Custom Tooltip - Tet styled =====
const TetTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tet-chart-tooltip">
      <p style={{ fontSize: 11, fontWeight: 600, color: '#8B6355', marginBottom: 6 }}>{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#8B6355' }}>
            {entry.name === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}:
          </span>
          <span style={{ fontWeight: 700, color: '#2D1810' }}>
            {entry.name === 'revenue' ? formatFullVND(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ===== Custom Dot for highest point =====
const HighlightDot = ({ cx, cy, payload, dataKey, data }: any) => {
  if (!data || !payload) return null;
  const maxVal = Math.max(...data.map((d: any) => d[dataKey] || 0));
  if (payload[dataKey] === maxVal && maxVal > 0) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="#D4230A" stroke="#fff" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={3} fill="#FFD700" />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="#D4230A" stroke="#fff" strokeWidth={2} />;
};

// ===== Loading Skeleton - Tet themed =====
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="tet-skeleton h-32" />
      ))}
    </div>
    <div className="tet-skeleton h-[420px]" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="tet-skeleton h-[400px]" />
      <div className="tet-skeleton h-[400px]" />
    </div>
  </div>
);

// ===== Stat Card Component =====
interface StatCardProps {
  title: string;
  value: string;
  rawValue: number;
  icon: string;
  accent: 'red' | 'orange' | 'green' | 'purple';
  trend: { value: string; direction: 'up' | 'down' };
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, rawValue, icon, accent, trend, delay }) => {
  const animatedValue = useCountUp(rawValue);
  const displayValue = rawValue >= 1000
    ? formatFullVND(animatedValue)
    : animatedValue.toLocaleString();

  return (
    <div
      className={`admin-stat-card accent-${accent} p-5 animate-count-up`}
      style={{ animationDelay: `${delay * 0.1}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="stat-icon mb-3">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
          <p className="stat-label mb-1">{title}</p>
          <p className="stat-value">{displayValue}</p>
        </div>
        <div className={`trend-badge ${trend.direction}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
            {trend.direction === 'up' ? 'trending_up' : 'trending_down'}
          </span>
          {trend.value}
        </div>
      </div>
    </div>
  );
};

// ===== Main Component =====
const DashboardStats: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerResponse[]>([]);
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

        try {
          const topCustRes = await adminStatisticApi.getTopCustomers({ page: 0, size: 10 });
          if (topCustRes?.data?.data) {
            setTopCustomers(topCustRes.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch top customers:', err);
        }

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
  const maxProductRevenue = useMemo(() => Math.max(...topProducts.map(p => p.revenue), 1), [topProducts]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#D4230A' }}>error</span>
        <p className="mb-4" style={{ color: '#8B6355' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 text-white rounded-xl font-medium text-sm transition-colors"
          style={{ background: '#D4230A' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Fake trend data for demo (randomized but consistent)
  const trends = [
    { value: '+12.5%', direction: 'up' as const },
    { value: '+8.3%', direction: 'up' as const },
    { value: '+15.2%', direction: 'up' as const },
    { value: '-2.1%', direction: 'down' as const },
  ];

  const summaryCards: StatCardProps[] = [
    {
      title: 'Tổng doanh thu',
      value: formatFullVND(stats.totalRevenue),
      rawValue: stats.totalRevenue,
      icon: 'payments',
      accent: 'red',
      trend: trends[0],
      delay: 1,
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders.toLocaleString(),
      rawValue: stats.totalOrders,
      icon: 'receipt_long',
      accent: 'orange',
      trend: trends[1],
      delay: 2,
    },
    {
      title: 'Đơn hoàn thành',
      value: stats.completedOrders.toLocaleString(),
      rawValue: stats.completedOrders,
      icon: 'check_circle',
      accent: 'green',
      trend: trends[2],
      delay: 3,
    },
    {
      title: 'Giá trị trung bình',
      value: formatFullVND(stats.avgOrderValue),
      rawValue: stats.avgOrderValue,
      icon: 'trending_up',
      accent: 'purple',
      trend: trends[3],
      delay: 4,
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
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* ===== Revenue Chart ===== */}
      <div className="admin-chart-container p-6">
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2D1810' }}>
              <span className="material-symbols-outlined" style={{ color: '#D4230A' }}>monitoring</span>
              Biểu đồ doanh thu
            </h3>
            <p className="text-sm mt-0.5" style={{ color: '#8B6355' }}>
              Thống kê doanh thu theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : 'tháng'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Type Toggle */}
            <div className="flex p-1 rounded-lg" style={{ background: '#FDF6EC' }}>
              <button
                onClick={() => setChartMode('area')}
                className="p-1.5 rounded-md transition-all"
                style={chartMode === 'area'
                  ? { background: '#FFFFFF', color: '#D4230A', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#8B6355' }
                }
                title="Area Chart"
              >
                <span className="material-symbols-outlined text-lg">area_chart</span>
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className="p-1.5 rounded-md transition-all"
                style={chartMode === 'bar'
                  ? { background: '#FFFFFF', color: '#D4230A', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#8B6355' }
                }
                title="Bar Chart"
              >
                <span className="material-symbols-outlined text-lg">bar_chart</span>
              </button>
            </div>

            {/* Period Toggle */}
            <div className="flex p-1 rounded-lg" style={{ background: '#FDF6EC' }}>
              {periodOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`admin-period-tab ${period === opt.key ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {revenueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#8B6355' }}>
            <span className="material-symbols-outlined text-5xl mb-3">show_chart</span>
            <p className="text-sm font-medium">Chưa có dữ liệu doanh thu</p>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tetRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4230A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="tetLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#D4230A" />
                      <stop offset="100%" stopColor="#F5A623" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#8B6355' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8B6355' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatVND(v)}
                    dx={-8}
                    width={60}
                  />
                  <Tooltip content={<TetTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#tetLineGradient)"
                    strokeWidth={2.5}
                    fill="url(#tetRevenueGradient)"
                    dot={(props: any) => <HighlightDot {...props} data={revenueData} dataKey="revenue" />}
                    activeDot={{ r: 6, fill: '#D4230A', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tetBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4230A" />
                      <stop offset="100%" stopColor="#F5A623" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E6D0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#8B6355' }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8B6355' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatVND(v)}
                    dx={-8}
                    width={60}
                  />
                  <Tooltip content={<TetTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill="url(#tetBarGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4" style={{ borderTop: '1px solid #F5E6D0' }}>
          <div className="flex items-center gap-2">
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #D4230A, #F5A623)', display: 'inline-block' }} />
            <span className="text-xs font-medium" style={{ color: '#8B6355' }}>Doanh thu ({formatVND(stats.totalRevenue)})</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#8B6355' }}>
            <span className="material-symbols-outlined text-sm">info</span>
            Tính trên đơn đã thanh toán
          </div>
        </div>
      </div>

      {/* ===== Top Products + Top Customers ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="admin-chart-container overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #F5E6D0' }}>
            <span className="material-symbols-outlined" style={{ color: '#F5A623' }}>inventory_2</span>
            <h3 className="text-base font-bold" style={{ color: '#2D1810' }}>
              Top sản phẩm bán chạy
            </h3>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
            >
              {topProducts.length} sản phẩm
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: '#8B6355' }}>
              <span className="material-symbols-outlined text-4xl mb-2">inventory</span>
              <p className="text-sm">Chưa có dữ liệu sản phẩm</p>
            </div>
          ) : (
            <div>
              {topProducts.map((product) => (
                <div
                  key={`${product.name}-${product.rank}`}
                  className="admin-product-row flex items-center gap-3 px-6 py-3.5"
                  style={{ borderBottom: '1px solid rgba(245,230,208,0.5)' }}
                >
                  <div className="rank-badge">{product.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: '#2D1810' }}>
                        {product.name}
                      </p>
                      {product.type === 'BUNDLE' && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0"
                          style={{ color: '#9B59B6', background: 'rgba(155,89,182,0.1)' }}
                        >
                          Combo
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#8B6355' }}>
                      Đã bán {product.quantity} sản phẩm
                    </p>
                    {/* Progress bar */}
                    <div className="product-progress-bar">
                      <div
                        className="product-progress-bar-fill"
                        style={{ width: `${(product.revenue / maxProductRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#D4230A' }}>
                      {formatFullVND(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="admin-chart-container overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #F5E6D0' }}>
            <span className="material-symbols-outlined" style={{ color: '#D4230A' }}>group</span>
            <h3 className="text-base font-bold" style={{ color: '#2D1810' }}>
              Top khách hàng
            </h3>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(212,35,10,0.08)', color: '#D4230A' }}
            >
              {topCustomers.length} khách hàng
            </span>
          </div>

          {topCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: '#8B6355' }}>
              <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
              <p className="text-sm">Chưa có dữ liệu khách hàng</p>
              <p className="text-xs mt-1 max-w-[220px] text-center" style={{ color: '#C9A98A' }}>
                Cần có đơn hàng đã thanh toán để hiển thị
              </p>
            </div>
          ) : (
            <div>
              {topCustomers.map((customer, idx) => (
                <div
                  key={customer.id}
                  className="admin-product-row flex items-center gap-3 px-6 py-3.5"
                  style={{ borderBottom: '1px solid rgba(245,230,208,0.5)' }}
                >
                  <div className="rank-badge">{idx + 1}</div>
                  <div className="customer-avatar">
                    {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'K'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#2D1810' }}>
                      {customer.fullName || 'Khách hàng'}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#8B6355' }}>
                      {customer.email || `${customer.totalOrders} đơn hàng`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#D4230A' }}>
                      {formatFullVND(customer.totalSpent)}
                    </p>
                    <span className="customer-order-badge mt-1">
                      {customer.totalOrders} đơn
                    </span>
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
