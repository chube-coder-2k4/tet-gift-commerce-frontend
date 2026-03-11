import React, { useState, useEffect, useCallback } from 'react';
import { adminBundleApi, adminProductApi, BundleResponse, BundleRequest, BundleProductRequest, ProductResponse, PageResponse } from '../../services/adminApi';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const BundleManager: React.FC = () => {
  const [bundles, setBundles] = useState<BundleResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BundleResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formIsCustom, setFormIsCustom] = useState(false);
  const [bundleProducts, setBundleProducts] = useState<BundleProductRequest[]>([{ productId: 0, quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBundleApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const data = res.data as PageResponse<BundleResponse>;
      setBundles(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải danh sách' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await adminProductApi.getAll({ page: 0, size: 200 });
      const data = res.data as PageResponse<ProductResponse>;
      setProducts(data.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchBundles(); }, [fetchBundles]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetForm = () => {
    setFormName(''); setFormPrice(0); setFormIsCustom(false);
    setBundleProducts([{ productId: 0, quantity: 1 }]);
    setEditing(null); setShowForm(false);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (b: BundleResponse) => {
    setEditing(b);
    setFormName(b.name);
    setFormPrice(b.price);
    setFormIsCustom(b.isCustom);
    setBundleProducts(b.products?.map(p => ({ productId: p.productId, quantity: p.quantity })) || [{ productId: 0, quantity: 1 }]);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) { setMsg({ type: 'error', text: 'Tên combo không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    const validProducts = bundleProducts.filter(p => p.productId > 0);
    if (validProducts.length === 0) { setMsg({ type: 'error', text: 'Thêm ít nhất 1 sản phẩm' }); setTimeout(() => setMsg(null), 3000); return; }

    setSaving(true);
    const payload: BundleRequest = { name: formName, price: formPrice, isCustom: formIsCustom, products: validProducts };
    try {
      if (editing) {
        await adminBundleApi.update(editing.id, payload);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminBundleApi.create(payload);
        setMsg({ type: 'success', text: 'Tạo combo thành công!' });
      }
      resetForm();
      fetchBundles();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa combo này?')) return;
    try {
      await adminBundleApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' });
      fetchBundles();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const updateBP = (idx: number, field: keyof BundleProductRequest, val: number) => {
    const copy = [...bundleProducts];
    copy[idx] = { ...copy[idx], [field]: val };
    setBundleProducts(copy);
  };

  const addBP = () => setBundleProducts([...bundleProducts, { productId: 0, quantity: 1 }]);
  const removeBP = (idx: number) => setBundleProducts(bundleProducts.filter((_, i) => i !== idx));

  const getProductName = (id: number) => products.find(p => p.id === id)?.name || `#${id}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý combo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} combo</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm combo
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa combo' : 'Thêm combo mới'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên combo *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá combo (VNĐ)</label>
                  <input type="number" value={formPrice} onChange={e => setFormPrice(+e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formIsCustom} onChange={e => setFormIsCustom(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Combo tùy chỉnh</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sản phẩm trong combo *</label>
                {bundleProducts.map((bp, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={bp.productId} onChange={e => updateBP(i, 'productId', +e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-gray-900 dark:text-white focus:border-primary outline-none">
                      <option value={0}>-- Chọn SP --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min={1} value={bp.quantity} onChange={e => updateBP(i, 'quantity', +e.target.value)} className="w-20 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-sm text-center text-gray-900 dark:text-white focus:border-primary outline-none" />
                    {bundleProducts.length > 1 && <button onClick={() => removeBP(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><span className="material-symbols-outlined text-lg">close</span></button>}
                  </div>
                ))}
                <button onClick={addBP} className="text-sm text-primary font-medium hover:underline">+ Thêm sản phẩm</button>
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
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tên combo</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tùy chỉnh</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : bundles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có combo</td></tr>
              ) : bundles.map(b => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">#{b.id}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white">{b.name}</td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(b.price)}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {b.products?.slice(0, 3).map((bp, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400">{getProductName(bp.productId)} x{bp.quantity}</span>
                      ))}
                      {(b.products?.length || 0) > 3 && <span className="text-xs text-gray-400">+{(b.products?.length || 0) - 3}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.isCustom ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>{b.isCustom ? 'Có' : 'Không'}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
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

export default BundleManager;
