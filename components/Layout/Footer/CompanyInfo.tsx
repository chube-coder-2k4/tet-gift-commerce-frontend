import React from 'react';

export const CompanyInfo: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="size-10 flex items-center justify-center bg-gold dark:bg-white/10 rounded-xl text-red-800 dark:text-white shadow-lg">
          <span className="material-symbols-outlined text-xl">redeem</span>
        </div>
        <h2 className="text-white dark:text-white text-2xl font-display font-bold">
          Tet<span className="text-gold dark:text-gray-400">Gifts</span>
        </h2>
      </div>
      
      <p className="text-white/90 dark:text-gray-400 text-sm leading-relaxed font-light">
        Chuyên cung cấp quà tết cao cấp, giỏ quà tết, hộp quà tết ý nghĩa cho doanh nghiệp và gia đình. Sản phẩm chất lượng, giao hàng toàn quốc.
      </p>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="material-symbols-outlined text-gold dark:text-gray-400 text-xl">location_on</span>
          <span className="text-white/80 dark:text-gray-400">FPT University, Quận 9, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="material-symbols-outlined text-gold dark:text-gray-400 text-xl">call</span>
          <a href="tel:1900xxxx" className="text-white/80 dark:text-gray-400 hover:text-gold dark:hover:text-white transition-colors">
            1900 6969 (8h-22h)
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="material-symbols-outlined text-gold dark:text-gray-400 text-xl">mail</span>
          <a href="mailto:info@tetgifts.vn" className="text-white/80 dark:text-gray-400 hover:text-gold dark:hover:text-white transition-colors">
            info@tetgifts.vn
          </a>
        </div>
      </div>
    </div>
  );
};
