import React, { useState, useEffect, useRef } from 'react';
import { settingApi, SiteSetting } from '../../services/settingApi';
import { uploadApi } from '../../services/uploadApi';

const SettingManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specific state for music
  const [musicUrl, setMusicUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await settingApi.getAll();
        const data = res.data || [];
        setSettings(data);
        
        // Find specific settings
        const mUrl = data.find(s => s.settingKey === 'SYSTEM_MUSIC_URL')?.settingValue || '';
        setMusicUrl(mUrl);
      } catch (err: any) {
        console.error('Failed to fetch settings:', err);
        setMsg({ type: 'error', text: 'Không thể tải cài đặt hệ thống.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await settingApi.updateSetting(key, value);
      setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      
      // Dispatch custom event to notify MusicPlayer
      if (key === 'SYSTEM_MUSIC_URL') {
        window.dispatchEvent(new CustomEvent('system-music-updated'));
      }
      
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Cập nhật thất bại.' });
    } finally {
      setSavingKey(null);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.mp3')) {
      setMsg({ type: 'error', text: 'Chỉ chấp nhận file định dạng .mp3' });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadApi.uploadMusic(file);
      const url = res.data;
      setMusicUrl(url);
      // Auto save after upload
      await handleUpdateSetting('SYSTEM_MUSIC_URL', url);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Upload nhạc thất bại.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cài đặt hệ thống</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Cấu hình các tham số hiển thị và tính năng chung của website.</p>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          msg.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Music Config Section */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">music_note</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nhạc nền Tết</h3>
                <p className="text-xs text-gray-500">Quản lý bài hát phát tự động trên toàn trang web</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">URL bài hát (.mp3)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="https://example.com/song.mp3"
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <button 
                    onClick={() => handleUpdateSetting('SYSTEM_MUSIC_URL', musicUrl)}
                    disabled={savingKey === 'SYSTEM_MUSIC_URL'}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'SYSTEM_MUSIC_URL' ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">save</span>}
                    Lưu
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-gray-100 dark:border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Tải lên file nhạc mới</h4>
                    <p className="text-xs text-gray-500">Hệ thống hỗ trợ file .mp3 tối đa 10MB. Sẽ tự động ghi đè URL hiện tại.</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleMusicUpload}
                    accept="audio/mpeg"
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="shrink-0 flex items-center gap-2 px-6 py-3 bg-surface-light dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    {uploading ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : <span className="material-symbols-outlined text-lg">upload</span>}
                    {uploading ? 'Đang tải lên...' : 'Chọn file mp3'}
                  </button>
                </div>
              </div>

              {musicUrl && (
                <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-xl">audiotrack</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <audio src={musicUrl} controls className="w-full h-8" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings could go here (e.g. Site Name, Banner text, etc.) */}
          <div className="bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-white/5 p-6 opacity-50 grayscale select-none">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined text-2xl">settings</span>
              </div>
              <h3 className="font-bold text-gray-400">Cấu hình khác (Sắp ra mắt)</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingManager;
