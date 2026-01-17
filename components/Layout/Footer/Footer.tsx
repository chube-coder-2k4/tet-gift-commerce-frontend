import React from 'react';
import { FeatureBanner } from './FeatureBanner';
import { CompanyInfo } from './CompanyInfo';
import { FooterLinks } from './FooterLinks';
import { StoreMap } from './StoreMap';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-900 dark:bg-gradient-to-b dark:from-[#0a0a0b] dark:via-surface-darker dark:to-[#0a0a0b] pt-20 pb-10 border-t-4 border-gold dark:border-white/5 transition-colors duration-300 overflow-hidden">
      {/* Decorative Background Elements - Light Mode Only */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 dark:hidden"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl dark:hidden"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl dark:hidden"></div>
      
      {/* Dark Mode Subtle Highlights */}
      <div className="hidden dark:block absolute top-0 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl"></div>
      <div className="hidden dark:block absolute bottom-0 left-1/3 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl"></div>
      
      {/* Lantern decorations - Light Mode Only */}
      <div className="absolute top-10 left-10 opacity-10 dark:hidden">
        <div className="w-16 h-20 bg-gold rounded-full"></div>
      </div>
      <div className="absolute top-20 right-20 opacity-10 dark:hidden">
        <div className="w-12 h-16 bg-accent rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <FeatureBanner />

        <StoreMap />
        
        <div className="border-t border-white/20 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/90 dark:text-gray-500">
          <p className="text-center md:text-left">
            © 2026 TetGifts. All rights reserved. Designed with passion for Vietnamese culture.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gold dark:hover:text-white transition-colors">Sitemap</a>
            <span>|</span>
            <a href="#" className="hover:text-gold dark:hover:text-white transition-colors">RSS</a>
            <span>|</span>
            <a href="#" className="hover:text-gold dark:hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
