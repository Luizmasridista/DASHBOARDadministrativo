
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: number;
  image: string;
  title: string;
  description: string;
}

interface ModernCarouselProps {
  items: CarouselItem[];
  autoSlideInterval?: number;
}

export const ModernCarousel = ({ items, autoSlideInterval = 5000 }: ModernCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [items.length, autoSlideInterval]);

  const slideVariants = {
    hiddenRight: {
      x: "100%",
      opacity: 0,
    },
    hiddenLeft: {
      x: "-100%",
      opacity: 0,
    },
    visible: {
      x: "0",
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5
      }
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main carousel container */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/30">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            {/* Screenshot container */}
            <div className="flex-1 relative">
              <div className="absolute inset-4">
                {/* Browser mockup header */}
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-t-xl px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 bg-slate-700/50 rounded-md px-3 py-1 text-sm text-slate-300 text-center">
                    FinanceControl - {items[currentIndex].title}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="relative flex-1 bg-slate-900/95 rounded-b-xl overflow-hidden">
                  <img 
                    src={items[currentIndex].image}
                    alt={items[currentIndex].title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {items[currentIndex].title}
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed max-w-4xl mx-auto">
                  {items[currentIndex].description}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group border border-white/20 hover:border-white/40"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group border border-white/20 hover:border-white/40"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 gap-3">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-400 scale-125'
                : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-full max-w-md mx-auto h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          key={currentIndex}
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: autoSlideInterval / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
};
