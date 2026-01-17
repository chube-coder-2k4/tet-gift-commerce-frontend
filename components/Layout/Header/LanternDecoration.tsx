import React from 'react';

export const LanternDecoration: React.FC = () => {
  return (
    <>
      {/* Left Lantern */}
      <div className="absolute left-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center' }}>
          <div className="w-6 h-8 bg-gradient-to-b from-primary to-red-700 rounded-lg shadow-lg border-2 border-accent/30 relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-accent rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-accent/80 rounded-b-lg"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
          </div>
        </div>
      </div>
      
      {/* Right Lantern */}
      <div className="absolute right-8 top-1 hidden lg:block pointer-events-none">
        <div className="relative animate-swing" style={{ transformOrigin: 'top center', animationDelay: '0.5s' }}>
          <div className="w-6 h-8 bg-gradient-to-b from-accent to-yellow-600 rounded-lg shadow-lg border-2 border-primary/30 relative">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-primary rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-primary/80 rounded-b-lg"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
          </div>
        </div>
      </div>
    </>
  );
};
