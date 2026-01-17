import React from 'react';
import { PRODUCTS } from '../constants';
import { Screen } from '../types';

interface ProductDetailProps {
  onNavigate: (screen: Screen) => void;
  productId: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onNavigate, productId }) => {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

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
            <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.image} />
            <div className="absolute top-4 left-4 flex gap-2">
              {product.discount && <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-glow">-{product.discount}%</span>}
              <span className="bg-accent text-black text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">Best Seller</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <button key={i} className={`aspect-square rounded-xl border overflow-hidden transition-colors ${i === 1 ? 'border-primary' : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'}`}>
                <img alt={`Thumbnail ${i}`} className="w-full h-full object-cover" src={product.image} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-[18px] fill-current ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-300 underline font-medium ml-1">{product.rating} ({product.reviews} đánh giá)</span>
            </div>
            <span className="w-px h-4 bg-gray-300 dark:bg-white/20"></span>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-[18px] fill-current">check_circle</span>
              <span>Còn hàng</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-primary">{product.price.toLocaleString()}₫</span>
            {product.originalPrice && <span className="text-xl text-gray-400 dark:text-gray-500 line-through">{product.originalPrice.toLocaleString()}₫</span>}
          </div>

          <div className="prose prose-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            <p>Sản phẩm là sự kết hợp tinh tế giữa truyền thống và hiện đại. Bộ sản phẩm bao gồm rượu vang cao cấp, hạt macca, hạt điều rang muối và trà thượng hạng. Thiết kế hộp sơn mài sang trọng, mang ý nghĩa tài lộc, thịnh vượng cho năm mới.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Số lượng</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-[#3a3330]/60 rounded-lg bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm h-12 w-32 dark:shadow-inner">
                <button className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <input className="flex-1 w-full bg-transparent text-center text-gray-900 dark:text-white font-medium border-none focus:ring-0 p-0" type="text" defaultValue="1" />
                <button className="w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={() => onNavigate('cart')}
              className="flex-1 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-glow transition-all flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined group-hover:animate-bounce">shopping_cart</span>
              Thêm vào giỏ
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
            <button className="pb-4 px-2 text-gray-900 dark:text-white font-bold border-b-2 border-primary">
              Mô tả sản phẩm
            </button>
            <button className="pb-4 px-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors border-b-2 border-transparent">
              Đánh giá ({product.reviews})
            </button>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl p-8 lg:p-10 shadow-sm dark:shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chi tiết sản phẩm</h3>
          
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {product.name} là sản phẩm quà tết cao cấp được thiết kế đặc biệt cho dịp Tết Nguyên Đán 2026. 
              Sản phẩm thể hiện sự kết hợp hoàn hảo giữa giá trị truyền thống và phong cách hiện đại, 
              mang đến món quà ý nghĩa cho người thân, đối tác và khách hàng.
            </p>
            
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">Thành phần sản phẩm</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Rượu vang đỏ cao cấp nhập khẩu (750ml)</li>
              <li>Hạt Macca Úc rang muối (200g)</li>
              <li>Hạt điều rang muối Bình Phước (200g)</li>
              <li>Trà Oolong thượng hạng (100g)</li>
              <li>Bánh quy bơ Đan Mạch (150g)</li>
              <li>Kẹo socola Lindt (100g)</li>
            </ul>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">Đặc điểm nổi bật</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Hộp sơn mài cao cấp, họa tiết hoa mai vàng tươi tắn</li>
              <li>Thiết kế sang trọng, thể hiện đẳng cấp người tặng</li>
              <li>Sản phẩm chính hãng, nguồn gốc xuất xứ rõ ràng</li>
              <li>Đóng gói cẩn thận, kèm túi xách cao cấp</li>
              <li>Có thể tùy chỉnh thiệp chúc theo yêu cầu</li>
            </ul>

            <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">Hướng dẫn bảo quản</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Bảo quản ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. 
              Rượu vang nên để nằm ngang ở nhiệt độ 12-18°C. 
              Hạt dinh dưỡng sau khi mở nên bảo quản trong hộp kín.
            </p>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mb-16">
        <div className="bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl p-8 lg:p-10 shadow-sm dark:shadow-lg">
          <div className="flex flex-col lg:flex-row gap-10 mb-10">
            {/* Rating Summary */}
            <div className="lg:w-1/3 text-center lg:border-r border-gray-200 dark:border-[#3a3330]/60 lg:pr-10">
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{product.rating}</div>
              <div className="flex justify-center text-accent mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-2xl fill-current ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}>star</span>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{product.reviews} đánh giá</p>
              
              {/* Rating Breakdown */}
              <div className="space-y-2 text-left">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400 w-12">{star} sao</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-surface-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full" 
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 w-10 text-right">{star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            <div className="flex-1 space-y-6">
              {/* Write Review Form */}
              <div className="bg-gradient-to-br from-peach/20 to-blush/20 dark:from-[#8b2332]/10 dark:to-[#b8860b]/5 border-2 border-primary/20 dark:border-[#b8860b]/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-[#daa520]">rate_review</span>
                  Viết đánh giá của bạn
                </h4>
                
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
                          className="group relative"
                          title={`${star} sao`}
                        >
                          <span className="material-symbols-outlined text-4xl fill-current text-gray-300 dark:text-gray-600 hover:text-accent dark:hover:text-accent transition-colors cursor-pointer">
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nhấp vào sao để đánh giá</p>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Họ và tên <span className="text-primary">*</span>
                    </label>
                    <input
                      id="reviewName"
                      type="text"
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-lg px-4 py-2.5 text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all"
                    />
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
                      className="w-full bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 dark:from-[#8b2332] dark:to-[#6b1a28] dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    Gửi đánh giá
                  </button>
                </div>
              </div>

              {/* Existing Reviews */}
              {[
                {
                  name: 'Nguyễn Văn A',
                  date: '15/01/2026',
                  rating: 5,
                  comment: 'Sản phẩm rất đẹp và sang trọng, đóng gói cẩn thận. Rất hài lòng với chất lượng. Sẽ tiếp tục ủng hộ shop!',
                  verified: true
                },
                {
                  name: 'Trần Thị B',
                  date: '12/01/2026',
                  rating: 5,
                  comment: 'Quà tết rất ý nghĩa, người nhận rất thích. Giao hàng nhanh, đóng gói đẹp. Giá cả hợp lý so với chất lượng.',
                  verified: true
                },
                {
                  name: 'Lê Văn C',
                  date: '10/01/2026',
                  rating: 4,
                  comment: 'Sản phẩm tốt, đẹp. Tuy nhiên giá hơi cao so với một số nơi khác. Nhưng nhìn chung vẫn đáng tiền.',
                  verified: false
                }
              ].map((review, idx) => (
                <div key={idx} className="pb-6 border-b border-gray-200 dark:border-[#3a3330]/40 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-[#8b2332]/25 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary dark:text-[#daa520]">person</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              Đã mua hàng
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
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

              <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-[#3a3330]/60 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary dark:hover:border-[#b8860b]/60 hover:text-primary dark:hover:text-white transition-colors font-medium">
                Xem thêm đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
