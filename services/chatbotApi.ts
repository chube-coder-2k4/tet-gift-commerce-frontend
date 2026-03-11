import { fetchWithAuth, ApiResponse } from './api';

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

// Chatbot API
export const chatbotApi = {
  chat: async (request: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    return fetchWithAuth<ChatResponse>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
