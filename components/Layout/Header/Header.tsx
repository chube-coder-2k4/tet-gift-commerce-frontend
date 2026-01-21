import React, { useState, useEffect } from 'react';
import { Screen, User } from '../../../types';
import { Logo } from './Logo';
import { LanternDecoration } from './LanternDecoration';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { HeaderActions } from './HeaderActions';
import { MobileMenu } from './MobileMenu';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentScreen, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 dark:border-white/5 bg-gradient-to-br from-red-800 via-red-700 to-red-900 dark:glass-panel dark:bg-none transition-colors duration-300 relative shadow-xl">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-peach/20 to-red-900/30 dark:from-primary/5 dark:via-accent/5 dark:to-primary/5 pointer-events-none overflow-hidden"></div>
      <div className="absolute top-0 left-0 w-40 h-40 bg-gold/30 dark:bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/40 dark:bg-accent/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
      
      <LanternDecoration />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between relative z-10">
        <Logo onNavigate={onNavigate} />
        
        <Navigation onNavigate={onNavigate} currentScreen={currentScreen} />

        <div className="flex items-center gap-4">
          <AnimatedThemeToggler className="text-white/80 hover:text-white hover:bg-white/10 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5" />
          <HeaderActions onNavigate={onNavigate} user={user} onLogout={onLogout} />
          <MobileMenu 
            isOpen={isMenuOpen} 
            onToggle={() => setIsMenuOpen(!isMenuOpen)} 
            onNavigate={onNavigate} 
          />
        </div>
      </div>
    </header>
  );
};
