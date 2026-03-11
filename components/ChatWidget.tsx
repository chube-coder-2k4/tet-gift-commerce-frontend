import React, { useState, useRef, useEffect } from 'react';
import { chatbotApi, ChatSuggestion, ChatHistoryItem } from '../services/chatbotApi';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: ChatSuggestion[];
}

interface ChatWidgetProps {
  onProductClick?: (id: number) => void;
}

const SESSION_KEY = 'chatbot_session_id';

// Simple markdown: **bold** and \n to <br>
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

function formatPrice(price: string) {
  return Number(price).toLocaleString('vi-VN') + 'đ';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onProductClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý AI của TetGifts. Tôi có thể giúp bạn tìm quà Tết, kiểm tra tồn kho, hoặc tư vấn sản phẩm phù hợp. Hãy hỏi tôi bất cứ điều gì!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when opening widget with existing session
  useEffect(() => {
    if (isOpen && sessionId && !historyLoaded) {
      setHistoryLoaded(true);
      chatbotApi.getHistory(sessionId).then(res => {
        if (res.data && res.data.length > 0) {
          const historyMessages: Message[] = res.data.map((item: ChatHistoryItem, idx: number) => ({
            id: idx + 1,
            sender: item.role === 'USER' ? 'user' as const : 'bot' as const,
            text: item.content,
            timestamp: new Date(item.createdAt),
          }));
          setMessages(historyMessages);
        }
      }).catch(() => {
        // History load failed, keep default welcome message
      });
    }
  }, [isOpen, sessionId, historyLoaded]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const res = await chatbotApi.chat({
        message: messageText,
        sessionId: sessionId || undefined,
      });

      if (res.data) {
        // Store sessionId
        if (res.data.sessionId && res.data.sessionId !== sessionId) {
          setSessionId(res.data.sessionId);
          localStorage.setItem(SESSION_KEY, res.data.sessionId);
        }

        const botMsg: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.data.message,
          timestamp: new Date(res.data.timestamp),
          suggestions: res.data.suggestions?.length > 0 ? res.data.suggestions : undefined,
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date(),
      }]);
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
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[580px] bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border-2 border-gray-200 dark:border-[#3a3330]/60 rounded-2xl shadow-2xl dark:shadow-[#8b2332]/20 flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-red-700 dark:from-[#8b2332] dark:to-[#6b1a28] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI TetGifts</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                  Trợ lý AI đang hoạt động
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="size-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-transparent">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] text-white rounded-br-sm'
                          : 'bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-[#3a3330]/60 rounded-bl-sm shadow-sm dark:shadow-lg'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{renderMarkdown(message.text)}</p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {/* Product Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 space-y-2 ml-2">
                    {message.suggestions.map((s) => (
                      <button
                        key={`${s.type}-${s.id}`}
                        onClick={() => onProductClick?.(s.id)}
                        className="w-full flex items-center gap-3 p-2.5 bg-white dark:bg-surface-dark/60 border border-gray-200 dark:border-[#3a3330]/60 rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-left group"
                      >
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt={s.name} className="size-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="size-12 rounded-lg bg-gray-100 dark:bg-surface-darker/60 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-gray-400 text-xl">
                              {s.type === 'BUNDLE' ? 'redeem' : 'inventory_2'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate group-hover:text-primary transition-colors">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-primary dark:text-[#daa520]">{formatPrice(s.price)}</span>
                            <span className="text-gray-400">•</span>
                            <span className={s.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                              {s.stock > 0 ? `Còn ${s.stock}` : 'Hết hàng'}
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-lg transition-colors">chevron_right</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-surface-dark/80 border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-surface-dark/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi AI về sản phẩm, giá cả, tồn kho..."
                className="flex-1 bg-gray-100 dark:bg-background-dark/60 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="size-10 bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] hover:from-red-600 hover:to-red-700 dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              AI tư vấn dựa trên dữ liệu sản phẩm thực tế
            </p>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 size-16 bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] hover:from-red-600 hover:to-red-700 dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(217,4,41,0.4)] dark:shadow-[#8b2332]/40 flex items-center justify-center transition-all z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-3xl">close</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">chat</span>
            <span className="absolute -top-1 -right-1 size-4 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full animate-pulse"></span>
          </>
        )}
      </button>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
