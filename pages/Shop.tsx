import React, { useMemo, useRef, useState, useEffect } from 'react';
import { productApi, ProductResponse } from '../services/productApi';
import { categoryApi, CategoryResponse } from '../services/categoryApi';
import { cartApi } from '../services/cartApi';
import { Screen } from '../types';
import { authApi } from '../services/api';
import Pagination from '../components/Pagination';

interface ShopProps {
  onNavigate: (screen: Screen) => void;
  onProductClick: (id: number) => void;
  onCartUpdate?: () => void;
}

interface CustomComboItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Helper: lấy ảnh chính (ưu tiên field primaryImage → image → images[])
const getPrimaryImage = (product: ProductResponse): string => {
  if (product.primaryImage) return product.primaryImage;
  if (product.image) return product.image;
  if (!product.images || product.images.length === 0) return '';
  const primary = product.images.find(img => img.isPrimary);
  return primary ? primary.imageUrl : product.images[0].imageUrl;
};

const Shop: React.FC<ShopProps> = ({ onNavigate, onProductClick, onCartUpdate }) => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [comboItems, setComboItems] = useState<CustomComboItem[]>([]);
  const [draggingOverDropZone, setDraggingOverDropZone] = useState(false);
  const [submittingCombo, setSubmittingCombo] = useState(false);
  const [comboNotice, setComboNotice] = useState('');
  const [comboPanelOpen, setComboPanelOpen] = useState(true);
  const [floatingPosition, setFloatingPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggingFloating, setDraggingFloating] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const productListTopRef = useRef<HTMLDivElement | null>(null);
  const dragMetaRef = useRef({
    offsetX: 0,
    offsetY: 0,
    width: 320,
    height: 120,
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getAll({
          page,
          size: 12,
          sortBy,
          sortDir,
        });
        if (response.data) {
          setProducts(response.data.data || []);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalItems);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, sortBy, sortDir]);

  // Client-side filter (search + category + price range)
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(product.categoryId);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case 'newest': setSortBy('createdAt'); setSortDir('desc'); break;
      case 'price-asc': setSortBy('price'); setSortDir('asc'); break;
      case 'price-desc': setSortBy('price'); setSortDir('desc'); break;
      default: setSortBy('createdAt'); setSortDir('desc');
    }
    setPage(0);
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

  const addProductToCombo = (product: ProductResponse) => {
    if (product.stock <= 0) return;
    const image = getPrimaryImage(product);

    setComboItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image,
          quantity: 1,
        },
      ];
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, productId: number) => {
    e.dataTransfer.setData('text/plain', String(productId));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropToCombo = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingOverDropZone(false);
    setComboPanelOpen(true);

    const rawId = e.dataTransfer.getData('text/plain');
    const productId = Number(rawId);
    if (!productId) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addProductToCombo(product);
  };

  const updateComboQuantity = (productId: number, delta: 1 | -1) => {
    setComboItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it
        )
        .filter((it) => it.quantity > 0)
    );
  };

  const comboTotal = useMemo(
    () => comboItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [comboItems]
  );

  const comboCount = useMemo(
    () => comboItems.reduce((sum, it) => sum + it.quantity, 0),
    [comboItems]
  );

  const handleAddComboToCart = async () => {
    if (comboItems.length === 0) return;
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }

    setSubmittingCombo(true);
    setComboNotice('');
    try {
      const customComboPayload = JSON.stringify({
        name: 'Combo kéo thả của tôi',
        totalPrice: comboTotal,
        items: comboItems.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
      });

      await cartApi.addItem({
        itemType: 'BUNDLE',
        bundleId: 1,
        quantity: 1,
        isCustomCombo: true,
        customComboData: customComboPayload,
      });

      setComboItems([]);
      setComboNotice('Đã thêm combo kéo thả vào giỏ hàng.');
      onCartUpdate?.();
      setTimeout(() => setComboNotice(''), 2500);
    } catch (err: any) {
      setComboNotice(err?.message || 'Không thể thêm combo vào giỏ hàng.');
    } finally {
      setSubmittingCombo(false);
    }
  };

  const startFloatingDrag = (e: React.MouseEvent, source: 'panel' | 'pill') => {
    e.preventDefault();
    e.stopPropagation();

    const element = source === 'panel' ? panelRef.current : pillRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    dragMetaRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    setFloatingPosition({ x: rect.left, y: rect.top });
    setDraggingFloating(true);
  };

  useEffect(() => {
    if (!draggingFloating) return;

    const onMove = (e: MouseEvent) => {
      const { offsetX, offsetY, width, height } = dragMetaRef.current;
      const minX = 8;
      const minY = 8;
      const maxX = Math.max(minX, window.innerWidth - width - 8);
      const maxY = Math.max(minY, window.innerHeight - height - 8);

      const nextX = Math.min(maxX, Math.max(minX, e.clientX - offsetX));
      const nextY = Math.min(maxY, Math.max(minY, e.clientY - offsetY));
      setFloatingPosition({ x: nextX, y: nextY });
    };

    const onUp = () => setDraggingFloating(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [draggingFloating]);

  useEffect(() => {
    if (!floatingPosition) return;

    const clampToViewport = () => {
      const activeElement = comboPanelOpen ? panelRef.current : pillRef.current;
      if (!activeElement) return;

      const rect = activeElement.getBoundingClientRect();
      const minX = 8;
      const minY = 8;
      const maxX = Math.max(minX, window.innerWidth - rect.width - 8);
      const maxY = Math.max(minY, window.innerHeight - rect.height - 8);

      setFloatingPosition((prev) => {
        if (!prev) return prev;
        const clampedX = Math.min(maxX, Math.max(minX, prev.x));
        const clampedY = Math.min(maxY, Math.max(minY, prev.y));

        if (clampedX === prev.x && clampedY === prev.y) {
          return prev;
        }

        return { x: clampedX, y: clampedY };
      });
    };

    const rafId = window.requestAnimationFrame(clampToViewport);
    window.addEventListener('resize', clampToViewport);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', clampToViewport);
    };
  }, [floatingPosition, comboPanelOpen]);

  const floatingStyle = floatingPosition
    ? {
      left: `${floatingPosition.x}px`,
      top: `${floatingPosition.y}px`,
      right: 'auto',
      bottom: 'auto',
    }
    : undefined;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 10000000]);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setPage(nextPage);

    window.requestAnimationFrame(() => {
      productListTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const stripHtml = (html?: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const showInitialLoading = isLoading && products.length === 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
      >
        <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-medium">Quay lại</span>
      </button>

      <nav className="flex mb-8 text-sm text-text-light-secondary dark:text-gray-400">
        <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Tất cả sản phẩm</span>
      </nav>
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div className="pb-6 border-b border-primary/10 dark:border-white/10 lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-gray-900 dark:text-white">Bộ lọc</h3>
              <button onClick={handleClearFilters} className="text-xs text-primary font-medium hover:underline">Xóa tất cả</button>
            </div>
            <div className="mb-8">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Loại sản phẩm</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === 0}
                    onChange={() => setSelectedCategories([])}
                    className="rounded border-gray-300 dark:border-white/20 bg-transparent text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors text-sm">Tất cả</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                      className="rounded border-gray-300 dark:border-white/20 bg-transparent text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4">Khoảng giá</h4>
              <div className="space-y-4">
                {/* Manual Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Giá tối thiểu</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                        setPriceRange([value, priceRange[1]]);
                      }}
                      className="w-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-primary/20 dark:border-[#3a3330]/60 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-1 focus:ring-primary dark:focus:ring-[#b8860b]/40 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Giá tối đa</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const value = Math.max(priceRange[0], Math.min(Number(e.target.value), 10000000));
                        setPriceRange([priceRange[0], value]);
                      }}
                      className="w-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-primary/20 dark:border-[#3a3330]/60 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-1 focus:ring-primary dark:focus:ring-[#b8860b]/40 transition-all"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-center justify-between text-xs bg-blush/50 dark:bg-surface-dark/60 dark:backdrop-blur-sm rounded-lg px-3 py-2 dark:border dark:border-[#3a3330]/40">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {priceRange[0].toLocaleString()}₫
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">→</span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {priceRange[1].toLocaleString()}₫
                  </span>
                </div>

                {/* Dual Range Slider */}
                <div className="relative h-6 flex items-center">
                  {/* Track Background */}
                  <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full"></div>

                  {/* Active Track */}
                  <div
                    className="absolute h-1.5 bg-gradient-to-r from-primary to-accent rounded-full"
                    style={{
                      left: `${(priceRange[0] / 10000000) * 100}%`,
                      right: `${100 - (priceRange[1] / 10000000) * 100}%`
                    }}
                  ></div>

                  {/* Min Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value < priceRange[1]) {
                        setPriceRange([value, priceRange[1]]);
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:-mt-[5px] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:border-0"
                  />

                  {/* Max Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > priceRange[0]) {
                        setPriceRange([priceRange[0], value]);
                      }
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:-mt-[5px] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div ref={productListTopRef} />
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">Bộ Sưu Tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent italic">Quà Tết 2026</span></h1>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gradient-to-r dark:from-surface-dark dark:to-card-dark p-4 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 shadow-sm dark:shadow-lg">
              <div className="relative w-full md:w-96 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-background-dark/60 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-1 focus:ring-primary dark:focus:ring-[#b8860b]/40 transition-all"
                  placeholder="Tìm kiếm sản phẩm..."
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">{totalItems} sản phẩm</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sắp xếp:</span>
                  <select
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-gray-50 dark:bg-background-dark/60 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-900 dark:text-gray-200 focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-0 cursor-pointer dark:shadow-inner"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {showInitialLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">progress_activity</span>
                <p className="text-gray-500 dark:text-gray-400">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4">inventory_2</span>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {isLoading && (
                <div className="absolute right-0 -top-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-gray-600 shadow-sm dark:bg-card-dark/90 dark:text-gray-300">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Đang tải trang...
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    draggable={product.stock > 0}
                    onDragStart={(e) => handleDragStart(e, product.id)}
                    className="group bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark rounded-xl p-4 border border-gray-200 dark:border-[#3a3330]/60 hover:border-primary/30 dark:hover:border-[#b8860b]/40 transition-all duration-300 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-[#8b2332]/10 flex flex-col h-full cursor-pointer"
                    onClick={() => onProductClick(product.id)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-background-dark">
                      {getPrimaryImage(product) ? (
                        <img alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" src={getPrimaryImage(product)} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-6xl">image</span>
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Hết hàng</span>
                        </div>
                      )}
                      {product.stock > 0 && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => handleAddToCart(e, product.id)}
                            disabled={addingToCart === product.id}
                            className="size-10 bg-white text-background-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-glow disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {addingToCart === product.id ? 'progress_activity' : 'add_shopping_cart'}
                            </span>
                          </button>
                          <button className="size-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">Kéo thả sản phẩm vào góc phải để tạo combo</p>
                      <p className="text-xs text-accent font-medium uppercase tracking-wide mb-1">{product.categoryName}</p>
                      <h3 className="text-gray-900 dark:text-white font-medium text-lg mb-1 group-hover:text-primary transition-colors truncate">{product.name}</h3>
                      {/* <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p> */}
                      <p
                        className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2"
                        title={stripHtml(product.description)}
                      >
                        {stripHtml(product.description)}
                      </p>
                      <div className="flex items-baseline gap-3 border-t border-gray-100 dark:border-white/5 pt-3">
                        <span className="text-primary font-bold text-lg">{product.price.toLocaleString()}₫</span>
                        {product.stock > 0 && product.stock <= 10 && (
                          <span className="text-xs text-orange-500 font-medium">Còn {product.stock}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} variant="numbered" className="mt-10" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop Combo Builder */}
      <div
        ref={panelRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDraggingOverDropZone(true);
          if (!comboPanelOpen) setComboPanelOpen(true);
        }}
        onDragLeave={() => setDraggingOverDropZone(false)}
        onDrop={handleDropToCombo}
        style={floatingStyle}
        className={`fixed bottom-24 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl backdrop-blur-sm transition-all duration-200 ${draggingOverDropZone
          ? 'border-primary bg-white ring-4 ring-primary/20 dark:bg-card-dark scale-[1.01]'
          : 'border-gray-200 bg-white/95 dark:border-white/10 dark:bg-card-dark/95'
          } ${comboPanelOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">redeem</span>
              Tạo Combo Theo Ý Muốn
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kéo sản phẩm vào đây để tạo combo nhanh</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => startFloatingDrag(e, 'panel')}
              className="inline-flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/40 dark:border-white/10 dark:text-gray-300 cursor-move"
              title="Di chuyển"
            >
              <span className="material-symbols-outlined text-base">drag_indicator</span>
            </button>
            <button
              type="button"
              onClick={() => setComboPanelOpen(false)}
              className="inline-flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/40 dark:border-white/10 dark:text-gray-300"
              title="Thu gọn"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
          {comboItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/20 p-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Thả sản phẩm vào đây
            </div>
          ) : (
            comboItems.map((it) => (
              <div key={it.productId} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 p-2">
                <div className="size-10 rounded-md overflow-hidden bg-gray-100 dark:bg-surface-dark shrink-0">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400 text-xl h-full w-full flex items-center justify-center">inventory_2</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{it.name}</p>
                  <p className="text-[11px] text-primary font-bold">{(it.price * it.quantity).toLocaleString()}₫</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateComboQuantity(it.productId, -1)} className="size-6 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">-</button>
                  <span className="w-5 text-center text-xs font-bold text-gray-900 dark:text-white">{it.quantity}</span>
                  <button onClick={() => updateComboQuantity(it.productId, 1)} className="size-6 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">{comboCount} sản phẩm</span>
            <span className="text-base font-black text-primary">{comboTotal.toLocaleString()}₫</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComboItems([])}
              disabled={comboItems.length === 0 || submittingCombo}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-white/20 text-xs font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              Xóa
            </button>
            <button
              onClick={handleAddComboToCart}
              disabled={comboItems.length === 0 || submittingCombo}
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submittingCombo ? 'Đang thêm...' : 'Thêm combo vào giỏ'}
            </button>
          </div>
          {comboNotice && (
            <p className={`mt-2 text-xs ${comboNotice.includes('Đã thêm') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {comboNotice}
            </p>
          )}
        </div>
      </div>

      {!comboPanelOpen && (
        <button
          ref={pillRef}
          type="button"
          onClick={() => setComboPanelOpen(true)}
          style={floatingStyle}
          className="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/95 dark:bg-card-dark/95 px-4 py-2 shadow-xl backdrop-blur-sm"
        >
          <span
            onMouseDown={(e) => startFloatingDrag(e, 'pill')}
            className="material-symbols-outlined text-gray-400 text-base cursor-move"
            title="Di chuyển"
          >
            drag_indicator
          </span>
          <span className="material-symbols-outlined text-primary text-lg">redeem</span>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Combo: {comboCount}</span>
          <span className="text-xs font-bold text-primary">{comboTotal.toLocaleString()}₫</span>
        </button>
      )}
    </div>
  );
};

export default Shop;
