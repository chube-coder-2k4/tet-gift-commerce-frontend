import React, { useState, useEffect, useCallback } from 'react';
import { adminCategoryApi, CategoryResponse, CategoryRequest } from '../../services/adminApi';

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState<CategoryRequest>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.getAll();
      setCategories(res.data as CategoryResponse[]);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải danh sách' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => { setForm({ name: '', description: '' }); setEditing(null); setShowForm(false); };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: CategoryResponse) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên danh mục không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminCategoryApi.update(editing.id, form);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminCategoryApi.create(form);
        setMsg({ type: 'success', text: 'Tạo danh mục thành công!' });
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      await adminCategoryApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý danh mục</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{categories.length} danh mục</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm danh mục
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên danh mục *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><span className="material-symbols-outlined animate-spin text-3xl text-gray-400">progress_activity</span></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Chưa có danh mục nào</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(c => (
            <div key={c.id} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><span className="material-symbols-outlined text-amber-600 dark:text-amber-400">category</span></div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{c.description || 'Không có mô tả'}</p>
              <span className="inline-block mt-3 text-xs text-gray-400">ID: {c.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
