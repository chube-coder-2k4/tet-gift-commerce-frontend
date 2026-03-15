import React, { useState, useEffect, useCallback } from 'react';
import { Header, Footer } from './components/Layout';
import { ChatWidget } from './components/ChatWidget';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import PaymentResult from './pages/PaymentResult';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Screen, User } from './types';
import { authApi } from './services/api';
import { cartApi } from './services/cartApi';
import MusicPlayer from './components/MusicPlayer';
import { ConfirmDialogProvider } from './components/ConfirmDialog';

// Map URL paths to Screen types
const pathToScreen: Record<string, Screen> = {
  '/': 'home',
  '/home': 'home',
  '/shop': 'shop',
  '/product': 'product-detail',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/login': 'login',
  '/register': 'register',
  '/blog': 'blog',
  '/blog-detail': 'blog-detail',
  '/about': 'about',
  '/profile': 'profile',
  '/admin': 'admin',
  '/dashboard': 'admin', // Admin dashboard
  '/payment-result': 'payment-result',
  '/orders': 'orders',
};

const screenToPath: Record<Screen, string> = {
  'home': '/',
  'shop': '/shop',
  'product-detail': '/product',
  'cart': '/cart',
  'checkout': '/checkout',
  'login': '/login',
  'register': '/register',
  'blog': '/blog',
  'blog-detail': '/blog-detail',
  'about': '/about',
  'profile': '/profile',
  'admin': '/admin',
  'payment-result': '/payment-result',
  'orders': '/orders',
};

const getScreenFromPath = (path: string): Screen => {
  // Handle /admin/* paths
  if (path.startsWith('/admin') || path === '/dashboard') {
    return 'admin';
  }
  return pathToScreen[path] || 'home';
};

const App: React.FC = () => {
  // Initialize from URL path
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const path = window.location.pathname;
    return getScreenFromPath(path);
  });
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // Fetch cart item count
  const handleCartUpdate = useCallback(async () => {
    if (!authApi.isAuthenticated()) {
      setCartItemCount(0);
      return;
    }
    try {
      const res = await cartApi.getCart();
      setCartItemCount(res.data?.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  }, []);

  // Load user from localStorage on mount + Handle OAuth redirect + VNPay return
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load cart count if authenticated
    handleCartUpdate();

    // Check if this is a VNPay payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const hasVnpParams = urlParams.has('vnp_ResponseCode') || urlParams.has('vnp_TxnRef');

    if (hasVnpParams) {
      setCurrentScreen('payment-result');
      return;
    }

    // Check if this is an OAuth callback (Backend redirects to /oauth2/redirect)
    const path = window.location.pathname;
    const hasOAuthParams = window.location.search.includes('token=');

    if (path === '/oauth2/redirect' || hasOAuthParams) {
      // Setup current screen but keep the URL search intact
      setCurrentScreen('login');
      if (path === '/oauth2/redirect') {
        window.history.replaceState({}, '', '/login' + window.location.search);
      }
    }
  }, [handleCartUpdate]);

  // Sync URL with screen changes
  useEffect(() => {
    // Keep OAuth callback query intact while Auth page processes token
    const isOAuthCallbackUrl = window.location.pathname === '/oauth2/redirect' || window.location.search.includes('token=');
    if (isOAuthCallbackUrl && currentScreen !== 'login') {
      return;
    }

    const newPath = screenToPath[currentScreen];
    if (window.location.pathname !== newPath) {
      const search = window.location.search;
      if (search && (currentScreen === 'login' || currentScreen === 'payment-result')) {
        // Prevent pushState infinite loops if already correct
        if (window.location.pathname + search !== newPath + search) {
          window.history.pushState({}, '', newPath + search);
        }
      } else {
        window.history.pushState({}, '', newPath);
      }
    }
  }, [currentScreen]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const screen = getScreenFromPath(path);
      setCurrentScreen(screen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    handleCartUpdate();
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setCartItemCount(0);
    handleNavigate('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleProductClick = (id: number) => {
    setSelectedProductId(id);
    handleNavigate('product-detail');
  };

  const handleBlogPostClick = (id: number) => {
    setSelectedBlogPostId(id);
    handleNavigate('blog-detail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} onCartUpdate={handleCartUpdate} />;
      case 'shop':
        return <Shop onNavigate={handleNavigate} onProductClick={handleProductClick} onCartUpdate={handleCartUpdate} />;
      case 'product-detail':
        return <ProductDetail onNavigate={handleNavigate} productId={selectedProductId} onCartUpdate={handleCartUpdate} />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} onCartUpdate={handleCartUpdate} />;
      case 'login':
        return <Auth onNavigate={handleNavigate} type="login" onLogin={handleLogin} />;
      case 'register':
        return <Auth onNavigate={handleNavigate} type="register" onLogin={handleLogin} />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} onBlogPostClick={handleBlogPostClick} />;
      case 'blog-detail':
        return <BlogDetail onNavigate={handleNavigate} blogPostId={selectedBlogPostId} onBlogPostClick={handleBlogPostClick} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} user={user} onUpdateUser={handleUpdateUser} />;
      case 'orders':
        return <Orders onNavigate={handleNavigate} />;
      case 'payment-result':
        return <PaymentResult onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} onCartUpdate={handleCartUpdate} />;
    }
  };

  return (
    <ConfirmDialogProvider>
      <MusicPlayer />
      {currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'admin' && (
        <Header onNavigate={handleNavigate} currentScreen={currentScreen} user={user} onLogout={handleLogout} cartItemCount={cartItemCount} />
      )}
      {renderScreen()}
      {currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'admin' && (
        <Footer />
      )}
      <ChatWidget onProductClick={handleProductClick} />
    </ConfirmDialogProvider>
  );
};

export default App;
