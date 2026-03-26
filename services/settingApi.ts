import { fetchWithAuth, ApiResponse } from './api';

export interface SiteSetting {
  id?: number;
  settingKey: string;
  settingValue: string;
  description?: string;
}

export const settingApi = {
  // Get all settings
  getAll: async (): Promise<ApiResponse<SiteSetting[]>> =>
    fetchWithAuth<SiteSetting[]>('/settings'),

  // Get by key
  getByKey: async (key: string): Promise<ApiResponse<SiteSetting>> =>
    fetchWithAuth<SiteSetting>(`/settings/${key}`),

  // Update or Create by key
  updateSetting: async (key: string, value: string): Promise<ApiResponse<SiteSetting>> =>
    fetchWithAuth<SiteSetting>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ settingKey: key, settingValue: value })
    }),
};
