'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <Download className="w-6 h-6" />
      </button>

      {/* Navigation - Previous */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Navigation - Next */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-green-500 scale-110'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

