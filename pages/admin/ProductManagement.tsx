import React, { useState, useEffect } from 'react';
import { AdminProduct, AdminCategory, PageResponse } from '../../types';
import { adminProductApi, adminCategoryApi } from '../../services/adminApi';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    imageUrl: '',
  });

  const pageSize = 10;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, categoryFilter]);

  const loadCategories = async () => {
    try {
      const response = await adminCategoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Mock categories
      setCategories([
        { id: 1, name: 'Bánh Tết', description: 'Các loại bánh truyền thống' },
        { id: 2, name: 'Mứt Tết', description: 'Mứt trái cây các loại' },
        { id: 3, name: 'Quà Tết', description: 'Set quà biếu' },
      ]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminProductApi.getAll(page, pageSize);
      console.log('Products response:', response);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      alert(error.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadProducts();
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      imageUrl: '',
    });
    setShowModal(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    const thumbnail = product.images?.find(img => img.isThumbnail)?.imageUrl || product.images?.[0]?.imageUrl || '';
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryId: product.categories?.[0]?.id?.toString() || '',
      imageUrl: thumbnail,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await adminProductApi.delete(id);
      await loadProducts();
      alert('Xóa sản phẩm thành công!');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      alert(error.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        categoryIds: formData.categoryId ? [parseInt(formData.categoryId)] : [],
        images: formData.imageUrl ? [{ imageUrl: formData.imageUrl, isThumbnail: true, sortOrder: 0 }] : undefined,
      };
      if (editingProduct) {
        await adminProductApi.update(editingProduct.id, payload);
      } else {
        await adminProductApi.create(payload);
      }
      setShowModal(false);
      await loadProducts();
      alert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(error.message || 'Không thể lưu sản phẩm');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Quản lý Sản phẩm
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {totalElements} sản phẩm
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-glow"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm Sản phẩm
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : '')}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-gray-100 dark:bg-surface-dark text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-surface-dark border-b border-gray-200 dark:border-[#3a3330]/60">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
                {products.map((product) => {
                  const thumbnail = product.images?.find(img => img.isThumbnail)?.imageUrl || product.images?.[0]?.imageUrl;
                  return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-14 rounded-xl bg-gray-100 dark:bg-surface-dark overflow-hidden flex-shrink-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="material-symbols-outlined text-2xl">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-surface-dark text-gray-700 dark:text-gray-300 text-sm">
                        {product.categories?.[0]?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.originalPrice ? (
                        <div>
                          <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                          <p className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</p>
                        </div>
                      ) : (
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                          Đang bán
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400">
                          Ngừng bán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="size-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#3a3330]/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3a3330]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3a3330]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60 sticky top-0 bg-white dark:bg-card-dark">
              <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá gốc (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Danh mục *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-red-600 transition-colors"
                >
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
