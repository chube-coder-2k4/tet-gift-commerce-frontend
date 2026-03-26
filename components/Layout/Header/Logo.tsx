import React from 'react';
import { Screen } from '../../../types';

interface LogoProps {
  onNavigate: (screen: Screen) => void;
}

export const Logo: React.FC<LogoProps> = ({ onNavigate }) => {
  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
      <div className="relative">
        <div className="absolute inset-0 bg-gold/50 dark:bg-primary/50 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
        <div className="relative size-10 flex items-center justify-center rounded-lg shadow-glow group-hover:scale-110 transition-transform overflow-hidden">
          <img src="/logo-mark.svg" alt="TetGifts" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="relative">
        <h2 className="text-xl font-display font-bold tracking-tight text-white">
          Tet<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-accent to-gold dark:from-primary dark:via-red-500 dark:to-accent animate-gradient">Gifts</span>
        </h2>
        {/* Chinese character decoration */}
        <div className="absolute -top-2 -right-6 text-[10px] text-gold/60 dark:text-primary/40 font-serif rotate-12 hidden xl:block">春</div>
      </div>
    </div>
  );
};
