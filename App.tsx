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
import { Screen, User } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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
      default:
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} />;
    }
  };

  return (
    <>
      {currentScreen !== 'login' && currentScreen !== 'register' && (
        <Header onNavigate={handleNavigate} currentScreen={currentScreen} user={user} onLogout={handleLogout} />
      )}
      {renderScreen()}
      {currentScreen !== 'login' && currentScreen !== 'register' && (
        <Footer />
      )}
      <ChatWidget />
    </>
  );
};

export default App;
