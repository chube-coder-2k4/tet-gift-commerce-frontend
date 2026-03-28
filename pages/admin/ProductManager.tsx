// // import React, { useState, useEffect, useCallback } from 'react';
// // import { adminProductApi, adminCategoryApi, ProductResponse, ProductRequest, CategoryResponse, PageResponse } from '../../services/adminApi';
// // import { useConfirmDialog } from '../../components/ConfirmDialog';
// // import Pagination from '../../components/Pagination';
// //
// // const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
// //
// // const ProductManager: React.FC = () => {
// //   const [products, setProducts] = useState<ProductResponse[]>([]);
// //   const [categories, setCategories] = useState<CategoryResponse[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [page, setPage] = useState(0);
// //   const [totalPages, setTotalPages] = useState(0);
// //   const [totalItems, setTotalItems] = useState(0);
// //   const [showForm, setShowForm] = useState(false);
// //   const [editing, setEditing] = useState<ProductResponse | null>(null);
// //   const [form, setForm] = useState<ProductRequest>({ name: '', description: '', price: 0, stock: 0, categoryId: 0 });
// //   const [imageFiles, setImageFiles] = useState<File[]>([]);
// //   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
// //   const [saving, setSaving] = useState(false);
// //   const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
// //
// //   const fetchProducts = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await adminProductApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
// //       const data = res.data as PageResponse<ProductResponse>;
// //       setProducts(data.data || []);
// //       setTotalPages(data.totalPages);
// //       setTotalItems(data.totalItems);
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Lỗi tải sản phẩm' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [page]);
// //
// //   const fetchCategories = useCallback(async () => {
// //     try {
// //       const res = await adminCategoryApi.getAll();
// //       setCategories(res.data as CategoryResponse[]);
// //     } catch {}
// //   }, []);
// //
// //   useEffect(() => { fetchProducts(); }, [fetchProducts]);
// //   useEffect(() => { fetchCategories(); }, [fetchCategories]);
// //
// //   const resetForm = () => {
// //     setForm({ name: '', description: '', price: 0, stock: 0, categoryId: categories[0]?.id || 0 });
// //     // Cleanup preview URLs
// //     imagePreviews.forEach(url => URL.revokeObjectURL(url));
// //     setImageFiles([]);
// //     setImagePreviews([]);
// //     setEditing(null);
// //     setShowForm(false);
// //   };
// //
// //   const openCreate = () => {
// //     resetForm();
// //     setForm(f => ({ ...f, categoryId: categories[0]?.id || 0 }));
// //     setShowForm(true);
// //   };
// //
// //   const openEdit = (p: ProductResponse) => {
// //     setEditing(p);
// //     setForm({
// //       name: p.name,
// //       description: p.description || '',
// //       price: p.price,
// //       stock: p.stock,
// //       categoryId: p.categoryId,
// //       manufactureDate: p.manufactureDate || undefined,
// //       expDate: p.expDate || undefined,
// //     });
// //     // Cleanup old previews
// //     imagePreviews.forEach(url => URL.revokeObjectURL(url));
// //     setImageFiles([]);
// //     setImagePreviews([]);
// //     setShowForm(true);
// //   };
// //
// //   const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const fileList = e.target.files;
// //     if (!fileList || fileList.length === 0) return;
// //     const files: File[] = Array.from(fileList);
// //     const newPreviews = files.map(file => URL.createObjectURL(file));
// //     setImageFiles(prev => [...prev, ...files]);
// //     setImagePreviews(prev => [...prev, ...newPreviews]);
// //     // Reset input so same files can be re-selected
// //     e.target.value = '';
// //   };
// //
// //   const removeFile = (idx: number) => {
// //     URL.revokeObjectURL(imagePreviews[idx]);
// //     setImageFiles(prev => prev.filter((_, i) => i !== idx));
// //     setImagePreviews(prev => prev.filter((_, i) => i !== idx));
// //   };
// //
// //   const handleSubmit = async () => {
// //     if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên sản phẩm không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
// //     if (form.price <= 0) { setMsg({ type: 'error', text: 'Giá phải lớn hơn 0' }); setTimeout(() => setMsg(null), 3000); return; }
// //     if (!form.categoryId) { setMsg({ type: 'error', text: 'Chọn danh mục' }); setTimeout(() => setMsg(null), 3000); return; }
// //
// //     setSaving(true);
// //     const payload: ProductRequest = { ...form };
// //
// //     try {
// //       if (editing) {
// //         // Has files → multipart; no files → JSON
// //         if (imageFiles.length > 0) {
// //           await adminProductApi.updateWithImages(editing.id, payload, imageFiles);
// //         } else {
// //           await adminProductApi.update(editing.id, payload);
// //         }
// //         setMsg({ type: 'success', text: 'Cập nhật thành công!' });
// //       } else {
// //         if (imageFiles.length > 0) {
// //           await adminProductApi.createWithImages(payload, imageFiles);
// //         } else {
// //           await adminProductApi.create(payload);
// //         }
// //         setMsg({ type: 'success', text: 'Tạo sản phẩm thành công!' });
// //       }
// //       resetForm();
// //       fetchProducts();
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Lỗi' });
// //     } finally {
// //       setSaving(false);
// //     }
// //     setTimeout(() => setMsg(null), 3000);
// //   };
// //
// //   const { confirm } = useConfirmDialog();
// //
// //   const handleDelete = async (id: number) => {
// //     const ok = await confirm({
// //       title: 'Xóa sản phẩm',
// //       message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
// //       confirmText: 'Xóa',
// //       variant: 'danger',
// //     });
// //     if (!ok) return;
// //     try {
// //       await adminProductApi.delete(id);
// //       setMsg({ type: 'success', text: 'Đã xóa!' });
// //       fetchProducts();
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
// //     }
// //     setTimeout(() => setMsg(null), 3000);
// //   };
// //
// //   const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
// //
// //   return (
// //     <div>
// //       <div className="flex items-center justify-between mb-6">
// //         <div>
// //           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h2>
// //           <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} sản phẩm</p>
// //         </div>
// //         <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
// //           <span className="material-symbols-outlined text-lg">add</span>Thêm sản phẩm
// //         </button>
// //       </div>
// //
// //       {msg && (
// //         <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
// //           <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
// //         </div>
// //       )}
// //
// //       {/* Form Modal */}
// //       {showForm && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
// //           <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
// //             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
// //             <div className="space-y-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
// //                 <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
// //                 <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
// //               </div>
// //               <div className="grid grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá (VNĐ) *</label>
// //                   <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tồn kho *</label>
// //                   <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //                 </div>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
// //                 <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
// //                   <option value={0}>-- Chọn danh mục --</option>
// //                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
// //                 </select>
// //               </div>
// //               <div className="grid grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sản xuất</label>
// //                   <input type="date" value={form.manufactureDate || ''} onChange={e => setForm({ ...form, manufactureDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn</label>
// //                   <input type="date" value={form.expDate || ''} onChange={e => setForm({ ...form, expDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //                 </div>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   Hình ảnh sản phẩm
// //                   <span className="text-xs font-normal text-gray-400 ml-2">(Ảnh đầu tiên = PRIMARY, còn lại = COVER)</span>
// //                 </label>
// //
// //                 {/* Existing images when editing */}
// //                 {editing && editing.images && editing.images.length > 0 && imageFiles.length === 0 && (
// //                   <div className="mb-3">
// //                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
// //                       <span className="material-symbols-outlined text-sm">photo_library</span>
// //                       Ảnh hiện tại ({editing.images.length} ảnh) — Upload ảnh mới sẽ thay thế tất cả
// //                     </p>
// //                     <div className="grid grid-cols-4 gap-2">
// //                       {editing.images.map((img, i) => (
// //                         <div key={img.id} className="relative group">
// //                           <img src={img.imageUrl} alt={`Image ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-white/10" />
// //                           {img.isPrimary && (
// //                             <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded shadow">PRIMARY</span>
// //                           )}
// //                           {!img.isPrimary && (
// //                             <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-700/70 text-white text-[9px] font-bold rounded">COVER</span>
// //                           )}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
// //
// //                 {/* New file uploads */}
// //                 {imagePreviews.length > 0 && (
// //                   <div className="mb-3">
// //                     <p className="text-xs text-gray-500 mb-2">Ảnh mới sẽ upload ({imagePreviews.length} ảnh)</p>
// //                     <div className="grid grid-cols-4 gap-2">
// //                       {imagePreviews.map((preview, i) => (
// //                         <div key={i} className="relative group">
// //                           <img src={preview} alt={`Preview ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-white/10" />
// //                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
// //                             <button onClick={() => removeFile(i)} className="p-1 bg-white/90 text-red-600 rounded-md">
// //                               <span className="material-symbols-outlined text-sm">close</span>
// //                             </button>
// //                           </div>
// //                           {i === 0 && (
// //                             <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded shadow">PRIMARY</span>
// //                           )}
// //                           {i > 0 && (
// //                             <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-gray-700/70 text-white text-[9px] font-bold rounded">COVER</span>
// //                           )}
// //                           <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 text-white text-[8px] rounded">
// //                             {(imageFiles[i]?.size ? (imageFiles[i].size / 1024).toFixed(0) : '?')} KB
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}
// //
// //                 {/* Upload button */}
// //                 <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
// //                   <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>
// //                   <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
// //                     {imagePreviews.length > 0 ? 'Thêm ảnh' : 'Chọn ảnh để upload'}
// //                   </span>
// //                   <span className="text-xs text-gray-400">JPG, PNG, WebP — Chọn nhiều file cùng lúc — Ảnh đầu = PRIMARY</span>
// //                   <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="hidden" />
// //                 </label>
// //               </div>
// //               <div className="flex gap-3 pt-2">
// //                 <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
// //                 <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}</button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //
// //       {/* Table */}
// //       <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
// //         <div className="overflow-x-auto">
// //           <table className="w-full">
// //             <thead>
// //               <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker">
// //                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
// //                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
// //                 <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ảnh</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tồn kho</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {loading ? (
// //                 <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
// //               ) : products.length === 0 ? (
// //                 <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
// //               ) : products.map(p => (
// //                 <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
// //                   <td className="px-5 py-3">
// //                     <div className="flex items-center gap-3">
// //                       {(p.primaryImage || p.image || p.images?.[0]?.imageUrl) ? (
// //                         <img src={p.primaryImage || p.image || p.images[0].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
// //                       ) : (
// //                         <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
// //                       )}
// //                       <div>
// //                         <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
// //                       </div>
// //                     </div>
// //                   </td>
// //                   <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{getCategoryName(p.categoryId)}</span></td>
// //                   <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(p.price)}</td>
// //                   <td className="px-5 py-3 text-center">
// //                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
// //                       {p.images?.length || 0} ảnh
// //                     </span>
// //                   </td>
// //                   <td className="px-5 py-3 text-right"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{p.stock}</span></td>
// //                   <td className="px-5 py-3 text-right">
// //                     <div className="flex gap-1 justify-end">
// //                       <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
// //                       <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //         {totalPages > 1 && (
// //           <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="px-5 py-3 border-t border-gray-200 dark:border-white/5" />
// //         )}
// //       </div>
// //     </div>
// //   );
// // };
// //
// // export default ProductManager;


