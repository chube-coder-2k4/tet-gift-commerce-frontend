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

export type Screen = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'register' | 'blog' | 'blog-detail' | 'about' | 'profile';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
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
