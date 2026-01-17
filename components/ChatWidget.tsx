import React, { useState } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'bot' | 'staff';
  text: string;
  timestamp: Date;
}

type ChatMode = 'staff' | 'ai';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm quà Tết?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate bot/staff response
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        sender: chatMode === 'ai' ? 'bot' : 'staff',
        text: chatMode === 'ai' 
          ? 'Cảm ơn bạn đã liên hệ! Đây là câu trả lời từ AI Chatbot. (Tính năng đang được phát triển)'
          : 'Nhân viên hỗ trợ sẽ phản hồi sớm nhất có thể. (Tính năng đang được phát triển)',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
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
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Hỗ Trợ TetGifts</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="size-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang hoạt động
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

          {/* Chat Mode Tabs */}
          <div className="flex border-b border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-darker/50">
            <button
              onClick={() => setChatMode('ai')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                chatMode === 'ai'
                  ? 'text-primary dark:text-[#daa520] border-b-2 border-primary dark:border-[#b8860b] bg-white dark:bg-surface-dark/50'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              AI Chatbot
            </button>
            <button
              onClick={() => setChatMode('staff')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                chatMode === 'staff'
                  ? 'text-primary dark:text-[#daa520] border-b-2 border-primary dark:border-[#b8860b] bg-white dark:bg-surface-dark/50'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">person</span>
              Nhân viên
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] text-white rounded-br-sm'
                        : 'bg-white dark:bg-surface-dark/80 dark:backdrop-blur-sm text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-[#3a3330]/60 rounded-bl-sm shadow-sm dark:shadow-lg'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-surface-dark/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatMode === 'ai' ? 'Hỏi AI về sản phẩm...' : 'Nhắn tin cho nhân viên...'}
                className="flex-1 bg-gray-100 dark:bg-background-dark/60 dark:backdrop-blur-sm border border-gray-300 dark:border-[#3a3330]/60 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#b8860b]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#b8860b]/20 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="size-10 bg-gradient-to-r from-primary to-red-600 dark:from-[#8b2332] dark:to-[#6b1a28] hover:from-red-600 hover:to-red-700 dark:hover:from-[#a02a3c] dark:hover:to-[#8b2332] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              Nhấn Enter để gửi • Shift + Enter để xuống dòng
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
