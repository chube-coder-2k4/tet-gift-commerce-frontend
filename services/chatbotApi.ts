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
    let streamDone = false;

    try {
      while (true) {
        let readResult;
        try {
          readResult = await reader.read();
        } catch (readError) {
          // Connection closed by server after [DONE] — this is normal, not an error
          if (streamDone) break;
          throw readError; // Real error — re-throw
        }

        const { done, value } = readResult;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = '';

        // Clean up SSE parsing logic correctly
        // We know the last item in split() is an incomplete line UNLESS the original string ended with \n (then it's empty string)
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (i === lines.length - 1) {
            // Last element is either the incomplete chunk or '' if it properly ended with \n
            buffer = line;
            continue;
          }

          if (!line.startsWith('data:')) continue;
          // Get everything after "data:" — this is the raw SSE content
          const rawData = line.slice(5);

          // For special markers, we trim to match cleanly
          const trimmed = rawData.trim();

          if (!trimmed) continue;

          if (trimmed.startsWith('[SESSION]')) {
            callbacks.onSession(trimmed.slice(9).trim());
          } else if (trimmed.startsWith('[SUGGESTIONS]')) {
            try {
              const suggestions = JSON.parse(trimmed.slice(13));
              callbacks.onSuggestions(suggestions);
            } catch {
              // Invalid JSON, skip
            }
          } else if (trimmed === '[DONE]') {
            streamDone = true;
            callbacks.onDone();
          } else if (trimmed.startsWith('[ERROR]')) {
            callbacks.onError(trimmed.slice(7));
          } else {
            // Regular token — keep rawData as-is, including leading space!
            // Backend sends "data: token" where the space = word separator
            // e.g. "data: bạn" → rawData=" bạn" → concat → "Chào bạn"
            callbacks.onToken(rawData);
          }
        }

        // Stop reading after [DONE] — server will close connection next
        if (streamDone) break;
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
