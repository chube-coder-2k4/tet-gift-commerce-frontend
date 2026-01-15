import React from 'react';
import { Screen } from '../types';

interface AboutProps {
  onNavigate: (screen: Screen) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">Về Chúng Tôi</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight text-gray-900 dark:text-white mb-6">
            Truyền Tải <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent">Tinh Hoa</span><br />
            Văn Hóa Việt
          </h1>
          <p className="text-gray-600 dark:text-text-secondary text-lg max-w-3xl mx-auto leading-relaxed">
            TetGifts tự hào là đơn vị tiên phong trong việc kết hợp truyền thống và hiện đại, mang đến những món quà Tết cao cấp, thấm đậm bản sắc văn hóa Việt Nam.
          </p>
        </div>
      </div>

      {/* Tầm Nhìn & Sứ Mệnh */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Tầm Nhìn */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-8 lg:p-10 h-full shadow-sm hover:shadow-lg transition-all">
              <div className="size-14 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center mb-6 shadow-glow">
                <span className="material-symbols-outlined text-white text-2xl">visibility</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-serif text-gray-900 dark:text-white mb-4">Tầm Nhìn</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Trở thành thương hiệu quà tết hàng đầu Việt Nam, được khách hàng tin tưởng và lựa chọn trong mỗi dịp Xuân về.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Chúng tôi hướng tới mục tiêu lan tỏa giá trị văn hóa truyền thống qua từng món quà, góp phần giữ gìn và phát huy bản sắc dân tộc trong thời đại hiện đại.
              </p>
            </div>
          </div>

          {/* Sứ Mệnh */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-2xl p-8 lg:p-10 h-full shadow-sm hover:shadow-lg transition-all">
              <div className="size-14 rounded-xl bg-gradient-to-br from-accent to-yellow-600 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-black text-2xl">rocket_launch</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-serif text-gray-900 dark:text-white mb-4">Sứ Mệnh</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Mang đến những sản phẩm quà tết chất lượng cao, thiết kế tinh tế, thể hiện sự trân trọng và gửi gắm thông điệp ý nghĩa đến người thân, đối tác và khách hàng.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Đồng hành cùng doanh nghiệp và gia đình Việt trong việc tạo nên những khoảnh khắc sum vầy ấm áp, trọn vẹn hơn mỗi mùa Xuân.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Giá Trị Cốt Lõi */}
      <div className="w-full bg-gray-50 dark:bg-[#0a0a0c] border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Core Values</span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              Giá Trị <span className="italic text-gray-500 dark:text-gray-400">Cốt Lõi</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Những giá trị mà chúng tôi luôn hướng tới và cam kết thực hiện trong mọi hoạt động
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'workspace_premium',
                title: 'Chất Lượng',
                color: 'primary',
                desc: 'Cam kết 100% sản phẩm chính hãng, chất lượng cao, nguồn gốc rõ ràng và an toàn tuyệt đối.'
              },
              {
                icon: 'auto_awesome',
                title: 'Sáng Tạo',
                color: 'accent',
                desc: 'Không ngừng đổi mới trong thiết kế và lựa chọn sản phẩm, mang đến trải nghiệm độc đáo.'
              },
              {
                icon: 'favorite',
                title: 'Tận Tâm',
                color: 'primary',
                desc: 'Lắng nghe và thấu hiểu nhu cầu khách hàng, tư vấn tận tình để chọn món quà ý nghĩa nhất.'
              },
              {
                icon: 'handshake',
                title: 'Uy Tín',
                color: 'accent',
                desc: 'Xây dựng niềm tin qua từng giao dịch, minh bạch trong mọi cam kết và dịch vụ.'
              }
            ].map((value, idx) => (
              <div key={idx} className="group text-center">
                <div className={`size-16 rounded-2xl ${value.color === 'primary' ? 'bg-primary/10 dark:bg-primary/20' : 'bg-accent/10 dark:bg-accent/20'} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`material-symbols-outlined ${value.color === 'primary' ? 'text-primary' : 'text-accent'} text-3xl`}>{value.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lịch Sử Phát Triển */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Our Journey</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
            Lịch Sử <span className="italic text-gray-500 dark:text-gray-400">Phát Triển</span>
          </h2>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary hidden lg:block"></div>

          <div className="space-y-12">
            {[
              {
                year: '2019',
                title: 'Khởi Đầu Hành Trình',
                desc: 'TetGifts được thành lập với sứ mệnh mang đến những món quà Tết chất lượng, ý nghĩa cho người Việt. Cửa hàng đầu tiên ra đời tại TP.HCM.',
                position: 'left'
              },
              {
                year: '2020',
                title: 'Mở Rộng Quy Mô',
                desc: 'Phát triển hệ thống phân phối đến 5 tỉnh thành lớn, ký kết hợp tác với hơn 50 doanh nghiệp và tổ chức.',
                position: 'right'
              },
              {
                year: '2021',
                title: 'Chuyển Đổi Số',
                desc: 'Ra mắt nền tảng thương mại điện tử, tích hợp AI tư vấn quà tặng thông minh, mang đến trải nghiệm mua sắm hiện đại.',
                position: 'left'
              },
              {
                year: '2022',
                title: 'Mở Rộng Thị Trường',
                desc: 'Phủ sóng toàn quốc với 15 chi nhánh, phục vụ hơn 100,000 khách hàng cá nhân và 500+ doanh nghiệp lớn.',
                position: 'right'
              },
              {
                year: '2023',
                title: 'Giải Thưởng & Công Nhận',
                desc: 'Vinh dự nhận giải "Thương hiệu quà tết uy tín năm 2023" và chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng.',
                position: 'left'
              },
              {
                year: '2024',
                title: 'Bứt Phá & Đổi Mới',
                desc: 'Ra mắt bộ sưu tập quà Tết cao cấp "Xuân Giáp Thìn", hợp tác với nghệ nhân làng nghề truyền thống, hướng tới phát triển bền vững.',
                position: 'right'
              }
            ].map((milestone, idx) => (
              <div key={idx} className={`flex flex-col lg:flex-row gap-8 items-center ${milestone.position === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${milestone.position === 'right' ? 'lg:text-right' : ''}`}>
                  <div className={`inline-block px-4 py-1.5 rounded-full bg-primary text-white text-sm font-bold mb-3 ${milestone.position === 'right' ? 'lg:ml-auto lg:mr-0' : ''}`}>
                    {milestone.year}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{milestone.desc}</p>
                </div>
                
                <div className="relative z-10 size-4 rounded-full bg-white dark:bg-background-dark border-4 border-primary shadow-lg flex-shrink-0 hidden lg:block"></div>
                
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Khách Hàng & Đối Tác */}
      <div className="w-full bg-white dark:bg-card-dark border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Partners & Clients</span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              Khách Hàng & <span className="italic text-gray-500 dark:text-gray-400">Đối Tác</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tự hào đồng hành cùng các doanh nghiệp và tổ chức hàng đầu Việt Nam
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { number: '500+', label: 'Doanh Nghiệp', icon: 'business' },
              { number: '100K+', label: 'Khách Hàng', icon: 'people' },
              { number: '15', label: 'Chi Nhánh', icon: 'location_on' },
              { number: '99%', label: 'Hài Lòng', icon: 'sentiment_satisfied' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-white/5">
                <span className="material-symbols-outlined text-primary text-3xl mb-3 block">{stat.icon}</span>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Partner Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { 
                name: 'Viettel', 
                logo: '/assets/viettel.png'
              },
              { 
                name: 'FPT Corporation', 
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/2560px-FPT_logo_2010.svg.png'
              },
              { 
                name: 'Vinamilk', 
                logo: '/assets/Logo_Vinamilk_(2023).png'
              },
              { 
                name: 'BIDV', 
                logo: '/assets/logo-techcombank-dongphucsongphu.webp'
              }
            ].map((partner, idx) => (
              <div key={idx} className="aspect-[4/3] rounded-2xl bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-white/5 flex items-center justify-center p-8 hover:border-primary hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const colors = {
                        'Viettel': 'from-green-600 to-green-700',
                        'Vinamilk': 'from-blue-500 to-cyan-500',
                        'BIDV': 'from-blue-600 to-blue-700',
                        'FPT Corporation': 'from-orange-500 to-orange-600'
                      };
                      parent.innerHTML = `<div class="text-center w-full"><div class="size-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors[partner.name as keyof typeof colors]} flex items-center justify-center shadow-lg"><span class="text-white font-bold text-3xl">${partner.name.substring(0, 2)}</span></div><div class="text-base font-bold text-gray-900 dark:text-white">${partner.name}</div></div>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Báo Chí Nói Về Chúng Tôi */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-14">
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Media Coverage</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
            Báo Chí <span className="italic text-gray-500 dark:text-gray-400">Nói Về Chúng Tôi</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              source: 'VnExpress',
              date: '15/01/2024',
              title: 'TetGifts - Xu hướng quà Tết cao cấp mùa Xuân 2024',
              excerpt: 'Với sự kết hợp độc đáo giữa truyền thống và hiện đại, TetGifts đang dẫn đầu xu hướng quà tặng cao cấp...',
              icon: 'newspaper'
            },
            {
              source: 'Tuổi Trẻ',
              date: '10/01/2024',
              title: 'Khởi nghiệp thành công từ văn hóa quà tặng Tết',
              excerpt: 'Câu chuyện về hành trình xây dựng thương hiệu quà Tết từ đam mê với văn hóa truyền thống Việt Nam...',
              icon: 'article'
            },
            {
              source: 'Thanh Niên',
              date: '05/01/2024',
              title: 'TetGifts ứng dụng AI trong tư vấn quà tặng',
              excerpt: 'Nền tảng thương mại điện tử tích hợp trí tuệ nhân tạo giúp khách hàng chọn quà Tết phù hợp...',
              icon: 'smart_toy'
            },
            {
              source: 'Dân Trí',
              date: '28/12/2023',
              title: 'Giải pháp quà tặng doanh nghiệp đầu năm 2024',
              excerpt: 'TetGifts cung cấp giải pháp toàn diện cho doanh nghiệp với hơn 500 mẫu quà được thiết kế riêng...',
              icon: 'card_giftcard'
            },
            {
              source: 'Nhịp Sống Kinh Tế',
              date: '20/12/2023',
              title: 'Thị trường quà Tết 2024: Cơ hội và thách thức',
              excerpt: 'Phân tích chi tiết về thị trường quà tết cao cấp với sự góp mặt của các thương hiệu uy tín như TetGifts...',
              icon: 'trending_up'
            },
            {
              source: 'Sài Gòn Tiếp Thị',
              date: '15/12/2023',
              title: 'Chiến lược Marketing độc đáo của TetGifts',
              excerpt: 'Cách TetGifts xây dựng thương hiệu và chiếm lĩnh thị trường quà tặng cao cấp trong 5 năm...',
              icon: 'campaign'
            }
          ].map((article, idx) => (
            <div key={idx} className="group bg-white dark:bg-card-dark border border-gray-200 dark:border-white/5 rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">{article.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-primary mb-1">{article.source}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{article.date}</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                <a className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Đọc thêm
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-t border-gray-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
            Hãy Để Chúng Tôi Đồng Hành <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Cùng Bạn Mùa Tết Này</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Liên hệ ngay với chúng tôi để được tư vấn và lựa chọn những món quà Tết ý nghĩa nhất
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => onNavigate('shop')}
              className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(217,4,41,0.5)]"
            >
              Khám Phá Sản Phẩm
            </button>
            <button className="px-8 py-3.5 rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2 group">
              Liên Hệ Ngay
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
