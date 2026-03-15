import React, { useState, useEffect, useCallback } from 'react';
import { adminUserApi, PageResponse } from '../../services/adminApi';
import { UserResponse } from '../../services/api';
import Pagination from '../../components/Pagination';
import { useConfirmDialog } from '../../components/ConfirmDialog';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const data = res.data as PageResponse<UserResponse>;
      setUsers(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi tải danh sách' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa người dùng',
      message: 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminUserApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa người dùng!' });
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await adminUserApi.update(editingUser.id, { fullName: editName, phone: editPhone || undefined });
      setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const openEdit = (u: UserResponse) => {
    setEditingUser(u);
    setEditName(u.fullName);
    setEditPhone(u.phone || '');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} người dùng</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          {msg.text}
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Chỉnh sửa người dùng: {editingUser.fullName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
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
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Họ tên</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Username</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">SĐT</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
              ) : users.map((u, idx) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{page * 10 + idx + 1}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 font-semibold">{u.fullName}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{u.username || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{u.phone || '—'}</td>
                  <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.roleName === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>{u.roleName || 'USER'}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors" title="Sửa"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors" title="Xóa"><span className="material-symbols-outlined text-lg">delete</span></button>
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

export default UserManager;
