import React, { useState, useEffect } from 'react';
import { bundleApi, BundleResponse } from '../services/bundleApi';
import { cartApi } from '../services/cartApi';
import { Screen } from '../types';
import { authApi } from '../services/api';
import ImageGallerySlider from '../components/ImageGallerySlider';
import DOMPurify from 'dompurify';

interface BundleDetailProps {
  onNavigate: (screen: Screen) => void;
  bundleId: number;
  onCartUpdate?: () => void;
  onProductClick?: (id: number) => void;
}

interface BundleProductItemProps {
  product: any;
  idx: number;
  onProductClick?: (id: number) => void;
  onImageSelect?: (imageUrl: string) => void;
}

const BundleProductItem: React.FC<BundleProductItemProps> = ({ product, idx, onProductClick, onImageSelect }) => {
  const [activeImage, setActiveImage] = useState(
    product.images?.find((img: any) => img.primary)?.imageUrl || product.images?.[0]?.imageUrl || ''
  );

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-[#3a3330]/40 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer"
      onClick={() => onProductClick?.(product.productId)}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-yellow-500/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{idx + 1}</span>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-surface-dark overflow-hidden flex items-center justify-center border border-gray-200 dark:border-white/10">
          {activeImage ? (
            <img 
              src={activeImage} 
              alt={product.productName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="material-symbols-outlined text-2xl text-gray-400">shopping_bag</span>
          )}
        </div>
        {product.images && product.images.length > 1 && (
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[80px]">
            {product.images.map((img: any, i: number) => (
              <div 
                key={i} 
                className={`w-6 h-6 rounded-md overflow-hidden border shrink-0 transition-all ${activeImage === img.imageUrl ? 'border-primary' : 'border-gray-200 dark:border-white/5 opacity-60 hover:opacity-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(img.imageUrl);
                  onImageSelect?.(img.imageUrl);
                }}
              >
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
          {product.productName}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {product.productPrice.toLocaleString()}₫ × {product.quantity}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-primary">
          {(product.productPrice * product.quantity).toLocaleString()}₫
        </p>
        <p className="text-xs text-gray-500 mt-0.5">SL: {product.quantity}</p>
      </div>
      <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0">chevron_right</span>
    </div>
  );
};

const BundleDetail: React.FC<BundleDetailProps> = ({ onNavigate, bundleId, onCartUpdate, onProductClick }) => {
  const [bundle, setBundle] = useState<BundleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundle = async () => {
      setIsLoading(true);
      try {
        const response = await bundleApi.getById(bundleId);
        setBundle(response.data);
      } catch (err) {
        console.error('Failed to fetch bundle:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundle();
    setQuantity(1);
  }, [bundleId]);

  const handleAddToCart = async () => {
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    if (!bundle) return;
    setAddingToCart(true);
    try {
      await cartApi.addItem({ itemType: 'BUNDLE', bundleId: bundle.id, quantity });
      setCartMessage('Đã thêm combo vào giỏ hàng!');
      onCartUpdate?.();
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      setCartMessage('Thêm vào giỏ thất bại. Vui lòng thử lại.');
      setTimeout(() => setCartMessage(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">progress_activity</span>
          <p className="text-gray-500 dark:text-gray-400">Đang tải combo...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4">error</span>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Không tìm thấy combo</p>
          <button onClick={() => onNavigate('shop')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const totalProductsValue = bundle.products.reduce((sum, p) => sum + p.productPrice * p.quantity, 0);
  const savings = totalProductsValue - bundle.price;

  // Combine bundle image with product images for the slider
  const allImages = [
    ...(bundle.image ? [{ url: bundle.image, label: 'Combo' }] : []),
    ...bundle.products.flatMap(p => 
      p.images.map(img => ({ url: img.imageUrl, label: p.productName }))
    )
  ];

  const currentImage = allImages[selectedImageIdx]?.url || bundle.image || '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('shop')}
        className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-medium">Quay lại cửa hàng</span>
      </button>

      <nav className="flex mb-8 text-sm text-gray-500 dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <a onClick={() => onNavigate('shop')} className="hover:text-primary transition-colors cursor-pointer">Combo Quà Tết</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{bundle.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <ImageGallerySlider 
            images={allImages.map((img, i) => ({ id: i, url: img.url, label: img.label }))}
            initialIndex={selectedImageIdx}
            onIndexChange={setSelectedImageIdx}
          />
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{bundle.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">redeem</span>
              Combo
            </span>
            <span className="w-px h-4 bg-gray-300 dark:bg-white/20"></span>
            <span className="text-gray-500 dark:text-gray-400">{bundle.products.length} sản phẩm</span>
          </div>

          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-4xl font-bold text-primary">{bundle.price.toLocaleString()}₫</span>
          </div>

          {savings > 0 && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">savings</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Tiết kiệm <span className="font-bold">{savings.toLocaleString()}₫</span> so với mua lẻ ({totalProductsValue.toLocaleString()}₫)
              </span>
            </div>
          )}

          {bundle.description && (
            <div
                className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 mb-8 leading-relaxed line-clamp-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bundle.description || '') }}
              />
          )}

          {/* Cart Messages */}
          {cartMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${cartMessage.includes('thất bại')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
              }`}>
              <span className="material-symbols-outlined text-lg">{cartMessage.includes('thất bại') ? 'error' : 'check_circle'}</span>
              {cartMessage}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Số lượng</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-[#3a3330]/60 rounded-lg bg-white dark:bg-surface-dark/80 h-12 w-32">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input
                  className="flex-1 w-full bg-transparent text-center text-gray-900 dark:text-white font-medium border-none focus:ring-0 p-0"
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1) setQuantity(val);
                  }}
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-glow transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined group-hover:animate-bounce">
                {addingToCart ? 'progress_activity' : 'shopping_cart'}
              </span>
              {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </button>
            <button className="sm:w-auto w-full border border-gray-300 dark:border-white/20 hover:border-accent hover:text-accent text-gray-900 dark:text-white font-medium py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 bg-white dark:bg-white/5">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-white/10 pt-6">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-gray-100 dark:bg-surface-dark flex items-center justify-center border border-gray-200 dark:border-white/10 text-accent shrink-0">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Giao hàng nhanh</h4>
                <p className="text-xs text-gray-500">Nội thành 2-4h</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-gray-100 dark:bg-surface-dark flex items-center justify-center border border-gray-200 dark:border-white/10 text-accent shrink-0">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Chính hãng 100%</h4>
                <p className="text-xs text-gray-500">Hoàn tiền nếu giả</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products in Bundle */}
      <div className="mb-16">
        <div className="bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl p-8 lg:p-10 shadow-sm dark:shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">inventory_2</span>
            Sản phẩm trong combo
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-auto">{bundle.products.length} sản phẩm</span>
          </h3>

          <div className="space-y-4">
            {bundle.products.map((product, idx) => (
              <BundleProductItem 
                key={product.id} 
                product={product} 
                idx={idx} 
                onProductClick={onProductClick}
              />
            ))}
          </div>

          {/* Total summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#3a3330]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tổng giá trị sản phẩm lẻ: <span className="line-through">{totalProductsValue.toLocaleString()}₫</span>
            </div>
            <div className="flex items-baseline gap-3">
              {savings > 0 && (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 px-3 py-1 rounded-full">
                  -{savings.toLocaleString()}₫
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                {bundle.price.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDetail;
