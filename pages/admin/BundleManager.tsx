import React, { useState, useEffect, useCallback } from 'react';
import { adminBundleApi, adminProductApi, BundleResponse, BundleRequest, BundleProductRequest, ProductResponse, PageResponse } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

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
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formIsCustom, setFormIsCustom] = useState(false);
  const [bundleProducts, setBundleProducts] = useState<BundleProductRequest[]>([{ productId: 0, quantity: 1 }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    setFormName(''); setFormDescription(''); setFormPrice(0); setFormIsCustom(false);
    setBundleProducts([{ productId: 0, quantity: 1 }]);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEditing(null); setShowForm(false);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (b: BundleResponse) => {
    setEditing(b);
    setFormName(b.name);
    setFormDescription(b.description || '');
    setFormPrice(b.price);
    setFormIsCustom(b.isCustom);
    setBundleProducts(b.products?.map(p => ({ productId: p.productId, quantity: p.quantity })) || [{ productId: 0, quantity: 1 }]);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) { setMsg({ type: 'error', text: 'Tên combo không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    const validProducts = bundleProducts.filter(p => p.productId > 0);
    if (validProducts.length === 0) { setMsg({ type: 'error', text: 'Thêm ít nhất 1 sản phẩm' }); setTimeout(() => setMsg(null), 3000); return; }

    setSaving(true);
    const payload: BundleRequest = { name: formName, description: formDescription || undefined, price: formPrice, isCustom: formIsCustom, products: validProducts };
    try {
      if (editing) {
        if (imageFile) {
          await adminBundleApi.updateWithImage(editing.id, payload, imageFile);
        } else {
          await adminBundleApi.update(editing.id, payload);
        }
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        if (imageFile) {
          await adminBundleApi.createWithImage(payload, imageFile);
        } else {
          await adminBundleApi.create(payload);
        }
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

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa combo',
      message: 'Bạn có chắc chắn muốn xóa combo này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
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

  const getProductName = (id: number) => products.find(p => p.id === id)?.name || `Sản phẩm`;

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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh combo</label>
                {imagePreview || (editing?.image) ? (
                  <div className="relative group">
                    <img src={imagePreview || editing?.image} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-white/10" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-white/90 text-blue-600 rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">swap_horiz</span>Đổi ảnh
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                      {imageFile && (
                        <button onClick={removeSelectedFile} className="px-3 py-1.5 bg-white/90 text-red-600 rounded-lg text-sm font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">close</span>Xóa
                        </button>
                      )}
                    </div>
                    {imageFile && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                        <span className="truncate">{imageFile.name}</span>
                        <span>({((imageFile.size) / 1024).toFixed(0)} KB)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">Chọn ảnh combo</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP — Tối đa 10MB</span>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                )}
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
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Combo</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tùy chỉnh</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : bundles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Không có combo</td></tr>
              ) : bundles.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {b.image ? (
                        <img src={b.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">inventory_2</span></div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.name}</p>
                        {b.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{b.description}</p>}
                      </div>
                    </div>
                  </td>
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="px-5 py-3 border-t border-gray-200 dark:border-white/5" />
        )}
      </div>
    </div>
  );
};

export default BundleManager;
