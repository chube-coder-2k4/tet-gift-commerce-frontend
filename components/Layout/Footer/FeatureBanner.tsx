import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: 'local_shipping',
    title: 'Giao hàng nhanh',
    description: 'Nội thành 2-4h',
    bgColor: 'bg-white/95 dark:bg-white/5',
    iconColor: 'text-primary dark:text-white'
  },
  {
    icon: 'verified_user',
    title: 'Chính hãng 100%',
    description: 'Cam kết hàng thật',
    bgColor: 'bg-gold dark:bg-white/5',
    iconColor: 'text-red-700 dark:text-white'
  },
  {
    icon: 'currency_exchange',
    title: 'Đổi trả dễ dàng',
    description: 'Trong vòng 7 ngày',
    bgColor: 'bg-white/95 dark:bg-white/5',
    iconColor: 'text-primary dark:text-white'
  },
  {
    icon: 'support_agent',
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn nhiệt tình',
    bgColor: 'bg-gold dark:bg-white/5',
    iconColor: 'text-red-700 dark:text-white'
  }
];

export const FeatureBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-0 pb-12 border-b border-white/20 dark:border-white/10">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3 group">
          <div className={`size-12 rounded-xl ${feature.bgColor} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
            <span className={`material-symbols-outlined ${feature.iconColor} text-2xl`}>
              {feature.icon}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white dark:text-white mb-1">{feature.title}</h4>
            <p className="text-xs text-white/80 dark:text-gray-400">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
