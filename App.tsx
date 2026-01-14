import React, { useState } from 'react';
import { Header, Footer } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import { Screen } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);

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
        return <Auth onNavigate={handleNavigate} type="login" />;
      case 'register':
        return <Auth onNavigate={handleNavigate} type="register" />;
      case 'blog':
        return <Blog onNavigate={handleNavigate} />;
      case 'blog-detail':
        return <BlogDetail onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} onProductClick={handleProductClick} />;
    }
  };

  return (
    <>
      {currentScreen !== 'login' && currentScreen !== 'register' && (
        <Header onNavigate={handleNavigate} currentScreen={currentScreen} />
      )}
      {renderScreen()}
      {currentScreen !== 'login' && currentScreen !== 'register' && (
        <Footer />
      )}
    </>
  );
};

export default App;
