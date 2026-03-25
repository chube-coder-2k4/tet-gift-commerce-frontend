import { fetchWithAuth, ApiResponse, tokenStorage } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.quanghuycoder.id.vn/api/v1';

// Types
export interface InvoiceResponse {
  id: number;
  orderId: number;
  invoiceNumber: string;
  vatCompanyName?: string;
  vatTaxCode?: string;
  vatPhone?: string;
  vatAddress?: string;
  pdfUrl: string;
  subtotal: number;
  tierDiscountPercent?: number;
  tierDiscountAmount?: number;
  discountCode?: string;
  discountAmount?: number;
  totalAmount: number;
  createdAt: string;
}

// Invoice API (auth required)
export const invoiceApi = {
  // POST /invoices/generate/{orderId} — Generate invoice (idempotent)
  generate: async (orderId: number): Promise<ApiResponse<InvoiceResponse>> => {
    return fetchWithAuth<InvoiceResponse>(`/invoices/generate/${orderId}`, {
      method: 'POST',
    });
  },

  // GET /invoices/order/{orderId} — Get invoice info
  getByOrderId: async (orderId: number): Promise<ApiResponse<InvoiceResponse>> => {
    return fetchWithAuth<InvoiceResponse>(`/invoices/order/${orderId}`);
  },

  // Download PDF directly — opens in new tab with auth
  downloadPdf: async (orderId: number): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/invoices/download/${orderId}`, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Không thể tải hóa đơn');
    }

    // Convert response to blob and open in new tab
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  },

  // Get the direct PDF URL (for opening in Cloudinary)
  getPdfUrl: async (orderId: number): Promise<string | null> => {
    try {
      const res = await fetchWithAuth<InvoiceResponse>(`/invoices/order/${orderId}`);
      return res.data?.pdfUrl || null;
    } catch {
      return null;
    }
  },
};
