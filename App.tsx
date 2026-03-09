import React, { useState, useEffect } from 'react';
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
import AdminPage from './pages/AdminPage';
import { Screen, User } from './types';
import MusicPlayer from './components/MusicPlayer';

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
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount + Handle OAuth redirect
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Check if this is an OAuth callback (Backend redirects to /oauth2/redirect)
    const path = window.location.pathname;
    const hasOAuthParams = window.location.search.includes('token=');
    
    if (path === '/oauth2/redirect' || hasOAuthParams) {
      // Redirect to login page to handle OAuth callback
      setCurrentScreen('login');
    }
  }, []);

  // Sync URL with screen changes
  useEffect(() => {
    const newPath = screenToPath[currentScreen];
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
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
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} />;
      case 'shop':
        return <Shop onNavigate={handleNavigate} onProductClick={handleProductClick} />;
      case 'product-detail':
        return <ProductDetail onNavigate={handleNavigate} productId={selectedProductId} />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigate} />;
      case 'login':
        return <Auth onNavigate={handleNavigate} type="login" onLogin={handleLogin} />;
      case 'register':
        return <Auth onNavigate={handleNavigate} type="register" onLogin={handleLogin} />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} />;
      case 'blog-detail':
        return <BlogDetail onNavigate={handleNavigate} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} user={user} onUpdateUser={handleUpdateUser} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} />;
    }
  };

  return (
    <>
      <MusicPlayer />
      {currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'admin' && (
        <Header onNavigate={handleNavigate} currentScreen={currentScreen} user={user} onLogout={handleLogout} />
      )}
      {renderScreen()}
      {currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'admin' && (
        <Footer />
      )}
      <ChatWidget />
    </>
  );
};

export default App;