// // import React, { useState, useEffect, useCallback } from 'react';
// // import { adminProductApi, adminCategoryApi, ProductResponse, ProductRequest, CategoryResponse, PageResponse } from '../../services/adminApi';
// // import { useConfirmDialog } from '../../components/ConfirmDialog';
// // import Pagination from '../../components/Pagination';
// // import { Editor } from '@tinymce/tinymce-react';

// // const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// // const ProductManager: React.FC = () => {
// //   const [products, setProducts] = useState<ProductResponse[]>([]);
// //   const [categories, setCategories] = useState<CategoryResponse[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [page, setPage] = useState(0);
// //   const [totalPages, setTotalPages] = useState(0);
// //   const [totalItems, setTotalItems] = useState(0);
// //   const [showForm, setShowForm] = useState(false);
// //   const [editing, setEditing] = useState<ProductResponse | null>(null);

// //   // Cập nhật initial form state với các field mới
// //   const [form, setForm] = useState<ProductRequest>({
// //     name: '',
// //     description: '',
// //     price: 0,
// //     stock: 0,
// //     categoryId: 0,
// //     batchCode: '',
// //     importQuantity: 0,
// //     importPrice: 0
// //   });

// //   const [imageFiles, setImageFiles] = useState<File[]>([]);
// //   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
// //   const [saving, setSaving] = useState(false);
// //   const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

