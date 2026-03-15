import React, { useState, useEffect } from 'react';
import { productApi, ProductResponse } from '../services/productApi';
import { cartApi } from '../services/cartApi';
import { reviewApi, ReviewResponse } from '../services/reviewApi';
import { Screen } from '../types';
import { authApi } from '../services/api';

interface ProductDetailProps {
  onNavigate: (screen: Screen) => void;
  productId: number;
  onCartUpdate?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onNavigate, productId, onCartUpdate }) => {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  // Review states
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await productApi.getById(productId);
        setProduct(response.data);
        // Reset selected image khi đổi sản phẩm
        const primaryIdx = response.data?.images?.findIndex(img => img.isPrimary) ?? 0;
        setSelectedImageIdx(primaryIdx >= 0 ? primaryIdx : 0);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    setQuantity(1);
  }, [productId]);

  // Fetch reviews
  const fetchReviews = async (page = 0) => {
    setReviewsLoading(true);
    try {
      const res = await reviewApi.getByProduct(productId, page, 5);
      const data = res.data;
      if (data) {
        setReviews(data.data || []);
        setReviewTotalPages(data.totalPages || 0);
        setTotalReviews(data.totalItems || 0);
        // Compute average
        const allReviews = data.data || [];
        if (allReviews.length > 0) {
          const sum = allReviews.reduce((acc: number, r: ReviewResponse) => acc + r.rating, 0);
          setAvgRating(Math.round((sum / allReviews.length) * 10) / 10);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(reviewPage);
  }, [productId, reviewPage]);

  const handleSubmitReview = async () => {
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    if (newRating === 0 || !newComment.trim()) {
      setReviewMessage('Vui lòng chọn số sao và nhập nhận xét.');
      setTimeout(() => setReviewMessage(null), 3000);
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewApi.create(productId, { rating: newRating, comment: newComment.trim() });
      setNewRating(0);
      setNewComment('');
      setReviewMessage('Đánh giá của bạn đã được gửi thành công!');
      setReviewPage(0);
      await fetchReviews(0);
      setTimeout(() => setReviewMessage(null), 3000);
    } catch (err: any) {
      const msg = err?.message || 'Gửi đánh giá thất bại. Mỗi người chỉ được đánh giá 1 lần.';
      setReviewMessage(msg);
      setTimeout(() => setReviewMessage(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!authApi.isAuthenticated()) {
      onNavigate('login');
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    try {
      await cartApi.addItem({ itemType: 'PRODUCT', productId: product.id, quantity });
      setCartMessage('Đã thêm vào giỏ hàng!');
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
          <p className="text-gray-500 dark:text-gray-400">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4">error</span>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Không tìm thấy sản phẩm</p>
          <button onClick={() => onNavigate('shop')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const currentImage = product.images?.[selectedImageIdx]?.imageUrl || product.image || '';
  const inStock = product.stock > 0;

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
        <a onClick={() => onNavigate('shop')} className="hover:text-primary transition-colors cursor-pointer">Hộp quà Tết</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 group shadow-sm dark:shadow-lg">
            {currentImage ? (
              <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={currentImage} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-8xl">image</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {!inStock && <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-glow">Hết hàng</span>}
              {inStock && product.stock <= 10 && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">Còn {product.stock}</span>}
            </div>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`aspect-square rounded-xl border overflow-hidden transition-colors ${i === selectedImageIdx ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}
                >
                  <img alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" src={img.imageUrl} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold uppercase rounded-full tracking-wider">{product.categoryName}</span>
            <span className="w-px h-4 bg-gray-300 dark:bg-white/20"></span>
            <div className={`flex items-center gap-2 ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              <span className="material-symbols-outlined text-[18px] fill-current">{inStock ? 'check_circle' : 'cancel'}</span>
              <span>{inStock ? `Còn hàng (${product.stock})` : 'Hết hàng'}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-primary">{product.price.toLocaleString()}₫</span>
          </div>

          {product.expDate && (
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-base">event</span>
              <span>HSD: {new Date(product.expDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}

          <div className="prose prose-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Cart Success/Error Message */}
          {cartMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${cartMessage.includes('thất bại')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
              }`}>
              <span className="material-symbols-outlined text-lg">{cartMessage.includes('thất bại') ? 'error' : 'check_circle'}</span>
              {cartMessage}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Số lượng</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-[#3a3330]/60 rounded-lg bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm h-12 w-32 dark:shadow-inner">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input
                  className="flex-1 w-full bg-transparent text-center text-gray-900 dark:text-white font-medium border-none focus:ring-0 p-0"
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= product.stock) setQuantity(val);
                  }}
                />
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="flex-1 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-glow transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined group-hover:animate-bounce">
                {addingToCart ? 'progress_activity' : 'shopping_cart'}
              </span>
              {addingToCart ? 'Đang thêm...' : inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
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

      {/* Product Description & Reviews Tabs */}
      <div className="mb-16">
        <div className="border-b border-gray-200 dark:border-[#3a3330]/60 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-2 font-bold border-b-2 transition-colors ${activeTab === 'description' ? 'text-gray-900 dark:text-white border-primary' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white border-transparent'}`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-2 font-bold border-b-2 transition-colors ${activeTab === 'reviews' ? 'text-gray-900 dark:text-white border-primary' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white border-transparent'}`}
            >
              Đánh giá
            </button>
          </div>
        </div>

        {/* Product Description */}
        {activeTab === 'description' && (
          <div className="bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl p-8 lg:p-10 shadow-sm dark:shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết sản phẩm</h3>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-lg">category</span>
                    Danh mục
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{product.categoryName}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-lg">inventory</span>
                    Tồn kho
                  </h4>
                  <p className={`font-medium ${inStock ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {inStock ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </p>
                </div>
                {product.manufactureDate && (
                  <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-lg">today</span>
                      Ngày sản xuất
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">{new Date(product.manufactureDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                )}
                {product.expDate && (
                  <div className="p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent text-lg">event_busy</span>
                      Hạn sử dụng
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">{new Date(product.expDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Reviews */}
      {activeTab === 'reviews' && (
        <div className="mb-16">
          <div className="bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl p-8 lg:p-10 shadow-sm dark:shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-accent">reviews</span>
              Đánh giá sản phẩm
            </h3>

            <div className="flex flex-col lg:flex-row gap-10 mb-10">
              {/* Rating Summary */}
              <div className="lg:w-1/3 text-center lg:border-r border-gray-200 dark:border-[#3a3330]/60 lg:pr-10">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{avgRating || 0}</div>
                <div className="flex justify-center text-accent mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-2xl fill-current ${i < Math.floor(avgRating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{totalReviews} đánh giá</p>
              </div>

              {/* Review List */}
              <div className="flex-1 space-y-6">
                {/* Write Review Form */}
                <div className="bg-gradient-to-br from-peach/20 to-blush/20 dark:from-[#8b2332]/10 dark:to-[#b8860b]/5 border-2 border-primary/20 dark:border-[#b8860b]/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary dark:text-[#daa520]">rate_review</span>
                    Viết đánh giá của bạn
                  </h4>

                  {reviewMessage && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${reviewMessage.includes('thành công')
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                      <span className="material-symbols-outlined text-lg">{reviewMessage.includes('thành công') ? 'check_circle' : 'error'}</span>
                      {reviewMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Star Rating Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Đánh giá của bạn <span className="text-primary">*</span>
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="group relative"
                            title={`${star} sao`}
                          >
                            <span className={`material-symbols-outlined text-4xl fill-current transition-colors cursor-pointer ${star <= (hoverRating || newRating) ? 'text-accent' : 'text-gray-300 dark:text-gray-600 hover:text-accent/50'
                              }`}>
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {newRating > 0 ? `Bạn đã chọn ${newRating} sao` : 'Nhấp vào sao để đánh giá'}
                      </p>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                      <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nhận xét của bạn <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="reviewComment"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 dark:from-[#8b2332] dark:to-[#6b1a28] dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">{submittingReview ? 'progress_activity' : 'send'}</span>
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </div>

                {/* Existing Reviews */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 block mb-2">rate_review</span>
                    <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  <>
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-gray-200 dark:border-[#3a3330]/40 last:border-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 dark:bg-[#8b2332]/25 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary dark:text-[#daa520]">person</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{review.userName || 'Ẩn danh'}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className="flex text-accent">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`material-symbols-outlined text-sm fill-current ${i < review.rating ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}

                    {/* Pagination */}
                    {reviewTotalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <button
                          onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                          disabled={reviewPage === 0}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 text-sm"
                        >
                          Trước
                        </button>
                        <span className="text-sm text-gray-500">Trang {reviewPage + 1} / {reviewTotalPages}</span>
                        <button
                          onClick={() => setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))}
                          disabled={reviewPage >= reviewTotalPages - 1}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 text-sm"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
