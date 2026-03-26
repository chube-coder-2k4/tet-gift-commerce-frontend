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

    // Convert response to blob and force browser download without opening cross-origin frames.
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition') || '';
    const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const fileName = decodeURIComponent(filenameMatch?.[1] || filenameMatch?.[2] || `invoice-${orderId}.pdf`);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Clean up object URL shortly after click
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