// //   const fetchProducts = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await adminProductApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
// //       const data = res.data as PageResponse<ProductResponse>;
// //       setProducts(data.data || []);
// //       setTotalPages(data.totalPages);
// //       setTotalItems(data.totalItems);
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Lỗi tải sản phẩm' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [page]);

// //   const fetchCategories = useCallback(async () => {
// //     try {
// //       const res = await adminCategoryApi.getAll();
// //       setCategories(res.data as CategoryResponse[]);
// //     } catch {}
// //   }, []);

// //   useEffect(() => { fetchProducts(); }, [fetchProducts]);
// //   useEffect(() => { fetchCategories(); }, [fetchCategories]);

// //   const resetForm = () => {
// //     setForm({
// //       name: '',
// //       description: '',
// //       price: 0,
// //       stock: 0,
// //       categoryId: categories[0]?.id || 0,
// //       batchCode: '',
// //       importQuantity: 0,
// //       importPrice: 0
// //     });
// //     imagePreviews.forEach(url => URL.revokeObjectURL(url));
// //     setImageFiles([]);
// //     setImagePreviews([]);
// //     setEditing(null);
// //     setShowForm(false);
// //   };

// //   const openCreate = () => {
// //     resetForm();
// //     setForm(f => ({ ...f, categoryId: categories[0]?.id || 0 }));
// //     setShowForm(true);
// //   };

// //   const openEdit = (p: ProductResponse) => {
// //     setEditing(p);
// //     setForm({
// //       name: p.name,
// //       description: p.description || '',
// //       price: p.price,
// //       stock: p.stock,
// //       categoryId: p.categoryId,
// //       manufactureDate: p.manufactureDate || undefined,
// //       expDate: p.expDate || undefined,
// //       batchCode: 'UPDATE_INFO', // Giá trị giả khi edit vì BE yêu cầu @NotBlank
// //       importQuantity: 1,
// //       importPrice: 1000
// //     });
// //     imagePreviews.forEach(url => URL.revokeObjectURL(url));
// //     setImageFiles([]);
// //     setImagePreviews([]);
// //     setShowForm(true);
// //   };

// //   const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const fileList = e.target.files;
// //     if (!fileList || fileList.length === 0) return;
// //     const files: File[] = Array.from(fileList);
// //     const newPreviews = files.map(file => URL.createObjectURL(file));
// //     setImageFiles(prev => [...prev, ...files]);
// //     setImagePreviews(prev => [...prev, ...newPreviews]);
// //     e.target.value = '';
// //   };

// //   const removeFile = (idx: number) => {
// //     URL.revokeObjectURL(imagePreviews[idx]);
// //     setImageFiles(prev => prev.filter((_, i) => i !== idx));
// //     setImagePreviews(prev => prev.filter((_, i) => i !== idx));
// //   };

// //   const handleSubmit = async () => {
// //     // Validation
// //     if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên sản phẩm không được trống' }); return; }
// //     if (form.price <= 0) { setMsg({ type: 'error', text: 'Giá bán phải lớn hơn 0' }); return; }
// //     if (!form.categoryId) { setMsg({ type: 'error', text: 'Chọn danh mục' }); return; }

