
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIChatSidebar } from './AIChatSidebar';

interface FloatingAIBotProps {
  onActivate?: () => void;
}

export function FloatingAIBot({ onActivate }: FloatingAIBotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bot = document.querySelector('.ai-bot-icon');
      if (!bot) return;

      const rect = bot.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - botCenterY, e.clientX - botCenterX);
      const distance = Math.min(8, Math.sqrt(Math.pow(e.clientX - botCenterX, 2) + Math.pow(e.clientY - botCenterY, 2)) / 20);
      
      const eyeX = 50 + Math.cos(angle) * distance;
      const eyeY = 50 + Math.sin(angle) * distance;

      setEyePosition({ x: eyeX, y: eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    setIsChatOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "ai-bot-icon relative w-16 h-16 rounded-full shadow-lg",
            "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            "border-2 border-white/20 hover:border-white/30",
            "transition-all duration-300 ease-out",
            "group overflow-hidden",
            isHovered ? "scale-110 shadow-xl" : "scale-100"
          )}
        >
          {/* Robot Face */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Robot Head */}
            <div className="relative w-10 h-10 bg-white/90 rounded-lg">
              {/* Eyes */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-gray-800 rounded-full transition-all duration-150">
                <div 
                  className="w-1 h-1 bg-blue-400 rounded-full transition-all duration-150"
                  style={{
                    transform: `translate(${(eyePosition.x - 50) * 0.02}px, ${(eyePosition.y - 50) * 0.02}px)`
                  }}
                />
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-gray-800 rounded-full transition-all duration-150">
                <div 
                  className="w-1 h-1 bg-blue-400 rounded-full transition-all duration-150"
                  style={{
                    transform: `translate(${(eyePosition.x - 50) * 0.02}px, ${(eyePosition.y - 50) * 0.02}px)`
                  }}
                />
              </div>
              
              {/* Mouth */}
              <div className={cn(
                "absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-1 rounded-full transition-all duration-300",
                isHovered ? "bg-green-500" : "bg-gray-600"
              )} />
              
              {/* Antenna */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-gray-600 rounded-full" />
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Tooltip */}
          <div className={cn(
            "absolute -top-12 left-1/2 transform -translate-x-1/2",
            "bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg",
            "whitespace-nowrap shadow-lg pointer-events-none",
            "transition-all duration-200",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            Assistente IA
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900/90" />
          </div>

          {/* Floating particles */}
          <div className={cn(
            "absolute inset-0 rounded-full",
            isHovered ? "animate-pulse" : ""
          )}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-1 h-1 bg-white/40 rounded-full",
                  isHovered ? "animate-bounce" : "opacity-0"
                )}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </button>
      </div>

      <AIChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
