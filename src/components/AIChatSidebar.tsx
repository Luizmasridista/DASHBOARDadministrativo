
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useSheetData } from '@/hooks/useSheetData';

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou o assistente IA da Kaizen. Como posso ajudá-lo a analisar seus dados financeiros hoje?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { analyzeData } = useAIAnalysis();
  const { data } = useSheetData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Enviando mensagem para IA:', currentInput);
      console.log('Dados disponíveis:', data);

      // Usar a análise AI real se há dados
      if (data && data.length > 0) {
        const analysis = await analyzeData(data, 'general');
        console.log('Resposta da IA recebida:', analysis);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: analysis,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Resposta padrão quando não há dados
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Entendi sua pergunta: "${currentInput}". No momento, não tenho dados financeiros para analisar. Para obter insights personalizados, conecte sua planilha do Google Sheets na seção "Conectar Planilha". Assim poderei fornecer análises detalhadas sobre suas finanças.`,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Isso pode acontecer quando não consigo me conectar ao serviço de IA. Tente novamente em alguns instantes.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-white text-left">Assistente IA Kaizen</SheetTitle>
              <p className="text-sm opacity-90 text-left">Análise Financeira Inteligente</p>
            </div>
          </div>
        </SheetHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-xs px-4 py-3 rounded-2xl shadow-sm",
                  message.sender === 'user'
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                    : "bg-white text-gray-900 border rounded-bl-md"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={cn(
                  "text-xs mt-2 opacity-70",
                  message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre os dados financeiros..."
              className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-4"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
