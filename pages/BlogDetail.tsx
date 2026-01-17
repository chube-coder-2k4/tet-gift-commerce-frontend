import React from 'react';
import { Screen } from '../types';

interface BlogDetailProps {
  onNavigate: (screen: Screen) => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 w-full bg-background-light dark:bg-background-dark relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('blog')}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Quay lại blog</span>
        </button>
        
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
          <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <a onClick={() => onNavigate('blog')} className="hover:text-primary transition-colors cursor-pointer">Tin tức</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-gray-900 dark:text-white">Ý nghĩa quà Tết</span>
        </nav>

        <header className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            Văn Hóa Việt
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-gray-900 dark:text-white mb-6 leading-tight">
            Nghệ Thuật Trao Gửi <span className="italic text-primary">Quà Tết</span> <br className="hidden md:block" /> Để Vẹn Tròn Ý Nghĩa
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white font-serif font-bold">L</div>
              <span className="font-medium text-gray-900 dark:text-white">Linh Nga</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              <span>15 Tháng 01, 2024</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>5 phút đọc</span>
            </div>
          </div>
        </header>

        <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-16 border border-gray-200 dark:border-white/5 shadow-2xl group">
          <img alt="Tet Gift Giving" className="w-full h-full object-cover object-[center_20%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwzG3a-jHOHWrvj5WTR2kaCdOHE8DjnNQ0e1iXJNVTa-eiE3EEuR64UQWqdsxJx21I-5n5FiYbKi-47cnGy1MkYdvF9XDWIBEw0CRZ8YCi3Jbw6lg2p3LkrNvAY2UWYKpHMH2cAzHSRgHouxnNlmaaGrqfBjFt3nBDb_ELG8xJFZbrjVUJXgjlOVXPjUiELEUDXGvBCRbrLezmshMuwqZwGqMxMi1EnwveutVN5qyJf4aY7eo2Hq9zv2QO3QKH8fbTD0ttbZ7nsiA" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <article className="lg:col-span-8">
            <div className="prose-custom text-gray-700 dark:text-gray-300 text-lg leading-8 space-y-8 font-light">
              <p className="text-xl md:text-2xl text-gray-900 dark:text-white font-serif leading-relaxed border-l-4 border-primary pl-6 py-1">
                Tết Nguyên Đán không chỉ là dịp để sum vầy bên gia đình mà còn là thời điểm vàng để chúng ta gửi trao những món quà ý nghĩa, thay lời chúc bình an, thịnh vượng đến người thân, bạn bè và đối tác.
              </p>
              <p>
                Truyền thống tặng quà ngày Tết đã có từ lâu đời, thấm sâu vào nếp sống của người Việt. Món quà không cần quá đắt tiền, nhưng nhất thiết phải chỉn chu và chứa đựng tâm ý của người tặng. Trong văn hóa Á Đông, màu đỏ của bao bì tượng trưng cho may mắn, màu vàng của hoa mai tượng trưng cho phú quý.
              </p>
              <h2 className="text-3xl font-serif text-gray-900 dark:text-white mt-10 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-accent">verified</span>
                Chọn Quà Sao Cho Tinh Tế?
              </h2>
              <p>
                Việc chọn quà Tết đòi hỏi sự tinh tế và thấu hiểu người nhận. Đối với ông bà, cha mẹ, những món quà mang tính sức khỏe như yến sào, nhân sâm hay các loại trà thảo mộc luôn được ưu tiên hàng đầu. Đối với đối tác doanh nghiệp, sự sang trọng và đẳng cấp lại là yếu tố then chốt.
              </p>
              <figure className="my-10 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark">
                <img alt="Fruit Basket" className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmzlhDzep4CDU4qjmW9bYVURGUaSLxk78Viia7wpPVecpAdNYJx_S2bQmgSCDYMMZIFCIuO9MXyEQWpmttwfvMrRE8ZhA0jPe8aKS3WkwNgsIkdNSTYFcJ7xWSTeBf3ogEUqua8_Ehv_RGQkxm2tVS1y32hBhVHY-piBh-t6V_e2EI_IAqbf2CvlFhOEpCwi-pggTesji1kx7VpQXlmlWXS6y6aHH1AlHl15KYyfSQI55Q23XBMUWgKvrzuXHfQxhp3jADDH8tqL4" />
                <figcaption className="p-3 text-center text-sm text-gray-500 italic bg-gray-100 dark:bg-surface-darker">
                  Một giỏ quà hoa quả tươi ngon thể hiện sự sung túc và sức sống mới.
                </figcaption>
              </figure>
              <h3 className="text-2xl font-serif text-gray-900 dark:text-white mt-8 mb-4">Xu Hướng Quà Tết 2024</h3>
              <p>
                Năm nay, xu hướng quà Tết thiên về các sản phẩm "xanh", thân thiện với môi trường và tốt cho sức khỏe. Các set quà hạt dinh dưỡng, trái cây sấy dẻo không đường hay rượu vang organic đang lên ngôi. Bên cạnh đó, bao bì hộp quà được thiết kế với chất liệu giấy mỹ thuật cao cấp, hạn chế nhựa, cũng là điểm cộng lớn.
              </p>
              <ul className="space-y-4 my-8 pl-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span><strong>Hộp quà sức khỏe:</strong> Các loại hạt, trà, mật ong.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span><strong>Rượu vang nhập khẩu:</strong> Kết hợp cùng phô mai hoặc chocolate.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span><strong>Đặc sản vùng miền:</strong> Mang hương vị quê hương độc đáo.</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm mr-2">Tags:</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">#QuaTet2024</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">#TetNguyenDan</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">#VanHoaViet</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Share:</span>
                <button className="size-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                </button>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-6 rounded-xl border border-gray-200 dark:border-white/5">
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 border-l-2 border-primary pl-3">Bài Viết Liên Quan</h3>
              <div className="flex flex-col gap-5">
                <a className="group flex gap-4 items-start cursor-pointer">
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative">
                    <img alt="Related" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlBWvaMHBQxGn_x6I2WkSTFXY3Dsh7Bt30e1EugVz_E1q-wBLHq0V8U1hpIFE769nzLvl3sX25kpU9_1oBfFHPCtSFAtx2XEYRW4p1ooNXk4mlVc5ixmeFHJbm9CBQrTl6ZPwHF7i0w-C-_7JC1QDpNuzg-MVt0SzHwLERBBNT6esHkI-Vmdvb4VlKiR1oyLL5H1InVohcGVmsKooyrvY6Nye3bKTj0xZBOeX0tj_wZL8PoQ3qRezWNLi6a8fG4rv1R3ZFUpkH8Bo" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1 block">Tin Tức</span>
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">5 Mẫu Hộp Quà Tết Độc Đáo Dành Tặng Đối Tác</h4>
                    <span className="text-xs text-gray-500 mt-2 block">12/01/2024</span>
                  </div>
                </a>
                <a className="group flex gap-4 items-start cursor-pointer">
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative">
                    <img alt="Related" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhQutXkcjc51gtDH-rrlzGLxUjXELp79G8vCslV7FcDgkX8alX0YCt5KEg1L8_8ZRbLNUJ9WJwKc5-I0HHHmn61VLvMzvmAr0VNymAaOSx2FvM9qLkfV1LsG5Bw0bc4sasC1etKuV2_aofXx4SGY6rSBr8EwZIgCWc0aVPIaZpUcgUB33a5v62oduI5ZQvyVzK41VPdWktojPLaUqDKxkY9mGcyKa3e_J39PlUDNee4TRsppwMIYrrFVG48gjjV9mn6L66larLKMU" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1 block">Xu Hướng</span>
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">Xu Hướng Giỏ Quà Tết Organic Lên Ngôi</h4>
                    <span className="text-xs text-gray-500 mt-2 block">10/01/2024</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer" onClick={() => onNavigate('shop')}>
              <img alt="Promo" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvhISll5J5hhOI-UbsktqYO1W_96_4VOC1ETq0h_D8k_OdDM9myXOS-gS7IOpVz5H1xp13hWXfx_pmmXKpnKw9gt57RjEhJUyNf01oz8DpO3ybU34wWJ3PSM-o6_okxs8UgwkVzXLQoR0u13OrJpLxV3zGmDVVxBhh63htFJ6pynHh5v3CWiKUk0hjwLBmovlGls6ieXp_nStUnrNW4RMmf1XXHdbvChFunmuO013vXfOr5Z13gLR7PyTho5TxL2bo_kRn7nZKTGc" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Ưu Đãi Đặc Biệt</p>
                <h3 className="text-2xl font-serif text-white mb-4">Giảm 15% <br /> Quà Tết Sớm</h3>
                <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-glow hover:bg-red-600 transition-colors">Mua Ngay</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
