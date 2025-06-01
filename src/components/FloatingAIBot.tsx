
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
      // Calculate relative position for the robot head to follow
      const centerX = window.innerWidth - 100; // Approximate button position
      const centerY = window.innerHeight - 100;
      
      const deltaX = (e.clientX - centerX) * 0.1; // Subtle movement
      const deltaY = (e.clientY - centerY) * 0.1;
      
      setMousePosition({ 
        x: Math.max(-8, Math.min(8, deltaX)), // Limit movement range
        y: Math.max(-8, Math.min(8, deltaY))
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <Button
        onClick={onActivate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-20 h-20 rounded-2xl shadow-lg",
          "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600",
          "hover:from-purple-600 hover:via-indigo-700 hover:to-blue-700",
          "border-2 border-purple-300/30 hover:border-purple-300/50",
          "transition-all duration-300 ease-out",
          "group overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-2xl",
          isHovered ? "scale-105 shadow-2xl rotate-3" : "scale-100 rotate-0"
        )}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl animate-pulse" />
        
        {/* Sparkle animations */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="absolute top-2 right-2 w-3 h-3 text-white animate-pulse" />
          <Sparkles className="absolute bottom-3 left-3 w-2 h-2 text-purple-200 animate-pulse delay-200" />
          <Sparkles className="absolute top-4 left-2 w-2 h-2 text-blue-200 animate-pulse delay-500" />
        </div>

        {/* Circuit pattern background */}
        <div className="absolute inset-2 opacity-10">
          <div className="w-full h-full border border-white rounded-xl">
            <div className="absolute top-1 left-1 w-2 h-2 border border-white rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border border-white rounded-full"></div>
            <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-white"></div>
            <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-white"></div>
          </div>
        </div>

        {/* Robot head that follows mouse */}
        <div 
          className="relative z-10 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`
          }}
        >
          <Bot 
            className={cn(
              "w-10 h-10 text-white drop-shadow-lg",
              isHovered ? "animate-pulse" : ""
            )} 
          />
        </div>

        {/* Tooltip */}
        <div className={cn(
          "absolute -top-12 left-1/2 transform -translate-x-1/2",
          "bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg",
          "whitespace-nowrap shadow-xl border border-gray-700",
          "transition-all duration-200 pointer-events-none",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <span className="font-medium">IA Insights</span>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90" />
        </div>

        {/* Pulsing ring animation */}
        <div className={cn(
          "absolute inset-0 rounded-2xl border-2 border-purple-400/50",
          "animate-ping opacity-20",
          isHovered ? "opacity-40" : "opacity-20"
        )} />
      </Button>
    </div>
  );
}
