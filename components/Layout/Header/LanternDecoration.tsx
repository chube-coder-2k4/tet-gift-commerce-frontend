import React from 'react';

export const LanternDecoration: React.FC = () => {
  return (
    <>
      {/* Lồng đèn Tết trái */}
      <div className="absolute left-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center' }}>
          <img src="./assets/longdentet.png" alt="Lồng đèn Tết" className="w-15 h-12 object-contain" />
        </div>
      </div>
      
      {/* Lồng đèn Tết phải */}
      <div className="absolute right-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center', animationDelay: '0.5s' }}>
          <img src="./assets/longdentet.png" alt="Lồng đèn Tết" className="w-15 h-12 object-contain" />
        </div>
      </div>
    </>
  );
};
