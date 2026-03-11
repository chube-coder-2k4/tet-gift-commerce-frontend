import React, { useState, useEffect } from 'react';
import { AdminCategory } from '../../types';
import { adminCategoryApi } from '../../services/adminApi';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminCategoryApi.getAll();
      setCategories(response.data || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Không thể tải danh mục');
      // Mock data fallback
      setCategories([
        { id: 1, name: 'Hộp quà Tết', description: 'Các hộp quà Tết truyền thống' },
        { id: 2, name: 'Giỏ quà', description: 'Giỏ quà sang trọng' },
        { id: 3, name: 'Rượu vang', description: 'Rượu vang cao cấp' },
        { id: 4, name: 'Hạt dinh dưỡng', description: 'Các loại hạt tốt cho sức khỏe' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError(null);
    setShowModal(true);
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await adminCategoryApi.delete(id);
      await loadCategories();
      alert('Xóa danh mục thành công!');
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      // Check for foreign key constraint error
      const errorMsg = err.message || '';
      if (errorMsg.includes('foreign key') || errorMsg.includes('constraint') || errorMsg.includes('referenced')) {
        alert('Không thể xóa danh mục này vì đang có sản phẩm thuộc danh mục. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.');
      } else {
        alert('Không thể xóa danh mục. Vui lòng thử lại.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (editingCategory) {
        await adminCategoryApi.update(editingCategory.id, formData);
      } else {
        await adminCategoryApi.create(formData);
      }
      setShowModal(false);
      await loadCategories();
      alert(editingCategory ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setError(err.message || 'Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Quản lý Danh mục
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {categories.length} danh mục
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-glow"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm Danh mục
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Categories Grid */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-4 block">category</span>
            <p>Không tìm thấy danh mục nào</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-50 dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-[#3a3330]/60 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">category</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {category.id}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {category.description || 'Không có mô tả'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-[#3a3330]/60">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
              <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên danh mục"
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
                  placeholder="Nhập mô tả danh mục (tùy chọn)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary resize-none"
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
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang xử lý...' : editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
