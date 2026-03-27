import React, { useState, useEffect } from 'react';

export interface GalleryImage {
  id?: number | string;
  url: string;
  label?: string;
}

interface ImageGallerySliderProps {
  images: GalleryImage[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  aspectRatio?: string;
  className?: string;
}

const ImageGallerySlider: React.FC<ImageGallerySliderProps> = ({
  images,
  initialIndex = 0,
  onIndexChange,
  aspectRatio = 'aspect-[4/3]',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onIndexChange?.(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    onIndexChange?.(prevIndex);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-surface-dark flex items-center justify-center border border-gray-200 dark:border-[#3a3330]/60 ${className}`}>
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">image</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Image Slider */}
      <div className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 group shadow-sm dark:shadow-md`}>
        {/* Slides */}
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="relative w-full h-full shrink-0">
              <img 
                src={img.url} 
                alt={img.label || `Image ${i + 1}`} 
                className="w-full h-full object-cover select-none"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 dark:hover:bg-black/40 z-10 shadow-lg"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 dark:hover:bg-black/40 z-10 shadow-lg"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}

        {/* Counter Overlay */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium z-10 border border-white/10">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative shrink-0 w-20 aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                i === currentIndex 
                  ? 'border-primary ring-2 ring-primary/30 scale-95 shadow-lg' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <img 
                src={img.url} 
                alt={`Thumbnail ${i + 1}`} 
                className={`w-full h-full object-cover transition-opacity ${i === currentIndex ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
              />
              {i === currentIndex && (
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ImageGallerySlider;
