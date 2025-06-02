
import React, { useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIChatSidebar } from './AIChatSidebar';

interface FloatingAIBotProps {
  onActivate?: () => void;
}

export function FloatingAIBot({ onActivate }: FloatingAIBotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            "relative w-12 h-12 rounded-full shadow-lg",
            "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
            "border border-white/20 hover:border-white/30",
            "transition-all duration-300 ease-out",
            "group flex items-center justify-center",
            isHovered ? "scale-110 shadow-xl" : "scale-100"
          )}
        >
          {/* Simple AI Icon */}
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-white/80 absolute -top-1 -right-1 animate-pulse" />
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

          {/* Subtle pulse effect */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20",
            isHovered ? "animate-ping" : ""
          )} />
        </button>
      </div>

      <AIChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
