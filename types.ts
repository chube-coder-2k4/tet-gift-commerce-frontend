// ===== Product & Image =====
export interface ProductImage {
  id: number;
  imageUrl: string;
  imageType: string;
  publicId: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  primaryImage?: string;
  categoryName: string;
  categoryId: number;
  isActive: boolean;
  manufactureDate?: string;
  expDate?: string;
  images: ProductImage[];
}

// ===== Category =====
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

// ===== Cart =====
export interface CartItem {
  id: number;
  itemType: 'PRODUCT' | 'BUNDLE';
  itemId: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;
  isCustomCombo?: boolean;
  customComboData?: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

// ===== Blog =====
export interface BlogPost {
  id: number;
  title: string;
  content?: string;
  topicName?: string;
  topicId?: number;
  createdAt?: string;
  // Legacy fields for static data compatibility
  excerpt?: string;
  date?: string;
  readTime?: string;
  image?: string;
  tag?: string;
}

// ===== Pagination =====
export interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}

// ===== Navigation =====
export type Screen = 'home' | 'shop' | 'product-detail' | 'bundles' | 'bundle-detail' | 'cart' | 'checkout' | 'login' | 'register' | 'blog' | 'blog-detail' | 'about' | 'profile' | 'payment-result' | 'orders' | 'track-order' | 'admin';

// ===== User & Address =====
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleName?: string;
  addresses: Address[];
  roles?: { id: number, name: string }[];
}

export interface Address {
  id: number;
  receiverName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}
