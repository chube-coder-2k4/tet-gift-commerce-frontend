import React, { useState, useEffect, useCallback } from 'react';
import { adminProductApi, adminCategoryApi, ProductResponse, ProductRequest, CategoryResponse, PageResponse } from '../../services/adminApi';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductRequest>({ name: '', description: '', price: 0, stock: 0, categoryId: 0 });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminProductApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const data = res.data as PageResponse<ProductResponse>;
      setProducts(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải sản phẩm' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminCategoryApi.getAll();
      setCategories(res.data as CategoryResponse[]);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, stock: 0, categoryId: categories[0]?.id || 0 });
    setImageUrls(['']);
    setEditing(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setForm(f => ({ ...f, categoryId: categories[0]?.id || 0 }));
    setShowForm(true);
  };

  const openEdit = (p: ProductResponse) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      manufactureDate: p.manufactureDate || undefined,
      expDate: p.expDate || undefined,
    });
    setImageUrls(p.images?.map(i => i.imageUrl) || ['']);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên sản phẩm không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    if (form.price <= 0) { setMsg({ type: 'error', text: 'Giá phải lớn hơn 0' }); setTimeout(() => setMsg(null), 3000); return; }
    if (!form.categoryId) { setMsg({ type: 'error', text: 'Chọn danh mục' }); setTimeout(() => setMsg(null), 3000); return; }

    setSaving(true);
    const images = imageUrls.filter(u => u.trim()).map(u => ({ imageUrl: u }));
    const payload: ProductRequest = { ...form, images: images.length > 0 ? images : undefined };

    try {
      if (editing) {
        await adminProductApi.update(editing.id, payload);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminProductApi.create(payload);
        setMsg({ type: 'success', text: 'Tạo sản phẩm thành công!' });
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await adminProductApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' });
      fetchProducts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const updateImageUrl = (idx: number, val: string) => {
    const copy = [...imageUrls];
    copy[idx] = val;
    setImageUrls(copy);
  };

  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const removeImageUrl = (idx: number) => setImageUrls(imageUrls.filter((_, i) => i !== idx));

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} sản phẩm</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm sản phẩm
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tồn kho *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value={0}>-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sản xuất</label>
                  <input type="date" value={form.manufactureDate || ''} onChange={e => setForm({ ...form, manufactureDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn</label>
                  <input type="date" value={form.expDate || ''} onChange={e => setForm({ ...form, expDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hình ảnh (URL)</label>
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={url} onChange={e => updateImageUrl(i, e.target.value)} placeholder="https://..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                    {imageUrls.length > 1 && <button onClick={() => removeImageUrl(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><span className="material-symbols-outlined text-lg">close</span></button>}
                  </div>
                ))}
                <button onClick={addImageUrl} className="text-sm text-primary font-medium hover:underline">+ Thêm ảnh</button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tồn kho</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">ID: {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{getCategoryName(p.categoryId)}</span></td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3 text-right"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{p.stock}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-white/5">
            <span className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5">← Trước</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
