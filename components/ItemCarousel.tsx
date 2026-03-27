import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface ItemCarouselProps {
  children: React.ReactNode;
  gap?: number;
}

export interface ItemCarouselRef {
  scrollNext: () => void;
  scrollPrev: () => void;
}

const ItemCarousel = forwardRef<ItemCarouselRef, ItemCarouselProps>(({ children, gap = 32 }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollNext: () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = scrollLeft + clientWidth * 0.8; // Scroll 80% of width
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    },
    scrollPrev: () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = scrollLeft - clientWidth * 0.8;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    },
  }));

  return (
    <div className="relative w-full overflow-hidden group">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ 
          gap: `${gap}px`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="shrink-0 w-full sm:w-[calc(50%-16px)] lg:w-[calc(25%-24px)] snap-start">
            {child}
          </div>
        ))}
      </div>
      
      {/* Hide scrollbar for Chrome, Safari and Opera */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
});

ItemCarousel.displayName = 'ItemCarousel';

export default ItemCarousel;
