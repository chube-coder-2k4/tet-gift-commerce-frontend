import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatbotApi, ChatSuggestion, ChatHistoryItem, RateLimitError } from '../services/chatbotApi';
import { productApi, ProductResponse } from '../services/productApi';
import { bundleApi, BundleResponse } from '../services/bundleApi';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: ChatSuggestion[];
  isError?: boolean;        // true when success=false or [ERROR]
  retryPayload?: string;    // original user message for retry
}

interface ChatWidgetProps {
  onProductClick?: (id: number) => void;
}

const SESSION_KEY = 'chatbot_session_id';

// Simple markdown: **bold** and \n to <br>, plus product links
function renderMarkdown(
  text: string,
  suggestions?: ChatSuggestion[],
  onProductClick?: (id: number) => void
) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  const processedParts = parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const innerText = part.slice(2, -2);
      const matchedSuggestion = suggestions?.find(
        s => s.name.toLowerCase() === innerText.toLowerCase()
      );
      if (matchedSuggestion && onProductClick) {
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onProductClick(matchedSuggestion.id); }}
            className="inline-flex items-center gap-0.5 font-bold text-primary dark:text-[#daa520] hover:underline cursor-pointer transition-colors"
            title={`Xem ${matchedSuggestion.name}`}
          >
            {innerText}
            <span className="material-symbols-outlined text-[12px] align-middle">open_in_new</span>
          </button>
        );
      }
      return <strong key={i}>{innerText}</strong>;
    }

    if (suggestions && suggestions.length > 0 && onProductClick) {
      const names = suggestions.map(s => s.name).sort((a, b) => b.length - a.length);
      const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(`(${escapedNames.join('|')})`, 'gi');
      const segments = part.split(regex);
      
      return segments.map((seg, j) => {
        const matchedSug = suggestions.find(
          s => s.name.toLowerCase() === seg.toLowerCase()
        );
        if (matchedSug) {
          return (
            <button
              key={`${i}-${j}`}
              onClick={(e) => { e.stopPropagation(); onProductClick(matchedSug.id); }}
              className="inline-flex items-center gap-0.5 font-bold text-primary dark:text-[#daa520] hover:underline cursor-pointer transition-colors"
              title={`Xem ${matchedSug.name}`}
            >
              {seg}
              <span className="material-symbols-outlined text-[12px] align-middle">open_in_new</span>
            </button>
          );
        }
        return seg.split('\n').map((line, k, arr) => (
          <React.Fragment key={`${i}-${j}-${k}`}>
            {line}
            {k < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      });
    }

    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });

  return processedParts;
}

function formatPrice(price: string | number) {
  return Number(price).toLocaleString('vi-VN') + 'đ';
}

