import { fetchWithAuth, ApiResponse, tokenStorage } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.quanghuycoder.id.vn/api/v1';

// Interfaces
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatSuggestion {
  id: number;
  type: 'PRODUCT' | 'BUNDLE';
  name: string;
  price: string;
  stock: number;
  imageUrl: string | null;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  timestamp: string;
  detectedIntent: string;
  success: boolean;
  errorMessage?: string | null;
  suggestions: ChatSuggestion[];
}

export interface ChatHistoryItem {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  intent: string | null;
  createdAt: string;
}

export interface EmbeddingsSyncResponse {
  productsEmbedded: number;
  bundlesEmbedded: number;
}

// SSE Stream event callbacks
export interface StreamCallbacks {
  onSession: (sessionId: string) => void;
  onToken: (token: string) => void;
  onSuggestions: (suggestions: ChatSuggestion[]) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

// Custom error for rate limiting
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Chatbot API
export const chatbotApi = {
  // Legacy endpoint (non-streaming, backward compatible)
  chat: async (request: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    return fetchWithAuth<ChatResponse>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // New streaming endpoint (SSE)
  chatStream: async (request: ChatRequest, callbacks: StreamCallbacks): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/chatbot/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request),
    });

    // Handle rate limit
    if (response.status === 429) {
      const error = await response.json();
      throw new RateLimitError(error.message || 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ 1 phút rồi thử lại.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Lỗi kết nối đến AI' }));
      throw new Error(error.message || 'Lỗi kết nối đến AI');
    }

    if (!response.body) {
      throw new Error('Trình duyệt không hỗ trợ streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by double newlines or single newlines)
        const lines = buffer.split('\n');
        buffer = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // If it's incomplete (last item without newline), keep in buffer
          if (i === lines.length - 1 && !buffer.endsWith('\n') && line !== '') {
            buffer = line;
            continue;
          }

          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data) continue;

          if (data.startsWith('[SESSION]')) {
            callbacks.onSession(data.slice(9));
          } else if (data.startsWith('[SUGGESTIONS]')) {
            try {
              const suggestions = JSON.parse(data.slice(13));
              callbacks.onSuggestions(suggestions);
            } catch {
              // Invalid JSON, skip
            }
          } else if (data === '[DONE]') {
            callbacks.onDone();
          } else if (data.startsWith('[ERROR]')) {
            callbacks.onError(data.slice(7));
          } else {
            // Regular token
            callbacks.onToken(data);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  getHistory: async (sessionId: string): Promise<ApiResponse<ChatHistoryItem[]>> => {
    return fetchWithAuth<ChatHistoryItem[]>(`/chatbot/history/${sessionId}`);
  },

  syncEmbeddings: async (): Promise<ApiResponse<EmbeddingsSyncResponse>> => {
    return fetchWithAuth<EmbeddingsSyncResponse>('/chatbot/embeddings/sync', {
      method: 'POST',
    });
  },
};
