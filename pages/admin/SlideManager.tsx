import React, { useState, useEffect } from 'react';
import { slideApi, HomeSlideResponse, HomeSlideRequest } from '../../services/slideApi';
import { uploadApi } from '../../services/uploadApi';

const SlideManager: React.FC = () => {
  const [slides, setSlides] = useState<HomeSlideResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HomeSlideResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<HomeSlideRequest>({
    image: '',
    title: '',
    subtitle: '',
    cta: '',
    link: '',
    slideOrder: 0,
    isActive: true,
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const res = await slideApi.getAllSlidesAdmin();
      setSlides(res.data || []);
    } catch (err) {
      console.error('Failed to fetch slides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenModal = (slide?: HomeSlideResponse) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        image: slide.image ?? '',
        title: slide.title ?? '',
        subtitle: slide.subtitle ?? '',
        cta: slide.cta ?? '',
        link: slide.link ?? '',
        slideOrder: slide.slideOrder ?? 0,
        isActive: slide.isActive ?? true,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        image: '',
        title: '',
        subtitle: '',
        cta: '',
        link: '',
        slideOrder: slides.length,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const uploaded = res.data as unknown;
      const uploadedUrl = typeof uploaded === 'string'
        ? uploaded
        : typeof uploaded === 'object' && uploaded !== null
          ? (uploaded as { url?: string; imageUrl?: string }).url || (uploaded as { url?: string; imageUrl?: string }).imageUrl || ''
          : '';

      if (!uploadedUrl) {
        throw new Error('Không đọc được URL ảnh từ phản hồi upload.');
      }

      setFormData(prev => ({ ...prev, image: uploadedUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Tải ảnh lên thất bại');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Vui lòng chọn ảnh cho slide');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSlide) {
        await slideApi.updateSlide(editingSlide.id, formData);
      } else {
        await slideApi.createSlide(formData);
      }
      handleCloseModal();
      fetchSlides();
    } catch (err) {
      console.error('Failed to save slide:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa slide này?')) return;
    try {
      await slideApi.deleteSlide(id);
      fetchSlides();
    } catch (err) {
      console.error('Failed to delete slide:', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Slide Trang chủ</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Thêm Slide mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map(slide => (
          <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
            <div className="aspect-[21/9] relative bg-gray-100">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={() => handleOpenModal(slide)}
                  className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50"
                  title="Sửa"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 bg-white text-red-600 rounded-md shadow-sm hover:bg-red-50"
                  title="Xóa"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full backdrop-blur-sm">
                Thứ tự: {slide.slideOrder}
              </div>
              {!slide.isActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">Ẩn</span>
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-gray-900 line-clamp-1">{slide.title || 'Không có tiêu đề'}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">{slide.subtitle || 'Không có phụ đề'}</p>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            Chưa có slide nào. Hãy thêm slide mới.
          </div>
        )}
      </div>

      {/* Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all scale-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingSlide ? 'Chỉnh sửa Slide' : 'Thêm Slide mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Ảnh Slide <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4">
                  <div className="size-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="slide-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="slide-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">upload</span>
                      {uploadLoading ? 'Đang tải...' : 'Chọn ảnh'}
                    </label>
                    <p className="text-[10px] text-gray-500 mt-2">Đề xuất tỉ lệ 21:9 hoặc kích thước lớn (1920x800px)</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Hoặc nhập URL ảnh trực tiếp"
                  className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  value={formData.image ?? ''}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    placeholder="Quà Tết 2026..."
                    value={formData.title ?? ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">Text Nút (CTA)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    placeholder="Mua Ngay / Xem Ngay"
                    value={formData.cta ?? ''}
                    onChange={e => setFormData({ ...formData, cta: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Phụ đề / Mô tả ngắn</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary min-h-[80px]"
                  placeholder="Mô tả ngắn gọn về ưu đãi hoặc sản phẩm..."
                  value={formData.subtitle ?? ''}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 block">Đường dẫn khi click</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  placeholder="/shop hoặc https://..."
                  value={formData.link ?? ''}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 block">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    value={formData.slideOrder ?? 0}
                    onChange={e => setFormData({ ...formData, slideOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={Boolean(formData.isActive)}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="size-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is-active" className="text-sm font-semibold text-gray-700 cursor-pointer">Cho phép hoạt động</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadLoading}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingSlide ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideManager;