// //     // Thêm validation cho trường mới khi tạo mới
// //     if (!editing) {
// //       if (!form.batchCode?.trim()) { setMsg({ type: 'error', text: 'Mã lô hàng không được trống' }); return; }
// //       if (form.importQuantity <= 0) { setMsg({ type: 'error', text: 'Số lượng nhập phải lớn hơn 0' }); return; }
// //       if (form.importPrice <= 0) { setMsg({ type: 'error', text: 'Giá nhập phải lớn hơn 0' }); return; }
// //     }

// //     setSaving(true);
// //     const payload: ProductRequest = {
// //       ...form,
// //       // Đảm bảo stock khớp với importQuantity khi tạo mới lô đầu tiên
// //       stock: !editing ? form.importQuantity : form.stock
// //     };

// //     try {
// //       if (editing) {
// //         if (imageFiles.length > 0) {
// //           await adminProductApi.updateWithImages(editing.id, payload, imageFiles);
// //         } else {
// //           await adminProductApi.update(editing.id, payload);
// //         }
// //         setMsg({ type: 'success', text: 'Cập nhật thành công!' });
// //       } else {
// //         if (imageFiles.length > 0) {
// //           await adminProductApi.createWithImages(payload, imageFiles);
// //         } else {
// //           await adminProductApi.create(payload);
// //         }
// //         setMsg({ type: 'success', text: 'Tạo sản phẩm và lô hàng thành công!' });
// //       }
// //       resetForm();
// //       fetchProducts();
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Lỗi hệ thống' });
// //     } finally {
// //       setSaving(false);
// //       setTimeout(() => setMsg(null), 3000);
// //     }
// //   };

// //   const { confirm } = useConfirmDialog();

// //   const handleDelete = async (id: number) => {
// //     const ok = await confirm({
// //       title: 'Xóa sản phẩm',
// //       message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
// //       confirmText: 'Xóa',
// //       variant: 'danger',
// //     });
// //     if (!ok) return;
// //     try {
// //       await adminProductApi.delete(id);
// //       setMsg({ type: 'success', text: 'Đã xóa!' });
// //       fetchProducts();
// //     } catch (err: any) {
// //       setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
// //     }
// //     setTimeout(() => setMsg(null), 3000);
// //   };

// //   const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';

// //   return (
// //       <div>
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h2>
// //             <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} sản phẩm</p>
// //           </div>
// //           <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
// //             <span className="material-symbols-outlined text-lg">add</span>Thêm sản phẩm
// //           </button>
// //         </div>

// //         {msg && (
// //             <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
// //               <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
// //             </div>
// //         )}

// //         {showForm && (
// //             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
// //               <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
// //                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm & Lô hàng đầu tiên'}</h3>

// //                 <div className="space-y-4">
// //                   {/* Basic Info */}
// //                   <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
// //                     <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Thông tin cơ bản</h4>
// //                     <div>
// //                       {editing && (
// //                           <div>
// //                             <label className="block text-sm font-medium text-gray-400 mb-1">ID Sản phẩm (Hệ thống)</label>
// //                             <input
// //                                 value={editing.id}
// //                                 readOnly
// //                                 className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-100 dark:bg-surface-dark/50 text-gray-500 cursor-not-allowed outline-none font-mono text-sm"
// //                             />
// //                           </div>
// //                       )}
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
// //                       <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
// //                     </div>
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
// //                       <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
// //                     </div>
// //                     <div className="grid grid-cols-2 gap-4">
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá bán lẻ (VNĐ) *</label>
// //                         <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-primary" />
// //                       </div>
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
// //                         <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
// //                           <option value={0}>-- Chọn danh mục --</option>
// //                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
// //                         </select>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {/* Batch Info (Chỉ hiện/bắt buộc khi tạo mới) */}
// //                   {!editing && (
// //                       <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
// //                         <h4 className="text-xs font-bold uppercase text-amber-500 tracking-wider">Thông tin nhập kho (Lô hàng đầu)</h4>
// //                         <div className="grid grid-cols-2 gap-4">
// //                           <div>
// //                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Mã lô hàng *</label>
// //                             <input value={form.batchCode} onChange={e => setForm({ ...form, batchCode: e.target.value })} placeholder="VD: LO-XUAN-2026" className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
// //                           </div>
// //                           <div>
// //                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Giá nhập gốc (VNĐ) *</label>
// //                             <input type="number" value={form.importPrice} onChange={e => setForm({ ...form, importPrice: +e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-medium" />
// //                           </div>
// //                         </div>
// //                         <div className="grid grid-cols-2 gap-4">
// //                           <div>
// //                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Số lượng nhập *</label>
// //                             <input type="number" value={form.importQuantity} onChange={e => setForm({ ...form, importQuantity: +e.target.value, stock: +e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold" />
// //                           </div>
// //                           <div>
// //                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày sản xuất</label>
// //                             <input type="date" value={form.manufactureDate || ''} onChange={e => setForm({ ...form, manufactureDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
// //                           </div>
// //                         </div>
// //                         <div>
// //                           <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày hết hạn (EXP) *</label>
// //                           <input type="date" value={form.expDate || ''} onChange={e => setForm({ ...form, expDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold text-red-500" />
// //                         </div>
// //                       </div>
// //                   )}

// //                   {/* Images Section */}
// //                   <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh sản phẩm</label>

// //                     {/* Existing Preview Logic */}
// //                     {editing && editing.images && editing.images.length > 0 && imageFiles.length === 0 && (
// //                         <div className="grid grid-cols-5 gap-2 mb-3">
// //                           {editing.images.map((img, i) => (
// //                               <div key={img.id} className="relative aspect-square">
// //                                 <img src={img.imageUrl} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
// //                                 {img.isPrimary && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
// //                               </div>
// //                           ))}
// //                         </div>
// //                     )}