// Catalog item for local fallback matching
interface CatalogItem {
  id: number;
  type: 'PRODUCT' | 'BUNDLE';
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

function extractSuggestionsFromText(text: string, catalog: CatalogItem[]): ChatSuggestion[] {
  if (catalog.length === 0) return [];
  const found: ChatSuggestion[] = [];
  const seenIds = new Set<string>();
  const lowerText = text.toLowerCase();
  const sorted = [...catalog].sort((a, b) => b.name.length - a.name.length);
  
  for (const item of sorted) {
    const key = `${item.type}-${item.id}`;
    if (seenIds.has(key)) continue;
    if (lowerText.includes(item.name.toLowerCase())) {
      seenIds.add(key);
      found.push({
        id: item.id,
        type: item.type,
        name: item.name,
        price: item.price.toString(),
        stock: item.stock,
        imageUrl: item.imageUrl,
      });
    }
  }
  return found;
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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMsgId, setStreamingMsgId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const catalogRef = useRef<CatalogItem[]>([]);
  const catalogLoaded = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

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

  // Preload product+bundle catalog when chat opens
  useEffect(() => {
    if (isOpen && !catalogLoaded.current) {
      catalogLoaded.current = true;
      Promise.all([
        productApi.getAll({ size: 100 }).catch(() => ({ data: { data: [] } })),
        bundleApi.getAll({ size: 100 }).catch(() => ({ data: { data: [] } })),
      ]).then(([prodRes, bundleRes]) => {
        const products: CatalogItem[] = (prodRes.data?.data || []).map((p: ProductResponse) => ({
          id: p.id,
          type: 'PRODUCT' as const,
          name: p.name,
          price: p.price,
          stock: p.stock,
          imageUrl: p.primaryImage || p.image || p.images?.find(img => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || null,
        }));
        const bundles: CatalogItem[] = (bundleRes.data?.data || []).map((b: BundleResponse) => ({
          id: b.id,
          type: 'BUNDLE' as const,
          name: b.name,
          price: b.price,
          stock: 999,
          imageUrl: null,
        }));
        catalogRef.current = [...products, ...bundles];
      });
    }
  }, [isOpen]);

  // Send message with SSE streaming
  const handleSendMessage = async (retryMessage?: string) => {
    const messageText = retryMessage || inputText.trim();
    if (!messageText || isStreaming) return;

    // Clear rate limit message
    setRateLimitMsg(null);

    // Add user message (skip if retrying)
    if (!retryMessage) {
      const userMsg: Message = {
        id: Date.now(),
        sender: 'user',
        text: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
    }

    // Setup streaming state
    const botMsgId = Date.now() + 1;
    setStreamingMsgId(botMsgId);
    setStreamingText('');
    setIsStreaming(true);

    let accumulated = '';
    let suggestions: ChatSuggestion[] | undefined;

    try {
      await chatbotApi.chatStream(
        {
          message: messageText,
          sessionId: sessionId || undefined,
        },
        {
          onSession: (newSessionId: string) => {
            setSessionId(newSessionId);
            localStorage.setItem(SESSION_KEY, newSessionId);
          },
          onToken: (token: string) => {
            accumulated += token;
            setStreamingText(accumulated);
          },
          onSuggestions: (sug: ChatSuggestion[]) => {
            suggestions = sug;
          },
          onDone: () => {
            // Auto-extract suggestions from text if backend didn't provide any
            if (!suggestions || suggestions.length === 0) {
              const autoSuggestions = extractSuggestionsFromText(accumulated, catalogRef.current);
              if (autoSuggestions.length > 0) {
                suggestions = autoSuggestions;
              }
            }
          },
          onError: (errorMsg: string) => {
            accumulated = errorMsg || 'Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau.';
          },
        }
      );

      // Check if it was an error response (no accumulated text = something went wrong)
      const isError = accumulated.includes('Xin lỗi') && accumulated.includes('thử lại');

      // Finalize: add completed message
      const botMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: accumulated || 'Xin lỗi, không nhận được phản hồi từ AI.',
        timestamp: new Date(),
        suggestions,
        isError: isError || !accumulated,
        retryPayload: isError || !accumulated ? messageText : undefined,
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      let errorText = 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.';
      let showRetry = true;

      if (err instanceof RateLimitError) {
        errorText = err.message;
        setRateLimitMsg(err.message);
        showRetry = false;
      } else if (err instanceof Error) {
        errorText = err.message;
      }

      const botMsg: Message = {
        id: botMsgId,
        sender: 'bot',
        text: errorText,
        timestamp: new Date(),
        isError: showRetry,
        retryPayload: showRetry ? messageText : undefined,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsStreaming(false);
      setStreamingMsgId(null);
      setStreamingText('');
    }
  };

  const handleRetry = (retryPayload: string) => {
    // Remove the error message
    setMessages(prev => prev.filter(m => m.retryPayload !== retryPayload || !m.isError));
    handleSendMessage(retryPayload);
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
        <div className="fixed bottom-20 right-6 w-[380px] h-[580px] bg-white dark:bg-gradient-to-br dark:from-card-dark dark:to-surface-dark border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl shadow-2xl dark:shadow-[#8b2332]/20 flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-red-700 dark:from-[#8b2332] dark:to-[#6b1a28] text-white p-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI TetGifts</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className={`size-2 rounded-full ${isStreaming ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></span>
                  {isStreaming ? 'Đang trả lời...' : 'Trợ lý AI đang hoạt động'}
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

          {/* Rate Limit Warning */}
          {rateLimitMsg && (
            <div className="mx-3 mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">schedule</span>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{rateLimitMsg}</p>
              <button onClick={() => setRateLimitMsg(null)} className="shrink-0 text-amber-500 hover:text-amber-700">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-transparent">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] text-white rounded-br-sm'
                          : message.isError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded-bl-sm'
                            : 'bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-[#3a3330]/60 rounded-bl-sm shadow-sm dark:shadow-lg'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{renderMarkdown(message.text, message.suggestions, onProductClick)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Retry button for error messages */}
                      {message.isError && message.retryPayload && (
                        <button
                          onClick={() => handleRetry(message.retryPayload!)}
                          className="text-xs font-semibold text-primary dark:text-[#daa520] hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          Thử lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Product/Bundle Suggestions */}
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
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate group-hover:text-primary transition-colors">{s.name}</p>
                            {s.type === 'BUNDLE' && (
                              <span className="shrink-0 px-1.5 py-0.5 bg-accent/15 text-accent text-[9px] font-bold rounded uppercase">Combo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-primary dark:text-[#daa520]">{formatPrice(s.price)}</span>
                            <span className="text-gray-400">•</span>
                            <span className={s.stock && s.stock > 0 ? 'text-green-600 dark:text-green-400' : s.stock === null ? 'text-gray-400' : 'text-red-500'}>
                              {s.stock === null ? 'Combo' : s.stock > 0 ? `Còn ${s.stock}` : 'Hết hàng'}
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

            {/* Streaming indicator — live text appearing */}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-[75%]">
                  <div className="bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm border border-gray-200 dark:border-[#3a3330]/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm dark:shadow-lg">
                    {streamingText ? (
                      <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-200">
                        {streamingText}
                        <span className="inline-block w-1.5 h-4 bg-primary/70 dark:bg-[#daa520] ml-0.5 animate-blink align-middle rounded-sm"></span>
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-xs text-gray-400">Đang suy nghĩ...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-surface-dark/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isStreaming ? 'Đang trả lời...' : 'Hỏi AI về sản phẩm, giá cả, tồn kho...'}
                className="flex-1 bg-gray-100 dark:bg-background-dark/60 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all"
                disabled={isStreaming}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isStreaming}
                className="size-10 bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] hover:from-red-600 hover:to-red-700 dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="material-symbols-outlined">{isStreaming ? 'pending' : 'send'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              AI tư vấn dựa trên dữ liệu sản phẩm thực tế • Streaming ⚡
            </p>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 size-12 bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] hover:from-red-600 hover:to-red-700 dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(217,4,41,0.4)] dark:shadow-[#8b2332]/40 flex items-center justify-center transition-all z-50 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-2xl">close</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">chat</span>
            <span className="absolute -top-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
            <span className="absolute inset-0 rounded-full border-2 border-primary/60 dark:border-[#8b2332]/60 animate-chat-ping"></span>
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
        @keyframes chat-ping {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-chat-ping {
          animation: chat-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
