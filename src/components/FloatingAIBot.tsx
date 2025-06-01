
import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AIChatModal } from './AIChatModal';

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
        <Button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative w-14 h-14 rounded-full shadow-lg",
            "bg-red-600 hover:bg-red-700",
            "border-2 border-red-500/30 hover:border-red-400/50",
            "transition-all duration-300 ease-out",
            "group",
            isHovered ? "scale-110 shadow-xl" : "scale-100"
          )}
        >
          <MessageSquare 
            className={cn(
              "w-6 h-6 text-white",
              isHovered ? "animate-pulse" : ""
            )} 
          />

          {/* Tooltip discreto */}
          <div className={cn(
            "absolute -top-10 left-1/2 transform -translate-x-1/2",
            "bg-gray-900/90 text-white text-xs px-2 py-1 rounded",
            "whitespace-nowrap shadow-lg",
            "transition-all duration-200 pointer-events-none",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            Assistente IA
          </div>

          {/* Indicador de atividade sutil */}
          <div className={cn(
            "absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full",
            "animate-pulse"
          )} />
        </Button>
      </div>

      <AIChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
