import React from 'react';

interface ContactCard {
  icon: string;
  title: string;
  content: string;
  subContent?: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  link?: string;
}

const contactCards: ContactCard[] = [
  {
    icon: 'storefront',
    title: 'Địa chỉ cửa hàng',
    content: 'FPT University, Quận 9, TP. Hồ Chí Minh',
    bgColor: 'bg-primary dark:bg-white/5',
    iconColor: 'text-white dark:text-gray-300',
    borderColor: 'border-primary/20 dark:border-white/10 hover:border-primary dark:hover:border-white/20'
  },
  {
    icon: 'schedule',
    title: 'Giờ mở cửa',
    content: 'Thứ 2 - Chủ Nhật: 8:00 - 22:00',
    subContent: 'Tết Nguyên Đán: 9:00 - 20:00',
    bgColor: 'bg-gold dark:bg-white/5',
    iconColor: 'text-red-800 dark:text-gray-300',
    borderColor: 'border-gold/30 dark:border-white/10 hover:border-gold dark:hover:border-white/20'
  },
  {
    icon: 'call',
    title: 'Hotline hỗ trợ',
    content: '1900 6969',
    subContent: 'Hỗ trợ 24/7 - Tư vấn miễn phí',
    bgColor: 'bg-primary dark:bg-white/5',
    iconColor: 'text-white dark:text-gray-300',
    borderColor: 'border-primary/20 dark:border-white/10 hover:border-primary dark:hover:border-white/20',
    link: 'tel:1900xxxx'
  }
];

export const StoreMap: React.FC = () => {
  return (
    <div className="border-t border-white/20 dark:border-white/10 pt-12 pb-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white dark:text-white mb-2">Vị Trí Cửa Hàng</h3>
        <p className="text-sm text-white/80 dark:text-gray-400">FPT University, Quận 9, TP. Hồ Chí Minh</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-gold/50 dark:border-white/10 shadow-2xl h-[400px] group hover:border-gold transition-colors">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4544388163936!2d106.80921857570997!3d10.84535215788081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1svi!2s!4v1705234567890!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="transition-all duration-500"
            title="FPT University Location"
          ></iframe>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xl font-bold text-white dark:text-white mb-2">Thông Tin Liên Hệ</h4>
          
          {contactCards.map((card, index) => (
            <div 
              key={index}
              className={`flex items-start gap-4 p-5 rounded-xl bg-white/95 dark:bg-white/5 border-2 ${card.borderColor} dark:hover:border-primary/30 transition-all group shadow-lg hover:shadow-xl`}
            >
              <div className={`size-12 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                <span className={`material-symbols-outlined ${card.iconColor} text-2xl`}>
                  {card.icon}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{card.title}</div>
                {card.link ? (
                  <a href={card.link} className="text-sm text-primary dark:text-gray-300 font-semibold hover:underline dark:hover:text-white">
                    {card.content}
                  </a>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-gray-400 font-medium">{card.content}</p>
                )}
                {card.subContent && (
                  <p className={`text-xs mt-1 font-medium ${card.icon === 'schedule' ? 'text-accent dark:text-gray-500' : 'text-gray-700 dark:text-gray-400'}`}>
                    {card.subContent}
                  </p>
                )}
              </div>
            </div>
          ))}

          <button className="mt-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 dark:bg-white/10 text-white font-semibold hover:from-red-600 hover:to-red-700 dark:hover:bg-white/20 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
            <span className="material-symbols-outlined text-lg">directions</span>
            Chỉ Đường Đến Cửa Hàng
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
