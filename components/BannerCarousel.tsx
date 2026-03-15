import React, { useState, useEffect, useCallback } from 'react';

export interface BannerSlide {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  onClick?: () => void;
}

interface BannerCarouselProps {
  slides: BannerSlide[];
  /** Auto-slide interval in ms, default 5000 */
  interval?: number;
  /** Height class, default h-[280px] md:h-[360px] */
  heightClass?: string;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  slides,
  interval = 5000,
  heightClass = 'h-[280px] md:h-[360px]',
}) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = slides.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-slide
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval, isHovered, total]);

  if (total === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${heightClass} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="relative w-full h-full flex-shrink-0 cursor-pointer"
            onClick={slide.onClick}
          >
            <img
              src={slide.image}
              alt={slide.title || `Banner ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Dark overlay for text */}
            {(slide.title || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            )}
            {/* Text overlay */}
            {(slide.title || slide.subtitle || slide.cta) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
                {slide.title && (
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2 drop-shadow-lg leading-tight">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-white/80 text-sm md:text-base font-light max-w-lg drop-shadow">
                    {slide.subtitle}
                  </p>
                )}
                {slide.cta && (
                  <button className="mt-4 px-6 py-2.5 bg-primary hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-primary/40">
                    {slide.cta}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next arrows (visible on hover) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-7 h-2.5 bg-white shadow-md'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 1 && !isHovered && (
        <div className="absolute top-0 left-0 right-0 h-[3px] z-20">
          <div
            className="h-full bg-primary/80 rounded-r-full"
            style={{
              animation: `banner-progress ${interval}ms linear`,
              animationIterationCount: 1,
            }}
            key={current}
          />
        </div>
      )}

      <style>{`
        @keyframes banner-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default BannerCarousel;
