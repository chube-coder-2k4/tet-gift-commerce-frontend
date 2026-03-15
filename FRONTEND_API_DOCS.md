# 🎁 TetGifts Frontend API Integration Guide

> **Base URL:** `http://localhost:8080/api/v1`
> **OAuth URL:** `http://localhost:8080`
> **Tech Stack:** React 18 + TypeScript + Vite (Vanilla Fetch API)
> **Auth Strategy:** JWT Bearer Token stored in `localStorage`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [API Service Foundation](#3-api-service-foundation)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [User Management](#5-user-management)
6. [Product Catalog](#6-product-catalog)
7. [Bundle (Combo) Management](#7-bundle-combo-management)
8. [Category Management](#8-category-management)
9. [Cart Management](#9-cart-management)
10. [Order Management](#10-order-management)
11. [Payment Integration](#11-payment-integration)
12. [Discount Code System](#12-discount-code-system)
13. [Address Management](#13-address-management)
14. [Review System](#14-review-system)
15. [Blog System](#15-blog-system)
16. [AI Chatbot](#16-ai-chatbot)
17. [Admin Panel APIs](#17-admin-panel-apis)
18. [Application Flow](#18-application-flow)
19. [Error Handling Strategy](#19-error-handling-strategy)
20. [Pagination & Filtering](#20-pagination--filtering)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │  Pages   │  │Components│  │    Services (API)  │ │
│  │ ────────>│  │          │  │  ┌──────────────┐  │ │
│  │ Home     │  │ Header   │  │  │  api.ts      │  │ │
│  │ Shop     │  │ Footer   │  │  │  (base fetch │  │ │
│  │ Cart     │  │ ChatBot  │  │  │   + auth)    │  │ │
│  │ Checkout │  │ Confirm  │  │  ├──────────────┤  │ │
│  │ Profile  │  │ Dialog   │  │  │ productApi   │  │ │
│  │ Admin    │  │          │  │  │ cartApi      │  │ │
│  └──────────┘  └──────────┘  │  │ orderApi     │  │ │
│                              │  │ paymentApi   │  │ │
│                              │  │ adminApi     │  │ │
│                              │  │ chatbotApi   │  │ │
│                              │  │ ...          │  │ │
│                              │  └──────┬───────┘  │ │
│                              └─────────┼──────────┘ │
└────────────────────────────────────────┼────────────┘
                                         │ HTTP/HTTPS
                                         ▼
┌─────────────────────────────────────────────────────┐
│              Spring Boot Backend (8080)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth   │  │ REST API │  │   Spring Security │  │
│  │  (JWT)   │  │ v1       │  │   + OAuth2        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  MySQL   │  │ VNPay    │  │   Cloudinary      │  │
│  │  (Data)  │  │(Payment) │  │   (Images)        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Standard API Response Envelope

Every API endpoint returns a consistent JSON structure:

```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

**TypeScript Interface:**

```typescript
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
```

### Paginated Response

For list endpoints with pagination:

```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "pageNo": 0,
    "pageSize": 10,
    "totalPages": 5,
    "totalItems": 48,
    "data": [ ... ]
  }
}
```

```typescript
interface PageResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
}
```

---

## 2. Project Structure

```
services/
├── api.ts              # Base config, fetchWithAuth, Auth API, User API, Token storage
├── productApi.ts       # Public product endpoints
├── bundleApi.ts        # Public bundle (combo) endpoints
├── categoryApi.ts      # Public category endpoints
├── cartApi.ts          # Cart CRUD (auth required)
├── orderApi.ts         # Order CRUD (auth required)
├── paymentApi.ts       # Payment creation & VNPay callback
├── discountApi.ts      # Discount code validation
├── addressApi.ts       # Shipping address CRUD
├── reviewApi.ts        # Product reviews
├── blogApi.ts          # Blog posts & topics (public)
├── chatbotApi.ts       # AI chatbot integration
└── adminApi.ts         # All admin CRUD endpoints (ADMIN role required)
```

---

## 3. API Service Foundation

### 3.1 Environment Configuration

```env
# .env
VITE_API_URL=http://localhost:8080/api/v1
VITE_OAUTH_URL=http://localhost:8080
```

### 3.2 Token Storage Strategy

Tokens are stored in **`localStorage`** using clear key names:

| Key | Value | Purpose |
|-----|-------|---------|
| `accessToken` | JWT string | Sent in `Authorization: Bearer <token>` header |
| `refreshToken` | JWT string | Used to get new access token when expired |
| `userId` | Number string | Current logged-in user's ID |
| `user` | JSON string | Cached user profile data |

```typescript
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';

export const tokenStorage = {
  getAccessToken:  () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUserId: (): number | null => {
    const id = localStorage.getItem(USER_ID_KEY);
    return id ? parseInt(id) : null;
  },
  setTokens: (accessToken: string, refreshToken: string, userId: number) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_ID_KEY, userId.toString());
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('user');
  },
};
```

### 3.3 Base Fetch Wrapper (`fetchWithAuth`)

All API calls go through this central function which handles:
- **Auto-attaching** `Authorization: Bearer <token>` header
- **Auto-retrying** on 401 with token refresh
- **Throwing** typed `ApiError` on failure

```typescript
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<ApiResponse<T>> {
  const accessToken = tokenStorage.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Auto refresh token on 401 with X-Token-Expired header
  if (response.status === 401
    && response.headers.get('X-Token-Expired') === 'true'
    && !_isRetry) {
    try {
      await authApi.refreshToken();
      return fetchWithAuth<T>(endpoint, options, true);
    } catch {
      tokenStorage.clearTokens();
      throw new ApiError('Session expired. Please login again.', 401);
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data.message || 'An error occurred', response.status);
  }
  return data;
}
```

### Token Refresh Flow

```
Client Request → 401 + X-Token-Expired: true
       │
       ▼
POST /auth/refresh-token (Header: x-refresh-token)
       │
       ├── ✅ 200 → Store new tokens → Retry original request
       └── ❌ Failed → Clear all tokens → Redirect to login
```

---

## 4. Authentication & Authorization

### 4.1 Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | ❌ | Login with username/email + password |
| `POST` | `/auth/refresh-token` | ❌ (refresh token in header) | Get new access token |
| `POST` | `/auth/logout` | ✅ Bearer + refresh | Invalidate session |
| `POST` | `/auth/forgot-password` | ❌ | Send reset email |
| `POST` | `/auth/reset-password` | ❌ | Reset password with token |
| `POST` | `/auth/change-password` | ✅ | Change password (logged in) |
| `POST` | `/auth/verify-otp` | ❌ | Verify OTP after registration |
| `POST` | `/auth/resend-otp` | ❌ | Resend OTP email |
| `GET`  | `/oauth2/authorization/google` | ❌ | Google OAuth2 redirect |
| `GET`  | `/oauth2/authorization/github` | ❌ | GitHub OAuth2 redirect |

### 4.2 Login Flow

```typescript
// Request
interface LoginRequest {
  usernameOrEmail: string;  // Can be username OR email
  password: string;
}

// Response
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

// Usage
const res = await authApi.login({
  usernameOrEmail: 'admin123',
  password: 'admin123'
});
// Tokens are auto-stored in localStorage by the login function
```

**Complete Login Flow:**

```
User enters credentials
       │
       ▼
POST /auth/login
       │
       ├── ✅ 200 → Store tokens → Fetch user profile → Navigate to home
       ├── ❌ 401 → "Invalid credentials"
       └── ❌ 403 → Account not verified → Show OTP verification
```

### 4.3 Registration Flow

```typescript
interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}

// Step 1: Register
const res = await userApi.register(request);
// Returns user ID

// Step 2: Verify OTP (sent to email)
await authApi.verifyOtp({ email: 'user@example.com', otp: '123456' });

// Step 3: Login with credentials
await authApi.login({ usernameOrEmail: 'username', password: 'pass' });
```

### 4.4 OAuth2 Flow (Google / GitHub)

```typescript
// Step 1: Redirect user to OAuth provider
window.location.href = authApi.getGoogleLoginUrl();
// → Redirects to: http://localhost:8080/oauth2/authorization/google

// Step 2: Backend handles OAuth → redirects to /oauth2/redirect?token=...&refreshToken=...
// Frontend detects this URL and extracts tokens from query params

// Step 3: Store tokens and fetch user profile
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const refreshToken = params.get('refreshToken');
const userId = params.get('userId');
tokenStorage.setTokens(token, refreshToken, parseInt(userId));
```

### 4.5 Password Reset Flow

```typescript
// Step 1: Request reset email
await authApi.forgotPassword('user@example.com');
// Backend sends email with reset token

// Step 2: User clicks link in email, frontend extracts token
// Step 3: Submit new password
await authApi.resetPassword({
  token: 'reset-token-from-url',
  newPassword: 'newPass123',
  confirmPassword: 'newPass123'
});
```

### 4.6 Protected Routes Logic

```typescript
// Check authentication status
const isLoggedIn = authApi.isAuthenticated(); // checks localStorage for token

// In App component — redirect to login for protected screens
const protectedScreens: Screen[] = ['cart', 'checkout', 'profile', 'orders'];

if (protectedScreens.includes(targetScreen) && !authApi.isAuthenticated()) {
  handleNavigate('login');
  return;
}

// Admin route protection (role-based)
if (targetScreen === 'admin' && user?.roleName !== 'ADMIN') {
  handleNavigate('home');
  return;
}
```

---

## 5. User Management

### 5.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/user/register` | ❌ | Register new account |
| `GET`  | `/user/{id}` | ✅ | Get user profile |
| `PUT`  | `/user/{id}` | ✅ | Update user profile |

### 5.2 Types

```typescript
interface UserResponse {
  id: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  username?: string;
  roleName?: string;           // 'USER' | 'ADMIN'
  roles?: { id: number; name: string }[];
  createdBy?: string | null;   // Audit: who created
  updatedBy?: string | null;   // Audit: who last updated
  createdAt?: string;
  updatedAt?: string;
}
```

### 5.3 Usage Example

```typescript
// Fetch profile after login
const userId = tokenStorage.getUserId();
const res = await userApi.getProfile(userId!);
const user = res.data;
localStorage.setItem('user', JSON.stringify(user));

// Update profile
await userApi.updateProfile(userId!, {
  fullName: 'Nguyễn Văn A',
  phone: '0901234567'
});
```

---

## 6. Product Catalog

### 6.1 Endpoints (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/products?page=0&size=10&sortBy=createdAt&sortDir=desc` | ❌ | List products (paginated) |
| `GET`  | `/products/{id}` | ❌ | Product detail |

### 6.2 Types

```typescript
interface ProductImage {
  id: number;
  imageUrl: string;       // Cloudinary URL
  imageType: string;      // e.g. 'MAIN', 'GALLERY'
  publicId: string;       // Cloudinary public ID
  isPrimary: boolean;     // Primary display image
}

interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;          // VND (integer)
  stock: number;
  categoryName: string;
  categoryId: number;
  isActive: boolean;
  manufactureDate?: string;  // ISO date
  expDate?: string;          // ISO date
  images: ProductImage[];
}
```

### 6.3 Usage Examples

```typescript
// Fetch products with pagination + sorting
const res = await productApi.getAll({
  page: 0,
  size: 12,
  sortBy: 'price',
  sortDir: 'asc'
});

const products = res.data.data;       // ProductResponse[]
const totalPages = res.data.totalPages;
const totalItems = res.data.totalItems;

// Get primary image
const getPrimaryImage = (product: ProductResponse): string => {
  const primary = product.images.find(img => img.isPrimary);
  return primary?.imageUrl || product.images[0]?.imageUrl || '/placeholder.png';
};

// Format price (VND)
const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};
// Example: 88000 → "88,000đ"
```

---

## 7. Bundle (Combo) Management

### 7.1 Endpoints (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/bundles?page=0&size=10` | ❌ | List bundles (paginated) |
| `GET`  | `/bundles/{id}` | ❌ | Bundle detail |

### 7.2 Types

```typescript
interface BundleProduct {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
}

interface BundleResponse {
  id: number;
  name: string;
  price: number;        // Bundle price (may differ from sum of products)
  isCustom: boolean;    // User-customized bundle
  isActive: boolean;
  products: BundleProduct[];  // Products included in the bundle
}
```

### 7.3 Usage Example

```typescript
// Fetch all bundles
const res = await bundleApi.getAll({ page: 0, size: 20 });

// Calculate savings
const bundle = res.data.data[0];
const originalTotal = bundle.products.reduce(
  (sum, p) => sum + p.productPrice * p.quantity, 0
);
const savings = originalTotal - bundle.price;
```

---

## 8. Category Management

### 8.1 Endpoints (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/categories` | ❌ | List all active categories |
| `GET`  | `/categories/{id}` | ❌ | Category detail |

### 8.2 Types

```typescript
interface CategoryResponse {
  id: number;
  name: string;           // e.g. "Quà tết", "Rượu Tết", "Mứt Tết"
  description?: string;
  isActive: boolean;
}
```

### 8.3 Usage Example

```typescript
// Fetch categories for filter sidebar
const res = await categoryApi.getAll();
const categories = res.data; // CategoryResponse[] (not paginated)
```

---

## 9. Cart Management

### 9.1 Endpoints (Auth Required ✅)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/cart` | ✅ | Get current cart |
| `POST` | `/cart/items` | ✅ | Add item to cart |
| `PUT`  | `/cart/items/{itemId}?quantity=3` | ✅ | Update item quantity |
| `DELETE`| `/cart/items/{itemId}` | ✅ | Remove item from cart |
| `DELETE`| `/cart` | ✅ | Clear entire cart |

### 9.2 Types

```typescript
interface CartItem {
  id: number;              // Cart item ID (for update/delete)
  itemType: 'PRODUCT' | 'BUNDLE';
  itemId: number;          // Product or Bundle ID
  itemName: string;
  itemPrice: number;
  quantity: number;
  subtotal: number;        // itemPrice × quantity
}

interface CartResponse {
  id: number;              // Cart ID
  items: CartItem[];
  totalPrice: number;      // Sum of all subtotals
  totalItems: number;      // Total number of items
}

interface AddToCartRequest {
  itemType: 'PRODUCT' | 'BUNDLE';
  productId?: number;      // Required if itemType = 'PRODUCT'
  bundleId?: number;       // Required if itemType = 'BUNDLE'
  quantity: number;
}
```

### 9.3 Usage Examples

```typescript
// Add a product to cart
await cartApi.addItem({
  itemType: 'PRODUCT',
  productId: 5,
  quantity: 2
});

// Add a bundle/combo to cart
await cartApi.addItem({
  itemType: 'BUNDLE',
  bundleId: 3,
  quantity: 1
});

// Update quantity (use cart item ID, NOT product ID)
await cartApi.updateQuantity(cartItem.id, 5);

// Remove single item
await cartApi.removeItem(cartItem.id);

// Clear all
await cartApi.clearCart();

// Update cart badge count in header
const res = await cartApi.getCart();
setCartItemCount(res.data.totalItems);
```

---

## 10. Order Management

### 10.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | ✅ | Create order from cart |
| `GET`  | `/orders?page=0&size=10` | ✅ | My orders (paginated) |
| `GET`  | `/orders/{id}` | ✅ | Order detail |
| `PUT`  | `/orders/{id}/cancel` | ✅ | Cancel order |

### 10.2 Types

```typescript
interface CreateOrderRequest {
  addressId: number;          // Shipping address ID
  discountCode?: string;      // Optional discount code
  vatCompanyName?: string;    // VAT invoice fields
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
}

type OrderStatus =
  | 'CREATED'           // Just created
  | 'WAITING_PAYMENT'   // Awaiting payment
  | 'PAID'              // Payment confirmed
  | 'PROCESSING'        // In preparation
  | 'SHIPPED'           // Out for delivery
  | 'COMPLETED'         // Delivered
  | 'CANCELLED';        // Cancelled

interface OrderItem {
  id: number;
  itemType: 'PRODUCT' | 'BUNDLE';
  itemName: string;
  priceSnapshot: number;   // Price at time of order
  quantity: number;
  subtotal: number;
}

interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  discountCode?: string;   // Applied discount code
  discountAmount?: number; // Calculated discount amount
  vatCompanyName?: string;
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
  items: OrderItem[];
  createdAt: string;       // ISO datetime
}
```

### 10.3 Order Creation Flow

```typescript
// Step 1: Create order (converts cart → order)
const orderRes = await orderApi.create({
  addressId: selectedAddress.id,
  discountCode: appliedDiscount?.code,  // Optional
});
const order = orderRes.data;

// Step 2: Create payment
const paymentRes = await paymentApi.create({
  orderId: order.id,
  method: 'VN_PAY'  // or 'COD'
});

// Step 3: Handle payment
if (paymentRes.data.method === 'VN_PAY' && paymentRes.data.paymentUrl) {
  // Redirect to VNPay payment gateway
  window.location.href = paymentRes.data.paymentUrl;
} else {
  // COD — order confirmed immediately
  navigate('orders');
}

// Step 4: Clear discount from localStorage after successful order
localStorage.removeItem('appliedDiscount');
```

---

## 11. Payment Integration

### 11.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payments/create` | ✅ | Create payment for order |
| `GET`  | `/payments/vnpay-callback?vnp_...` | ✅ | Verify VNPay callback |
| `GET`  | `/payments/{orderId}` | ✅ | Get payment by order ID |

### 11.2 Types

```typescript
type PaymentMethod = 'COD' | 'VN_PAY';
type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

interface CreatePaymentRequest {
  orderId: number;
  method: PaymentMethod;
}

interface PaymentResponse {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;   // VNPay transaction reference
  paidAt: string | null;          // Payment timestamp
  paymentUrl: string | null;      // VNPay redirect URL (for VN_PAY only)
}
```

### 11.3 VNPay Payment Flow

```
Frontend                   Backend                  VNPay
   │                         │                        │
   │ POST /payments/create   │                        │
   │ {orderId, method:VN_PAY}│                        │
   │────────────────────────>│                        │
   │                         │  Generate payment URL  │
   │  {paymentUrl: "..."}    │                        │
   │<────────────────────────│                        │
   │                         │                        │
   │  window.location.href   │                        │
   │  = paymentUrl          │                        │
   │─────────────────────────────────────────────────>│
   │                         │                        │
   │          User pays on VNPay page                 │
   │                         │                        │
   │<─── Redirect back to frontend with vnp_* params │
   │                         │                        │
   │ GET /payments/vnpay-callback?vnp_ResponseCode=00 │
   │────────────────────────>│                        │
   │                         │  Verify & update order │
   │  {status: 'SUCCESS'}    │                        │
   │<────────────────────────│                        │
   │                         │                        │
   │  Show PaymentResult page│                        │
```

```typescript
// Frontend handles VNPay callback
// VNPay redirects to: http://localhost:3000/?vnp_ResponseCode=00&vnp_TxnRef=...

// App.tsx detects VNPay params
const urlParams = new URLSearchParams(window.location.search);
const hasVnpParams = urlParams.has('vnp_ResponseCode') || urlParams.has('vnp_TxnRef');

if (hasVnpParams) {
  setCurrentScreen('payment-result');
}

// PaymentResult page verifies with backend
const params = Object.fromEntries(urlParams.entries());
const res = await paymentApi.verifyVnpayCallback(params);

if (res.data.status === 'SUCCESS') {
  // Show success message
} else {
  // Show failure message
}
```

---

## 12. Discount Code System

### 12.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/discounts/validate?code=TETGIFT2026` | ✅ | Validate discount code |

### 12.2 Types

```typescript
interface DiscountResponse {
  id: number;
  code: string;
  discountValue: number;    // Flat amount discount (VND)
  minOrderAmount?: number;  // Minimum order value to apply discount
  usageLimit?: number;      // Maximum usage count (null = unlimited)
  usageCount?: number;      // Current number of times used
  startDate: string;        // ISO date
  endDate: string;          // ISO date
  isActive: boolean;
}
```

### 12.3 Flow: APPLY at Cart → CONFIRM at Checkout

```typescript
// === Cart Page ===
// Step 1: User enters code and clicks "Áp dụng"
const res = await discountApi.validate(discountCode);

// Step 2: Save to localStorage for checkout
localStorage.setItem('appliedDiscount', JSON.stringify(res.data));

// Step 3: Show discount in order summary
const discountAmount = res.data.discountValue;
const finalTotal = cartTotal - discountAmount;

// === Checkout Page ===
// Step 1: Read discount from localStorage (read-only display)
const saved = localStorage.getItem('appliedDiscount');
const discount = saved ? JSON.parse(saved) : null;

// Step 2: Pass discount code when creating order
await orderApi.create({
  addressId: selectedAddress.id,
  discountCode: discount?.code
});

// Step 3: Clean up after order placed
localStorage.removeItem('appliedDiscount');
```

---

## 13. Address Management

### 13.1 Endpoints (Auth Required ✅)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/addresses` | ✅ | List user's addresses |
| `GET`  | `/addresses/{id}` | ✅ | Get address detail |
| `POST` | `/addresses` | ✅ | Create new address |
| `PUT`  | `/addresses/{id}` | ✅ | Update address |
| `DELETE`| `/addresses/{id}` | ✅ | Delete address |
| `PUT`  | `/addresses/{id}/default` | ✅ | Set as default address |

### 13.2 Types

```typescript
interface AddressResponse {
  id: number;
  receiverName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

interface AddressRequest {
  receiverName: string;
  phone: string;
  addressDetail: string;
  isDefault?: boolean;
}
```

### 13.3 Usage in Checkout

```typescript
// Fetch all addresses for checkout page
const res = await addressApi.getAll();
const addresses = res.data;  // AddressResponse[] (NOT paginated)

// Pre-select default address
const defaultAddr = addresses.find(a => a.isDefault);

// Create order with selected address
await orderApi.create({ addressId: selectedAddr.id });
```

---

## 14. Review System

### 14.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/products/{productId}/reviews?page=0&size=10` | ❌ | Get reviews for product |
| `POST` | `/products/{productId}/reviews` | ✅ | Create review |
| `PUT`  | `/reviews/{reviewId}` | ✅ (owner only) | Update own review |
| `DELETE`| `/reviews/{reviewId}` | ✅ (owner only) | Delete own review |

### 14.2 Types

```typescript
interface ReviewResponse {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;      // 1-5
  comment: string;
  createdAt: string;
}

interface CreateReviewRequest {
  rating: number;      // 1-5
  comment: string;
}
```

### 14.3 Usage Example

```typescript
// Fetch reviews for product detail page
const res = await reviewApi.getByProduct(productId, 0, 10);
const reviews = res.data.data;
const totalReviews = res.data.totalItems;

// Calculate average rating
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

// Submit a review
await reviewApi.create(productId, {
  rating: 5,
  comment: 'Sản phẩm tuyệt vời, đóng gói đẹp!'
});
```

---

## 15. Blog System

### 15.1 Endpoints (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/blog-topics` | ❌ | List all blog topics |
| `GET`  | `/blogs?page=0&size=10` | ❌ | List blog posts (paginated) |
| `GET`  | `/blogs/{id}` | ❌ | Blog post detail |

### 15.2 Types

```typescript
interface BlogTopic {
  id: number;
  name: string;
}

interface BlogPostResponse {
  id: number;
  title: string;
  content: string;      // May contain HTML/markdown
  topicName: string;
  topicId: number;
  createdAt: string;
}
```

---

## 16. AI Chatbot

### 16.1 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chatbot/chat` | ❌ | Send message to AI chatbot |
| `GET`  | `/chatbot/history/{sessionId}` | ❌ | Get chat history |
| `POST` | `/chatbot/embeddings/sync` | ✅ (Admin) | Sync product embeddings |

### 16.2 Types

```typescript
interface ChatRequest {
  message: string;
  sessionId?: string;    // Include to maintain conversation
}

interface ChatSuggestion {
  id: number;
  type: 'PRODUCT' | 'BUNDLE';
  name: string;
  price: string;
  stock: number;
  imageUrl: string | null;
}

interface ChatResponse {
  sessionId: string;            // Store this for follow-up messages
  message: string;              // AI response text (with **bold** markdown)
  timestamp: string;
  detectedIntent: string;       // e.g. 'PRODUCT_QUERY', 'PRICE_CHECK'
  success: boolean;
  suggestions: ChatSuggestion[];  // Product cards to display
}

interface ChatHistoryItem {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  intent: string | null;
  createdAt: string;
}
```

### 16.3 Chat Session Flow

```typescript
// Session is stored in localStorage
const SESSION_KEY = 'chatbot_session_id';

// First message — no sessionId
const res = await chatbotApi.chat({ message: 'Tư vấn quà tết tặng sếp' });
const sessionId = res.data.sessionId;
localStorage.setItem(SESSION_KEY, sessionId);

// Follow-up messages — include sessionId
const res2 = await chatbotApi.chat({
  message: 'Giá bao nhiêu?',
  sessionId: sessionId
});

// Resume previous session on page reload
const savedSession = localStorage.getItem(SESSION_KEY);
if (savedSession) {
  const history = await chatbotApi.getHistory(savedSession);
  // Render previous messages
}
```

### 16.4 Auto Product Suggestion (Frontend Enhancement)

When the backend doesn't return `suggestions`, the frontend auto-extracts product names from the AI text and matches against a preloaded product catalog:

```typescript
// Preload catalog when chat opens
const [products] = await Promise.all([
  productApi.getAll({ size: 100 }),
  bundleApi.getAll({ size: 100 })
]);

// After receiving AI response, if no suggestions provided:
function extractSuggestionsFromText(text: string, catalog: CatalogItem[]): ChatSuggestion[] {
  const found: ChatSuggestion[] = [];
  const lowerText = text.toLowerCase();

  for (const item of catalog) {
    if (lowerText.includes(item.name.toLowerCase())) {
      found.push({
        id: item.id,
        type: item.type,
        name: item.name,
        price: item.price.toString(),
        stock: item.stock,
        imageUrl: item.imageUrl,
      });
    }
  }
  return found;
}
```

---

## 17. Admin Panel APIs

All admin endpoints require **ADMIN role** (`roleName: 'ADMIN'`).

### 17.1 Complete Admin Endpoints

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/user?page=0&size=10` | List all users (paginated) |
| `GET`  | `/user/{id}` | Get user details |
| `PUT`  | `/user/{id}` | Update user |
| `DELETE`| `/user/{id}` | Delete user |

#### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/role` | List all roles |
| `GET`  | `/role/{id}` | Get role details |
| `POST` | `/role` | Create role |
| `PUT`  | `/role?id={id}` | Update role |
| `DELETE`| `/role?id={id}` | Delete role |

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/categories` | List all categories |
| `POST` | `/categories` | Create category |
| `PUT`  | `/categories/{id}` | Update category |
| `DELETE`| `/categories/{id}` | Delete category |

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/products?page=0&size=10` | List all products (paginated) |
| `GET`  | `/products/{id}` | Get product details |
| `POST` | `/products/register` | Create product |
| `PUT`  | `/products/{id}` | Update product |
| `DELETE`| `/products/{id}` | Delete product |

#### Bundles (Combos)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/bundles?page=0&size=10` | List all bundles (paginated) |
| `POST` | `/bundles` | Create bundle |
| `PUT`  | `/bundles/{id}` | Update bundle |
| `DELETE`| `/bundles/{id}` | Delete bundle |

#### Orders (Admin view)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/orders/all?page=0&size=10` | List ALL orders (paginated) |
| `GET`  | `/orders/{id}` | Get order details |
| `PUT`  | `/orders/{id}/status?status=SHIPPED` | Update order status |
| `PUT`  | `/orders/{id}/cancel` | Cancel order |

#### Discounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/discounts` | List all discount codes |
| `GET`  | `/discounts/{id}` | Get discount details |
| `POST` | `/discounts` | Create discount |
| `PUT`  | `/discounts/{id}` | Update discount |
| `DELETE`| `/discounts/{id}` | Delete discount |

#### Blogs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/blogs?page=0&size=10` | List all blog posts |
| `POST` | `/blogs` | Create blog post |
| `PUT`  | `/blogs/{id}` | Update blog post |
| `DELETE`| `/blogs/{id}` | Delete blog post |

#### Blog Topics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/blog-topics` | List all topics |
| `POST` | `/blog-topics` | Create topic |
| `PUT`  | `/blog-topics/{id}` | Update topic |
| `DELETE`| `/blog-topics/{id}` | Delete topic |

#### Payment (Read-only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/payments/{orderId}` | Get payment info by order |

### 17.2 Admin Request Types

```typescript
// Product creation (with images)
interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  manufactureDate?: string;
  expDate?: string;
  images?: Array<{
    imageUrl: string;     // Cloudinary URL
    imageType: string;
    publicId: string;     // Cloudinary public ID
    isPrimary: boolean;
  }>;
}

// Bundle creation
interface BundleRequest {
  name: string;
  price: number;
  isCustom: boolean;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

// Discount creation
interface DiscountRequest {
  code: string;
  discountValue: number;   // Flat VND amount
  startDate: string;       // ISO date
  endDate: string;         // ISO date
}

// Blog post creation
interface BlogPostRequest {
  title: string;
  content: string;
  topicId: number;
}

// Order status update (Admin)
// PUT /orders/{id}/status?status=SHIPPED
type OrderStatus = 'CREATED' | 'WAITING_PAYMENT' | 'PAID'
                 | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
```

---

## 18. Application Flow

### 18.1 Route Mapping

| URL Path | Screen | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/` | `home` | ❌ | Landing page with hero + featured products |
| `/shop` | `shop` | ❌ | Product catalog with filters |
| `/product` | `product-detail` | ❌ | Single product detail + reviews |
| `/cart` | `cart` | ✅ | Shopping cart + discount code input |
| `/checkout` | `checkout` | ✅ | Address + payment selection |
| `/login` | `login` | ❌ | Login form + OAuth buttons |
| `/register` | `register` | ❌ | Registration form |
| `/profile` | `profile` | ✅ | User profile + address management |
| `/orders` | `orders` | ✅ | Order history |
| `/blog` | `blog` | ❌ | Blog listing |
| `/blog-detail` | `blog-detail` | ❌ | Single blog post |
| `/about` | `about` | ❌ | About page |
| `/admin` | `admin` | ✅ (ADMIN) | Admin dashboard |
| `/payment-result` | `payment-result` | ✅ | VNPay callback result |

### 18.2 Complete Shopping Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Home   │───→│   Shop   │───→│ Product  │───→│   Cart   │───→│ Checkout │
│          │    │          │    │  Detail  │    │          │    │          │
│ Featured │    │ Filters  │    │ Images   │    │ Discount │    │ Address  │
│ Products │    │ Sort     │    │ Reviews  │    │ Quantity │    │ Payment  │
│ Hero     │    │ Search   │    │ Add Cart │    │ Summary  │    │ Method   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                      │
                                                    ┌─────────────────┤
                                                    │                 │
                                              ┌─────▼─────┐   ┌──────▼─────┐
                                              │    COD     │   │   VNPay    │
                                              │           │   │  Redirect  │
                                              │ → Orders  │   │ → Callback │
                                              └───────────┘   │ → Payment  │
                                                              │   Result   │
                                                              └────────────┘
```

### 18.3 Login → Dashboard (Admin)

```
Login (/login)
  │
  ├── POST /auth/login
  │    │
  │    ├── ✅ Store tokens
  │    ├── GET /user/{userId}
  │    ├── Check roleName === 'ADMIN'?
  │    │    ├── Yes → Navigate to /admin
  │    │    └── No  → Navigate to /home
  │    └── Store user in localStorage
  │
  └── OAuth2 (Google / GitHub)
       ├── Redirect to backend OAuth URL
       ├── Backend handles auth
       ├── Redirect back with tokens in URL
       └── Same flow as above
```

### 18.4 Cart ↔ Checkout Discount Flow

```
Cart Page (/cart)                    Checkout Page (/checkout)
┌────────────────────────┐          ┌────────────────────────┐
│ ✔ Input discount code  │          │ ✔ Display applied code │
│ ✔ Click "Áp dụng"      │   ────>  │ ✔ Show discount amount │
│ ✔ See discounted total │localStorage│ ✔ Remove option       │
│ ✔ Change / remove      │          │ ✘ No new input         │
│                        │          │ ✔ Link back to cart    │
│ Save to localStorage   │          │                        │
└────────────────────────┘          └────────────────────────┘
                                           │
                                           ▼
                                    After order placed:
                                    localStorage.removeItem('appliedDiscount')
```

---

## 19. Error Handling Strategy

### 19.1 Global Error Handling

```typescript
// All API errors are thrown as ApiError
try {
  const res = await productApi.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        // Bad request — show validation errors
        showToast(error.message, 'error');
        break;
      case 401:
        // Unauthorized — redirect to login
        tokenStorage.clearTokens();
        navigate('login');
        break;
      case 403:
        // Forbidden — insufficient permissions
        showToast('Bạn không có quyền thực hiện hành động này', 'error');
        break;
      case 404:
        // Not found
        showToast('Không tìm thấy dữ liệu', 'error');
        break;
      case 409:
        // Conflict (e.g., duplicate)
        showToast(error.message, 'warning');
        break;
      case 500:
        // Server error
        showToast('Lỗi hệ thống. Vui lòng thử lại sau.', 'error');
        break;
      default:
        showToast(error.message || 'Đã có lỗi xảy ra', 'error');
    }
  }
}
```

### 19.2 Custom Confirm Dialog

Instead of using browser's native `window.confirm()`, the project uses a custom `ConfirmDialog` component:

```typescript
// Usage in any component
import { useConfirmDialog } from './components/ConfirmDialog';

const { confirm } = useConfirmDialog();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Xác nhận xoá',
    message: 'Bạn có chắc chắn muốn xoá sản phẩm này?',
    confirmText: 'Xoá',
    cancelText: 'Huỷ',
    variant: 'danger'   // 'danger' | 'warning' | 'info'
  });

  if (confirmed) {
    await adminProductApi.delete(productId);
    showToast('Đã xoá thành công!');
  }
};
```

---

## 20. Pagination & Filtering

### 20.1 Standard Pagination Parameters

```typescript
interface PaginationParams {
  page?: number;      // 0-indexed page number (default: 0)
  size?: number;      // Items per page (default: 10)
  sortBy?: string;    // Sort field (e.g., 'createdAt', 'price', 'name')
  sortDir?: 'asc' | 'desc';  // Sort direction
}
```

### 20.2 Implementation Pattern

```typescript
const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [products, setProducts] = useState<ProductResponse[]>([]);

const fetchProducts = async (page: number) => {
  const res = await productApi.getAll({
    page,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  setProducts(res.data.data);
  setTotalPages(res.data.totalPages);
  setCurrentPage(res.data.pageNo);
};

// Pagination UI
const renderPagination = () => (
  <div className="flex gap-2">
    <button
      disabled={currentPage === 0}
      onClick={() => fetchProducts(currentPage - 1)}
    >
      Previous
    </button>

    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => fetchProducts(i)}
        className={i === currentPage ? 'active' : ''}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage >= totalPages - 1}
      onClick={() => fetchProducts(currentPage + 1)}
    >
      Next
    </button>
  </div>
);
```

### 20.3 Form Submission Pattern

```typescript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: 0,
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsSubmitting(true);

  try {
    // Validate
    if (!formData.name.trim()) {
      setError('Tên sản phẩm không được để trống');
      return;
    }

    // Submit
    await adminProductApi.create(formData);
    showToast('Tạo sản phẩm thành công!');
    navigate('admin');
  } catch (err) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError('Đã có lỗi xảy ra');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Quick Reference: Required Headers

| Scenario | Headers |
|----------|---------|
| **Public endpoint** | `Content-Type: application/json` |
| **Authenticated endpoint** | `Content-Type: application/json` + `Authorization: Bearer {accessToken}` |
| **Token refresh** | `Content-Type: application/json` + `x-refresh-token: {refreshToken}` |
| **Logout** | `Authorization: Bearer {accessToken}` + `x-refresh-token: {refreshToken}` |

---

## Quick Reference: localStorage Keys

| Key | Type | Used By |
|-----|------|---------|
| `accessToken` | string | All authenticated API calls |
| `refreshToken` | string | Token refresh & logout |
| `userId` | string (number) | Fetch user profile |
| `user` | JSON string | Cache user data for UI |
| `appliedDiscount` | JSON string | Pass discount from Cart → Checkout |
| `chatbot_session_id` | string | Maintain chatbot conversation |

---

> **Last Updated:** March 15, 2026
> **Project:** TetGifts — Luxury Lunar New Year Gifting E-Commerce
> **Backend:** Spring Boot 3 + MySQL + JWT + VNPay + Cloudinary + Google Gemini AI
