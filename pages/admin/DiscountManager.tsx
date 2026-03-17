import React, { useState, useEffect, useCallback } from 'react';
import { adminDiscountApi, DiscountResponse, DiscountRequest } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// Convert datetime-local value (yyyy-MM-ddTHH:mm) → backend format (yyyy-MM-dd'T'HH:mm:ss)
const toLocalDateTime = (dt: string): string => {
  if (!dt) return '';
  return dt.length === 16 ? `${dt}:00` : dt;
};

// Convert backend format (yyyy-MM-dd'T'HH:mm:ss) → datetime-local input (yyyy-MM-ddTHH:mm)
const toInputDateTime = (dt: string): string => {
  if (!dt) return '';
  return dt.slice(0, 16);
};

// Display datetime in Vietnamese locale
const formatDateTime = (dt: string): string => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const DiscountManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiscountResponse | null>(null);

  const [form, setForm] = useState<DiscountRequest>({
    code: '',
    discountType: 'FIXED',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: '',
    endDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDiscountApi.getAll();
      setDiscounts(res.data as DiscountResponse[]);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải danh sách' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => { setForm({ code: '', discountValue: 0, startDate: '', endDate: '' }); setEditing(null); setShowForm(false); };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (d: DiscountResponse) => {
    setEditing(d);
    setForm({
      code: d.code,
      discountType: d.discountType || 'FIXED',
      discountValue: d.discountValue,
      maxDiscountAmount: d.maxDiscountAmount || 0,
      startDate: toInputDateTime(d.startDate),
      endDate: toInputDateTime(d.endDate),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) { setMsg({ type: 'error', text: 'Mã giảm giá không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    if (form.discountValue <= 0) { setMsg({ type: 'error', text: 'Giá trị giảm phải lớn hơn 0' }); setTimeout(() => setMsg(null), 3000); return; }

    setSaving(true);
    const payload: DiscountRequest = {
      ...form,
      startDate: toLocalDateTime(form.startDate),
      endDate: toLocalDateTime(form.endDate),
    };
    try {
      if (editing) {
        await adminDiscountApi.update(editing.id, payload);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminDiscountApi.create(payload);
        setMsg({ type: 'success', text: 'Tạo mã giảm giá thành công!' });
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

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa mã giảm giá',
      message: 'Bạn có chắc chắn muốn xóa mã giảm giá này?',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminDiscountApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const isActive = (d: DiscountResponse) => {
    const now = new Date();
    const start = d.startDate ? new Date(d.startDate) : null;
    const end = d.endDate ? new Date(d.endDate) : null;
    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'expired';
    return 'active';
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'active': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Đang hoạt động</span>;
      case 'upcoming': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Sắp bắt đầu</span>;
      case 'expired': return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-500">Hết hạn</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý mã giảm giá</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{discounts.length} mã giảm giá</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm mã giảm giá
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Chỉnh sửa' : 'Thêm mã giảm giá'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã giảm giá *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: TET2025" className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase font-mono" />
              </div>

              {/* Loại giảm giá (NEW) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loại giảm giá</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                  <button
                      onClick={() => setForm({...form, discountType: 'FIXED'})}
                      className={`py-2 text-sm font-bold rounded-lg transition-all ${form.discountType === 'FIXED' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                  >Tiền mặt (đ)</button>
                  <button
                      onClick={() => setForm({...form, discountType: 'PERCENTAGE'})}
                      className={`py-2 text-sm font-bold rounded-lg transition-all ${form.discountType === 'PERCENTAGE' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                  >Phần trăm (%)</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ô 1: GIÁ TRỊ GIẢM THỰC TẾ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá trị giảm ({form.discountType === 'FIXED' ? 'đ' : '%'}) *
                  </label>
                  <input
                      type="number"
                      value={form.discountValue}
                      onChange={e => setForm({ ...form, discountValue: +e.target.value })}
                      placeholder="VD: 50000 hoặc 20"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary outline-none"
                  />
                </div>

                {/* Ô 2: ĐIỀU KIỆN ĐƠN TỐI THIỂU (Đây là phần bạn muốn sửa) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đơn tối thiểu (VNĐ) *
                  </label>
                  <input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={e => setForm({ ...form, minOrderAmount: +e.target.value })}
                      placeholder="VD: 200000"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Ô 3: GIẢM TỐI ĐA (Chỉ hiện khi chọn loại %) */}
              {form.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mức giảm tối đa (VNĐ)
                    </label>
                    <input
                        type="number"
                        value={form.maxDiscountAmount}
                        onChange={e => setForm({ ...form, maxDiscountAmount: +e.target.value })}
                        placeholder="VD: 80000"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary outline-none"
                    />
                  </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày giờ bắt đầu</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày giờ kết thúc</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
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
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">STT</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mã</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Giá trị</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thời gian</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
            ) : discounts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có mã giảm giá</td></tr>
            ) : discounts.map((d, idx) => (
                <tr key={d.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
          <span className="font-mono font-bold text-sm px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg w-fit">
            {d.code}
          </span>
                      {/* Thêm nhãn nhỏ bên dưới mã để Admin dễ phân biệt loại */}
                      <span className="text-[10px] mt-1 text-gray-400 uppercase tracking-tighter">
            {d.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Tiền mặt'}
          </span>
                    </div>
                  </td>

                  {/* CHỖ SỬA CHÍNH: Hiển thị đơn vị dựa trên discountType */}
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-primary">
            {d.discountType === 'PERCENTAGE'
                ? `${d.discountValue}%`
                : formatCurrency(d.discountValue)
            }
          </span>
                      {/* Hiển thị thêm mức giảm tối đa nếu là loại % */}
                      {d.discountType === 'PERCENTAGE' && d.maxDiscountAmount > 0 && (
                          <span className="text-[10px] text-gray-400 italic">
              Tối đa {formatCurrency(d.maxDiscountAmount)}
            </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    <div>{formatDateTime(d.startDate)}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">→ {formatDateTime(d.endDate)}</div>
                  </td>
                  <td className="px-5 py-3 text-center">{statusBadge(isActive(d))}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountManager;
