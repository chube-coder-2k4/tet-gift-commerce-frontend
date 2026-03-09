export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  isHot?: boolean;
  discount?: number;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  tag: string;
}

export type Screen = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'register' | 'blog' | 'blog-detail' | 'about' | 'profile' | 'admin';

// Admin Types
export type AdminScreen = 'dashboard' | 'users' | 'products' | 'orders' | 'payments' | 'categories';

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  username: string;
  roles: AdminRole[];
  // Note: These fields exist in backend model but are NOT returned by UserResponse DTO
  isVerify?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  images: AdminProductImage[];
  badges: AdminProductBadge[];
  categories: AdminCategory[];
  inventory?: AdminProductInventory;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProductImage {
  id?: number;
  imageUrl: string;
  isThumbnail: boolean;
  sortOrder: number;
}

export interface AdminProductBadge {
  id: number;
  code: string;
  label: string;
}

export interface AdminProductInventory {
  stockQuantity: number;
  isInStock: boolean;
}

export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  items: AdminOrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'COD' | 'VNPAY' | 'BANK_TRANSFER';
  shippingAddress: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AdminPayment {
  id: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  method: 'COD' | 'VNPAY' | 'BANK_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: AdminOrder[];
  topProducts: { product: AdminProduct; soldCount: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  roles?: AdminRole[];
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}