// //                     {/* New Preview Logic */}
// //                     {imagePreviews.length > 0 && (
// //                         <div className="grid grid-cols-5 gap-2 mb-3">
// //                           {imagePreviews.map((preview, i) => (
// //                               <div key={i} className="relative aspect-square group">
// //                                 <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
// //                                 <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
// //                                 {i === 0 && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
// //                               </div>
// //                           ))}
// //                         </div>
// //                     )}

// //                     <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:bg-primary/5 transition-all">
// //                       <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
// //                       <span className="text-xs text-gray-500 mt-1">Chọn ảnh sản phẩm</span>
// //                       <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="hidden" />
// //                     </label>
// //                   </div>

// //                   <div className="flex gap-3 pt-2">
// //                     <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium">Hủy</button>
// //                     <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">
// //                       {saving ? 'Đang xử lý...' : (editing ? 'Lưu thay đổi' : 'Tạo sản phẩm & Nhập kho')}
// //                     </button>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //         )}

// //         {/* Table Section (Giữ nguyên như cũ) */}
// //         <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
// //           {/* ... table content ... */}
// //           <div className="overflow-x-auto">
// //             <table className="w-full">
// //               <thead>
// //               <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker">
// //                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
// //                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
// //                 <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ảnh</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tồn kho</th>
// //                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
// //               </tr>
// //               </thead>
// //               <tbody>
// //               {loading ? (
// //                   <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
// //               ) : products.length === 0 ? (
// //                   <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
// //               ) : products.map(p => (
// //                   <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
// //                     <td className="px-5 py-3">
// //                       <div className="flex items-center gap-3">
// //                         {(p.primaryImage || p.image || p.images?.[0]?.imageUrl) ? (
// //                             <img src={p.primaryImage || p.image || p.images[0].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
// //                         ) : (
// //                             <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
// //                         )}
// //                         <div>
// //                           <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
// //                         </div>
// //                       </div>
// //                     </td>
// //                     <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{getCategoryName(p.categoryId)}</span></td>
// //                     <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(p.price)}</td>
// //                     <td className="px-5 py-3 text-center">
// //                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
// //                       {p.images?.length || 0} ảnh
// //                     </span>
// //                     </td>
// //                     <td className="px-5 py-3 text-right"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{p.stock}</span></td>
// //                     <td className="px-5 py-3 text-right">
// //                       <div className="flex gap-1 justify-end">
// //                         <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
// //                         <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //               ))}
// //               </tbody>
// //             </table>
// //           </div>
// //           {totalPages > 1 && (
// //               <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="px-5 py-3 border-t border-gray-200 dark:border-white/5" />
// //           )}
// //         </div>
// //       </div>
// //   );
// // };

// // export default ProductManager;


// import React, { useState, useEffect, useCallback } from 'react';
// import { adminProductApi, adminCategoryApi, ProductResponse, ProductRequest, CategoryResponse, PageResponse } from '../../services/adminApi';
// import { useConfirmDialog } from '../../components/ConfirmDialog';
// import Pagination from '../../components/Pagination';

// // --- TINYMCE: Import component Editor ---
// import { Editor } from '@tinymce/tinymce-react';

// const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// const ProductManager: React.FC = () => {
//   const [products, setProducts] = useState<ProductResponse[]>([]);
//   const [categories, setCategories] = useState<CategoryResponse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState<ProductResponse | null>(null);

//   const [form, setForm] = useState<ProductRequest>({
//     name: '',
//     description: '',
//     price: 0,
//     stock: 0,
//     categoryId: 0,
//     batchCode: '',
//     importQuantity: 0,
//     importPrice: 0
//   });

