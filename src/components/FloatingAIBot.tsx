
import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingAIBotProps {
  onActivate: () => void;
}

export function FloatingAIBot({ onActivate }: FloatingAIBotProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Smooth follow with slight delay
      setMousePosition({ 
        x: e.clientX - 30, // Offset to position near cursor
        y: e.clientY - 30 
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={cn(
        "fixed z-50 pointer-events-none transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        transform: `translate(${isHovered ? '5px' : '0'}, ${isHovered ? '-5px' : '0'})`,
      }}
    >
      <Button
        onClick={onActivate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "pointer-events-auto relative w-16 h-16 rounded-full shadow-lg",
          "bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
          "border-2 border-purple-300/30 hover:border-purple-300/50",
          "transition-all duration-300 ease-out",
          "group overflow-hidden",
          isHovered ? "scale-110 shadow-xl" : "scale-100"
        )}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full animate-pulse" />
        
        {/* Sparkle animation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white animate-pulse" />
          <Sparkles className="absolute bottom-2 left-2 w-2 h-2 text-purple-200 animate-pulse delay-100" />
        </div>

        {/* Main bot icon */}
        <Bot 
          className={cn(
            "w-8 h-8 text-white transition-all duration-300",
            isHovered ? "animate-bounce" : ""
          )} 
        />

        {/* Tooltip */}
        <div className={cn(
          "absolute -top-12 left-1/2 transform -translate-x-1/2",
          "bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-1 rounded-lg",
          "whitespace-nowrap shadow-lg border border-gray-700",
          "transition-all duration-200 pointer-events-none",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          IA Insights
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      </Button>
    </div>
  );
}
