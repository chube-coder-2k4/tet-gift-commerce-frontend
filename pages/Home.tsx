import React, { useState, useEffect } from 'react';
import { productApi, ProductResponse } from '../services/productApi';
import { categoryApi, CategoryResponse } from '../services/categoryApi';
import { bundleApi, BundleResponse } from '../services/bundleApi';
import { cartApi } from '../services/cartApi';
import { Screen } from '../types';
import { Firewall } from '@/components/Firewall';
import { authApi } from '../services/api';
import BannerCarousel, { BannerSlide } from '../components/BannerCarousel';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  onProductClick: (id: number) => void;
  onCartUpdate?: () => void;
  onBundleClick?: (id: number) => void;
}

// Helper: lấy ảnh chính (ưu tiên field primaryImage → image → images[])
const getPrimaryImage = (product: ProductResponse): string => {
  if (product.primaryImage) return product.primaryImage;
  if (product.image) return product.image;
  if (!product.images || product.images.length === 0) return '';
  const primary = product.images.find(img => img.isPrimary);
  return primary ? primary.imageUrl : product.images[0].imageUrl;
};

const Home: React.FC<HomeProps> = ({ onNavigate, onProductClick, onCartUpdate, onBundleClick }) => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [bundles, setBundles] = useState<BundleResponse[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingBundles, setIsLoadingBundles] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [addingBundleToCart, setAddingBundleToCart] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProducts(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productApi.getAll({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
          categoryApi.getAll(),
        ]);
        setProducts(productsRes.data?.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBundles = async () => {
      setIsLoadingBundles(true);
      try {
        const res = await bundleApi.getAll({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc' });
        setBundles(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch bundles:', err);
      } finally {
        setIsLoadingBundles(false);
      }
    };
    fetchBundles();
  }, []);

  const handleAddBundleToCart = async (e: React.MouseEvent, bundleId: number) => {
    e.stopPropagation();
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    setAddingBundleToCart(bundleId);
    try {
      await cartApi.addItem({ itemType: 'BUNDLE', bundleId, quantity: 1 });
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to add bundle to cart:', err);
    } finally {
      setAddingBundleToCart(null);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    setAddingToCart(productId);
    try {
      await cartApi.addItem({ itemType: 'PRODUCT', productId, quantity: 1 });
      onCartUpdate?.();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(null);
    }
  };
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      <Firewall />

      {/* Banner Carousel */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <BannerCarousel
          slides={[
            {
              image: '/banners/banner1.png',
              title: 'Quà Tết Cao Cấp 2026',
              subtitle: 'Bộ sưu tập hộp quà sang trọng, mang đậm hương vị truyền thống',
              cta: 'Khám Phá Ngay',
              onClick: () => onNavigate('shop'),
            },
            {
              image: '/banners/banner2.png',
              title: 'Giỏ Quà Doanh Nghiệp',
              subtitle: 'Thiết kế riêng cho doanh nghiệp — Ưu đãi đặc biệt khi đặt số lượng lớn',
              cta: 'Xem Bộ Sưu Tập',
              onClick: () => onNavigate('shop'),
            },
            {
              image: '/banners/banner3.png',
              title: 'Lì Xì & Quà Tặng Tết',
              subtitle: 'Lựa chọn hoàn hảo cho những người thân yêu nhân dịp Xuân về',
              cta: 'Mua Ngay',
              onClick: () => onNavigate('shop'),
            },
          ] as BannerSlide[]}
          interval={5000}
        />
      </div>

      {/* Hero Section */}
      <div className="w-full relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-primary/20 dark:border-[#b8860b]/20 w-fit shadow-sm dark:shadow-lg">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-accent dark:text-[#daa520] text-xs font-semibold uppercase tracking-widest">Chào Xuân Giáp Thìn 2026</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-medium leading-[1.1] text-gray-900 dark:text-white tracking-tight">
              Trao Gửi <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent">Yêu Thương</span> <br />
              Tết Vẹn Tròn
            </h1>
            <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed max-w-lg font-light">
              Bộ sưu tập quà Tết cao cấp, mang đậm hương vị truyền thống kết hợp sự sang trọng hiện đại. Đẳng cấp trong từng chi tiết.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => onNavigate('about')}
                className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(217,4,41,0.5)]"
              >
                Khám Phá Ngay
              </button>
              <button className="px-8 py-3.5 rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2 group">
                Xem Catalog
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 opacity-60"></div>
              <img alt="Tet Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" src="https://plus.unsplash.com/premium_photo-1683140803764-35a5a7e78c02?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
              <div className="absolute bottom-8 left-8 z-20 glass-panel p-4 rounded-xl max-w-xs border-l-4 border-l-gold">
                <p className="text-red-700 dark:text-white font-serif text-lg">Tinh Hoa Tết Việt</p>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/10 rounded-[2rem] blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
      {/* Featured Categories */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Danh Mục <span className="italic text-gray-500 dark:text-gray-400">Nổi Bật</span></h2>
          <a onClick={() => onNavigate('shop')} className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-primary transition-colors flex items-center gap-1 group cursor-pointer">
            Xem tất cả <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(categories.length > 0 ? categories.slice(0, 4) : [
            { id: 1, name: 'Hộp Quà Tết', description: '', isActive: true },
            { id: 2, name: 'Giỏ Quà Tết', description: '', isActive: true },
            { id: 3, name: 'Túi Quà Tết', description: '', isActive: true },
            { id: 4, name: 'Rượu Vang', description: '', isActive: true },
          ]).map((cat, idx) => {
            const icons = ['inventory_2', 'shopping_basket', 'shopping_bag', 'wine_bar'];
            const defaultImages = [
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBlBWvaMHBQxGn_x6I2WkSTFXY3Dsh7Bt30e1EugVz_E1q-wBLHq0V8U1hpIFE769nzLvl3sX25kpU9_1oBfFHPCtSFAtx2XEYRW4p1ooNXk4mlVc5ixmeFHJbm9CBQrTl6ZPwHF7i0w-C-_7JC1QDpNuzg-MVt0SzHwLERBBNT6esHkI-Vmdvb4VlKiR1oyLL5H1InVohcGVmsKooyrvY6Nye3bKTj0xZBOeX0tj_wZL8PoQ3qRezWNLi6a8fG4rv1R3ZFUpkH8Bo',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDhQutXkcjc51gtDH-rrlzGLxUjXELp79G8vCslV7FcDgkX8alX0YCt5KEg1L8_8ZRbLNUJ9WJwKc5-I0HHHmn61VLvMzvmAr0VNymAaOSx2FvM9qLkfV1LsG5Bw0bc4sasC1etKuV2_aofXx4SGY6rSBr8EwZIgCWc0aVPIaZpUcgUB33a5v62oduI5ZQvyVzK41VPdWktojPLaUqDKxkY9mGcyKa3e_J39PlUDNee4TRsppwMIYrrFVG48gjjV9mn6L66larLKMU',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAwXFIRC3Jdlb52WZWHa2iQlPxhPfgb5LV25uR4vpaEzHK97Cc4oQipA06HlylO2Jb-Mc-d3xrwLwLE6Ua0mWq16p94H7oeMRKINb2h2BsNMMKxq0tRUUF-Yw0jgLgVHKyaXGdwskGIu1HUdVyXoHdIs7uu3Rs_G_2w-1f9NMq6UaFhlu-brsa3YNB709kFbyv9P5VqbQ_4WdzCVwouMl6Oi48fxPLvH8i0sYIs7M1ivkxf3hEXzuYYtukLOqB2ijrCMEoPR8YEE6Y',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCO_cDL_WwfWU4aDmCak4W6RCuR7_7ACX95kW-X-chS5LNk9cU62tql31HffUW6UC0aM9IBWfOTDyPOqVy3EPWsEmecStO9v3BZjT-Z1Z_rekXghfUqBdKs3iJcRSKNm8CTccfQeKqF70t9sXRlcEP603hgodwOZ38ynHcuuD3yrHRNRlqXB-RXGb5X1iYiqR3DnuW3j2amGLrHqgnCsnL4Rqd-bUCt4Zo9KDM26w_t6iNcHy82brxugaMu5pIRsou89wsseeTNUvA',
            ];
            return (
              <a key={cat.id} onClick={() => onNavigate('shop')} className="group relative block overflow-hidden rounded-2xl aspect-[3/4] border border-primary/20 dark:border-white/5 hover:border-primary hover:shadow-xl transition-all cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
                <img alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" src={defaultImages[idx % defaultImages.length]} />
                <div className="absolute bottom-0 p-6 z-20 w-full transform transition-transform duration-300">
                  <span className="material-symbols-outlined text-accent text-2xl mb-2 opacity-80">{icons[idx % icons.length]}</span>
                  <h3 className="text-xl font-display font-semibold text-white mb-1">{cat.name}</h3>
                  <p className="text-gray-400 text-xs font-light translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Khám phá ngay</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* New Collection */}
      <div className="w-full bg-peach/30 dark:bg-gradient-to-br dark:from-[#1f1b19] dark:via-[#1a1715] dark:to-[#1f1b19] border-y border-primary/10 dark:border-[#3a3330]/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">New Collection</span>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Xuân Giáp Thìn <span className="italic font-light text-gray-500">2026</span></h2>
            </div>
            <div className="flex gap-3">
              <button className="size-10 rounded-full border border-primary/30 dark:border-white/10 flex items-center justify-center hover:bg-primary/10 dark:hover:bg-white/5 text-gray-900 dark:text-white transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingProducts ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">Chưa có sản phẩm</div>
            ) : (
              products.slice(0, 4).map((product) => {
                const imgUrl = getPrimaryImage(product);
                return (
                  <div key={product.id} className="group bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark rounded-xl p-4 border border-primary/20 dark:border-[#3a3330]/60 hover:border-primary dark:hover:border-[#b8860b]/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-[#8b2332]/10 transition-all duration-300 cursor-pointer" onClick={() => onProductClick(product.id)}>
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-background-dark">
                      {imgUrl ? (
                        <img alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src={imgUrl} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-5xl">image</span>
                        </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 left-3 bg-accent text-black text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">Sắp hết</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={addingToCart === product.id || product.stock === 0}
                          className="size-10 bg-white text-background-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {addingToCart === product.id ? 'hourglass_empty' : 'add_shopping_cart'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary/70 dark:text-primary/50 font-medium">{product.categoryName}</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 line-clamp-1">{product.description}</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-primary font-bold text-lg">{product.price.toLocaleString()}₫</span>
                      {product.stock === 0 && <span className="text-red-400 text-xs font-medium">Hết hàng</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Combo Quà Tết Section */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Best Combos</span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Combo Quà Tết <span className="italic font-light text-gray-500">Đặc Sắc</span></h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-lg">Những bộ combo quà Tết được tuyển chọn kỹ lưỡng — tiện lợi, sang trọng, ý nghĩa.</p>
          </div>
          <a onClick={() => onNavigate('bundles')} className="text-sm font-medium text-gray-600 dark:text-white/70 hover:text-primary transition-colors flex items-center gap-1 group cursor-pointer shrink-0">
            Xem tất cả <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoadingBundles ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : bundles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">Chưa có combo nào</div>
          ) : (
            bundles.slice(0, 4).map((bundle) => (
              <div key={bundle.id} className="group bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark rounded-xl p-4 border border-primary/20 dark:border-[#3a3330]/60 hover:border-primary dark:hover:border-[#b8860b]/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-[#8b2332]/10 transition-all duration-300 cursor-pointer" onClick={() => onBundleClick?.(bundle.id)}>
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-background-dark">
                  {bundle.image ? (
                    <img alt={bundle.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src={bundle.image} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-yellow-500/5 dark:from-primary/10 dark:to-yellow-500/10">
                      <span className="material-symbols-outlined text-5xl text-primary/40">redeem</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-red-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[12px]">redeem</span>
                    Combo
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => handleAddBundleToCart(e, bundle.id)}
                      disabled={addingBundleToCart === bundle.id}
                      className="size-10 bg-white text-background-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {addingBundleToCart === bundle.id ? 'hourglass_empty' : 'add_shopping_cart'}
                      </span>
                    </button>
                  </div>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1 group-hover:text-primary transition-colors truncate">{bundle.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 line-clamp-2">{bundle.description || `Bao gồm ${bundle.products.length} sản phẩm`}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">{bundle.price.toLocaleString()}₫</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                    {bundle.products.length} sản phẩm
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Special Offer Banner */}
      <div className="w-full max-w-7xl px-4 md:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 to-[#2d0a0a] border border-white/10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 group">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvhISll5J5hhOI-UbsktqYO1W_96_4VOC1ETq0h_D8k_OdDM9myXOS-gS7IOpVz5H1xp13hWXfx_pmmXKpnKw9gt57RjEhJUyNf01oz8DpO3ybU34wWJ3PSM-o6_okxs8UgwkVzXLQoR0u13OrJpLxV3zGmDVVxBhh63htFJ6pynHh5v3CWiKUk0hjwLBmovlGls6ieXp_nStUnrNW4RMmf1XXHdbvChFunmuO013vXfOr5Z13gLR7PyTho5TxL2bo_kRn7nZKTGc')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="flex flex-col gap-4 z-10 max-w-xl text-center md:text-left">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Special Offer</span>
            <h3 className="text-white text-4xl md:text-5xl font-serif leading-tight">
              Mua Sớm Giảm Sâu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Đón Tết Sum Vầy</span>
            </h3>
            <p className="text-gray-300 text-lg font-light mt-2">
              Giảm thêm <span className="text-white font-bold">15%</span> cho đơn hàng đặt trước ngày 20/01. <br className="hidden md:block" />
              Sử dụng mã: <span className="font-mono text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded ml-1">TET2026</span>
            </p>
          </div>
          <div className="z-10 relative">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-gradient-to-r from-primary to-red-600 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-glow hover:shadow-[0_0_25px_rgba(239,35,60,0.6)] hover:scale-105 transition-all border border-white/10"
            >
              Mua Ngay Kẻo Lỡ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