//   const [imageFiles, setImageFiles] = useState<File[]>([]);
//   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await adminProductApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
//       const data = res.data as PageResponse<ProductResponse>;
//       setProducts(data.data || []);
//       setTotalPages(data.totalPages);
//       setTotalItems(data.totalItems);
//     } catch (err: any) {
//       setMsg({ type: 'error', text: err?.message || 'Lỗi tải sản phẩm' });
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   const fetchCategories = useCallback(async () => {
//     try {
//       const res = await adminCategoryApi.getAll();
//       setCategories(res.data as CategoryResponse[]);
//     } catch {}
//   }, []);

//   useEffect(() => { fetchProducts(); }, [fetchProducts]);
//   useEffect(() => { fetchCategories(); }, [fetchCategories]);

//   const resetForm = () => {
//     setForm({
//       name: '',
//       description: '',
//       price: 0,
//       stock: 0,
//       categoryId: categories[0]?.id || 0,
//       batchCode: '',
//       importQuantity: 0,
//       importPrice: 0
//     });
//     imagePreviews.forEach(url => URL.revokeObjectURL(url));
//     setImageFiles([]);
//     setImagePreviews([]);
//     setEditing(null);
//     setShowForm(false);
//   };

//   const openCreate = () => {
//     resetForm();
//     setForm(f => ({ ...f, categoryId: categories[0]?.id || 0 }));
//     setShowForm(true);
//   };

//   const openEdit = (p: ProductResponse) => {
//     setEditing(p);
//     setForm({
//       name: p.name,
//       description: p.description || '',
//       price: p.price,
//       stock: p.stock,
//       categoryId: p.categoryId,
//       manufactureDate: p.manufactureDate || undefined,
//       expDate: p.expDate || undefined,
//       batchCode: 'UPDATE_INFO',
//       importQuantity: 1,
//       importPrice: 1000
//     });
//     imagePreviews.forEach(url => URL.revokeObjectURL(url));
//     setImageFiles([]);
//     setImagePreviews([]);
//     setShowForm(true);
//   };

//   const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const fileList = e.target.files;
//     if (!fileList || fileList.length === 0) return;
//     const files: File[] = Array.from(fileList);
//     const newPreviews = files.map(file => URL.createObjectURL(file));
//     setImageFiles(prev => [...prev, ...files]);
//     setImagePreviews(prev => [...prev, ...newPreviews]);
//     e.target.value = '';
//   };

//   const removeFile = (idx: number) => {
//     URL.revokeObjectURL(imagePreviews[idx]);
//     setImageFiles(prev => prev.filter((_, i) => i !== idx));
//     setImagePreviews(prev => prev.filter((_, i) => i !== idx));
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên sản phẩm không được trống' }); return; }
//     if (form.price <= 0) { setMsg({ type: 'error', text: 'Giá bán phải lớn hơn 0' }); return; }
//     if (!form.categoryId) { setMsg({ type: 'error', text: 'Chọn danh mục' }); return; }

//     if (!editing) {
//       if (!form.batchCode?.trim()) { setMsg({ type: 'error', text: 'Mã lô hàng không được trống' }); return; }
//       if (form.importQuantity <= 0) { setMsg({ type: 'error', text: 'Số lượng nhập phải lớn hơn 0' }); return; }
//       if (form.importPrice <= 0) { setMsg({ type: 'error', text: 'Giá nhập phải lớn hơn 0' }); return; }
//     }

//     setSaving(true);
//     const payload: ProductRequest = {
//       ...form,
//       stock: !editing ? form.importQuantity : form.stock
//     };

//     try {
//       if (editing) {
//         if (imageFiles.length > 0) {
//           await adminProductApi.updateWithImages(editing.id, payload, imageFiles);
//         } else {
//           await adminProductApi.update(editing.id, payload);
//         }
//         setMsg({ type: 'success', text: 'Cập nhật thành công!' });
//       } else {
//         if (imageFiles.length > 0) {
//           await adminProductApi.createWithImages(payload, imageFiles);
//         } else {
//           await adminProductApi.create(payload);
//         }
//         setMsg({ type: 'success', text: 'Tạo sản phẩm và lô hàng thành công!' });
//       }
//       resetForm();
//       fetchProducts();
//     } catch (err: any) {
//       setMsg({ type: 'error', text: err?.message || 'Lỗi hệ thống' });
//     } finally {
//       setSaving(false);
//       setTimeout(() => setMsg(null), 3000);
//     }
//   };

//   const { confirm } = useConfirmDialog();

//   const handleDelete = async (id: number) => {
//     const ok = await confirm({
//       title: 'Xóa sản phẩm',
//       message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
//       confirmText: 'Xóa',
//       variant: 'danger',
//     });
//     if (!ok) return;
//     try {
//       await adminProductApi.delete(id);
//       setMsg({ type: 'success', text: 'Đã xóa!' });
//       fetchProducts();
//     } catch (err: any) {
//       setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
//     }
//     setTimeout(() => setMsg(null), 3000);
//   };

//   const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';

//   return (
//       <div>
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} sản phẩm</p>
//           </div>
//           <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
//             <span className="material-symbols-outlined text-lg">add</span>Thêm sản phẩm
//           </button>
//         </div>

//         {msg && (
//             <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
//               <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
//             </div>
//         )}

//         {showForm && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>

//               <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
//                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm & Lô hàng đầu tiên'}</h3>

//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
//                     <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Thông tin cơ bản</h4>
//                     <div>
//                       {editing && (
//                           <div>
//                             <label className="block text-sm font-medium text-gray-400 mb-1">ID Sản phẩm (Hệ thống)</label>
//                             <input
//                                 value={editing.id}
//                                 readOnly
//                                 className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-100 dark:bg-surface-dark/50 text-gray-500 cursor-not-allowed outline-none font-mono text-sm"
//                             />
//                           </div>
//                       )}
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">Tên sản phẩm *</label>
//                       <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
//                     </div>


//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết</label>
//                       <Editor
//                         apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
//                         value={form.description}
//                         onEditorChange={(newContent) => setForm({ ...form, description: newContent })}
//                         init={{
//                           height: 350,
//                           menubar: false,
//                           plugins: [
//                             'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
//                             'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
//                             'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
//                           ],
//                           toolbar: 'undo redo | blocks | ' +
//                             'bold italic forecolor | alignleft aligncenter ' +
//                             'alignright alignjustify | bullist numlist outdent indent | ' +
//                             'removeformat | image | help',
//                           content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
//                         }}
//                       />
//                     </div>


//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá bán lẻ (VNĐ) *</label>
//                         <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-primary" />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
//                         <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
//                           <option value={0}>-- Chọn danh mục --</option>
//                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   {!editing && (
//                       <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
//                         <h4 className="text-xs font-bold uppercase text-amber-500 tracking-wider">Thông tin nhập kho (Lô hàng đầu)</h4>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Mã lô hàng *</label>
//                             <input value={form.batchCode} onChange={e => setForm({ ...form, batchCode: e.target.value })} placeholder="VD: LO-XUAN-2026" className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Giá nhập gốc (VNĐ) *</label>
//                             <input type="number" value={form.importPrice} onChange={e => setForm({ ...form, importPrice: +e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-medium" />
//                           </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Số lượng nhập *</label>
//                             <input type="number" value={form.importQuantity} onChange={e => setForm({ ...form, importQuantity: +e.target.value, stock: +e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold" />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày sản xuất</label>
//                             <input type="date" value={form.manufactureDate || ''} onChange={e => setForm({ ...form, manufactureDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày hết hạn (EXP) *</label>
//                           <input type="date" value={form.expDate || ''} onChange={e => setForm({ ...form, expDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold text-red-500" />
//                         </div>
//                       </div>
//                   )}

//                   <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh sản phẩm</label>

//                     {editing && editing.images && editing.images.length > 0 && imageFiles.length === 0 && (
//                         <div className="grid grid-cols-5 gap-2 mb-3">
//                           {editing.images.map((img, i) => (
//                               <div key={img.id} className="relative aspect-square">
//                                 <img src={img.imageUrl} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
//                                 {img.isPrimary && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
//                               </div>
//                           ))}
//                         </div>
//                     )}

//                     {imagePreviews.length > 0 && (
//                         <div className="grid grid-cols-5 gap-2 mb-3">
//                           {imagePreviews.map((preview, i) => (
//                               <div key={i} className="relative aspect-square group">
//                                 <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
//                                 <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
//                                 {i === 0 && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
//                               </div>
//                           ))}
//                         </div>
//                     )}

//                     <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:bg-primary/5 transition-all">
//                       <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
//                       <span className="text-xs text-gray-500 mt-1">Chọn ảnh sản phẩm</span>
//                       <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="hidden" />
//                     </label>
//                   </div>

//                   <div className="flex gap-3 pt-2">
//                     <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium">Hủy</button>
//                     <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">
//                       {saving ? 'Đang xử lý...' : (editing ? 'Lưu thay đổi' : 'Tạo sản phẩm & Nhập kho')}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//         )}

//         <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//               <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker">
//                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
//                 <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
//                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
//                 <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ảnh</th>
//                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tồn kho</th>
//                 <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
//               </tr>
//               </thead>
//               <tbody>
//               {loading ? (
//                   <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
//               ) : products.length === 0 ? (
//                   <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
//               ) : products.map(p => (
//                   <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
//                     <td className="px-5 py-3">
//                       <div className="flex items-center gap-3">
//                         {(p.primaryImage || p.image || p.images?.[0]?.imageUrl) ? (
//                             <img src={p.primaryImage || p.image || p.images[0].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
//                         ) : (
//                             <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
//                         )}
//                         <div>
//                           <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{getCategoryName(p.categoryId)}</span></td>
//                     <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(p.price)}</td>
//                     <td className="px-5 py-3 text-center">
//                     <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
//                       {p.images?.length || 0} ảnh
//                     </span>
//                     </td>
//                     <td className="px-5 py-3 text-right"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{p.stock}</span></td>
//                     <td className="px-5 py-3 text-right">
//                       <div className="flex gap-1 justify-end">
//                         <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
//                         <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
//                       </div>
//                     </td>
//                   </tr>
//               ))}
//               </tbody>
//             </table>
//           </div>
//           {totalPages > 1 && (
//               <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="px-5 py-3 border-t border-gray-200 dark:border-white/5" />
//           )}
//         </div>
//       </div>
//   );
// };

// export default ProductManager;


import React, { useState, useEffect, useCallback } from 'react';
import { adminProductApi, adminCategoryApi, ProductResponse, ProductRequest, CategoryResponse, PageResponse } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { Editor } from '@tinymce/tinymce-react';
import CurrencyInput from '@/components/CurrencyInput';

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

  // --- TÙY CHỌN NHẬP KHO: Thêm state quản lý bật/tắt ---
  const [isInitialImport, setIsInitialImport] = useState(false);

  const [form, setForm] = useState<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    batchCode: '',
    importQuantity: 0,
    importPrice: 0
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    } catch { }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: categories[0]?.id || 0,
      batchCode: '',
      importQuantity: 0,
      importPrice: 0
    });
    // --- TÙY CHỌN NHẬP KHO: Reset lại trạng thái toggle ---
    setIsInitialImport(false);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
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
      batchCode: 'UPDATE_INFO',
      importQuantity: 1,
      importPrice: 1000
    });
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên sản phẩm không được trống' }); return; }
    if (form.price <= 0) { setMsg({ type: 'error', text: 'Giá bán phải lớn hơn 0' }); return; }
    if (!form.categoryId) { setMsg({ type: 'error', text: 'Chọn danh mục' }); return; }



    // --- TÙY CHỌN NHẬP KHO: Chỉ validate nếu là tạo mới VÀ có bật toggle nhập kho ---
    if (!editing && isInitialImport) {
      if (!form.batchCode?.trim()) { setMsg({ type: 'error', text: 'Mã lô hàng không được trống' }); return; }
      if (form.importQuantity <= 0) { setMsg({ type: 'error', text: 'Số lượng nhập phải lớn hơn 0' }); return; }
      if (form.importPrice <= 0) { setMsg({ type: 'error', text: 'Giá nhập phải lớn hơn 0' }); return; }
    }
    setSaving(true);
    const payload: ProductRequest = {
      ...form,
      // --- TÙY CHỌN NHẬP KHO: Nếu tạo mới và CÓ tick nhập kho -> lấy importQuantity, KHÔNG THÌ -> 0 ---
      stock: (!editing && isInitialImport) ? form.importQuantity : (editing ? form.stock : 0)
    };

    try {
      if (editing) {
        if (imageFiles.length > 0) {
          await adminProductApi.updateWithImages(editing.id, payload, imageFiles);
        } else {
          await adminProductApi.update(editing.id, payload);
        }
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        if (imageFiles.length > 0) {
          await adminProductApi.createWithImages(payload, imageFiles);
        } else {
          await adminProductApi.create(payload);
        }
        setMsg({ type: 'success', text: isInitialImport ? 'Tạo sản phẩm và nhập kho thành công!' : 'Tạo sản phẩm thành công (Tồn kho = 0)!' });
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi hệ thống' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminProductApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' });
      fetchProducts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Thông tin cơ bản</h4>
                <div>
                  {editing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">ID Sản phẩm (Hệ thống)</label>
                      <input
                        value={editing.id}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/5 rounded-xl bg-gray-100 dark:bg-surface-dark/50 text-gray-500 cursor-not-allowed outline-none font-mono text-sm"
                      />
                    </div>
                  )}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">Tên sản phẩm *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết</label>
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    value={form.description}
                    onEditorChange={(newContent) => setForm({ ...form, description: newContent })}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | image | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá bán lẻ (VNĐ) *</label>
                    <CurrencyInput
                      placeholder="0"
                      value={form.price}
                      onChange={(newPrice) => setForm({ ...form, price: newPrice })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục *</label>
                    <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                      <option value={0}>-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* --- TÙY CHỌN NHẬP KHO: Checkbox Toggle (Chỉ hiện khi tạo mới) --- */}
              {!editing && (
                <div className="mt-4">
                  <label className="flex items-start gap-3 p-4 border border-primary/20 bg-primary/5 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isInitialImport}
                        onChange={(e) => setIsInitialImport(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">Khởi tạo tồn kho ban đầu (Tùy chọn)</span>
                      <span className="text-xs text-gray-500 mt-1">
                        Tick chọn nếu bạn muốn nhập sẵn lô hàng đầu tiên. Nếu bỏ qua, sản phẩm sẽ có tồn kho = 0 và bạn có thể nhập kho sau ở màn hình Quản lý kho.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* --- TÙY CHỌN NHẬP KHO: Form nhập kho (Chỉ hiện khi tạo mới VÀ có tick checkbox) --- */}
              {(!editing && isInitialImport) && (
                <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <h4 className="text-xs font-bold uppercase text-amber-500 tracking-wider">Thông tin nhập kho (Lô hàng đầu)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Mã lô hàng *</label>
                      <input value={form.batchCode} onChange={e => setForm({ ...form, batchCode: e.target.value })} placeholder="VD: LO-XUAN-2026" className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Giá nhập gốc (VNĐ) *</label>
                      <CurrencyInput
                        placeholder="0"
                        value={form.importPrice}
                        onChange={(newPrice) => setForm({ ...form, importPrice: newPrice })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Số lượng nhập *</label>
                      <input type="number" value={form.importQuantity} onChange={e => setForm({ ...form, importQuantity: +e.target.value })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày sản xuất</label>
                      <input type="date" value={form.manufactureDate || ''} onChange={e => setForm({ ...form, manufactureDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">Ngày hết hạn (EXP) *</label>
                    <input type="date" value={form.expDate || ''} onChange={e => setForm({ ...form, expDate: e.target.value || undefined })} className="w-full px-4 py-2.5 border border-amber-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white outline-none font-bold text-red-500" />
                  </div>
                </div>
              )}

              {/* Images Section */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh sản phẩm</label>

                {editing && editing.images && editing.images.length > 0 && imageFiles.length === 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {editing.images.map((img, i) => (
                      <div key={img.id} className="relative aspect-square">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
                        {img.isPrimary && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
                      </div>
                    ))}
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative aspect-square group">
                        <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border dark:border-white/10" />
                        <button onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        {i === 0 && <span className="absolute top-1 left-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">PRIMARY</span>}
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                  <span className="text-xs text-gray-500 mt-1">Chọn ảnh sản phẩm</span>
                  <input type="file" accept="image/*" multiple onChange={handleFilesSelect} className="hidden" />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium">Hủy</button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">
                  {saving ? 'Đang xử lý...' : (editing ? 'Lưu thay đổi' : (isInitialImport ? 'Tạo sản phẩm & Nhập kho' : 'Tạo sản phẩm'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker">
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sản phẩm</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Danh mục</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ảnh</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tồn kho</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {(p.primaryImage || p.image || p.images?.[0]?.imageUrl) ? (
                        <img src={p.primaryImage || p.image || p.images[0].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400">image</span></div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{getCategoryName(p.categoryId)}</span></td>
                  <td className="px-5 py-3 text-right text-sm font-bold text-primary">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {p.images?.length || 0} ảnh
                    </span>
                  </td>
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="simple" className="px-5 py-3 border-t border-gray-200 dark:border-white/5" />
        )}
      </div>
    </div>
  );
};

export default ProductManager;