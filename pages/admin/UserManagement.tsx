import React, { useState, useEffect } from 'react';
import { AdminUser, AdminRole, PageResponse } from '../../types';
import { adminUserApi, adminRoleApi } from '../../services/adminApi';

// Vietnamese role name mapping
const roleNameMap: Record<string, string> = {
  'ADMIN': 'Quản trị viên',
  'USER': 'Người dùng',
  'MANAGER': 'Quản lý',
  'STORE_OWNER': 'Chủ cửa hàng',
  'STAFF': 'Nhân viên',
};

const getRoleDisplayName = (roleName: string) => {
  return roleNameMap[roleName] || roleName;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    roleId: 2, // Default to USER role (id=2)
  });
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const pageSize = 10;

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page]);

  const loadRoles = async () => {
    try {
      const response = await adminRoleApi.getAll();
      const rolesData = response.data || [];
      // Add default roles if not present
      const defaultRoles: AdminRole[] = [
        { id: 1, name: 'ADMIN', description: 'Quản trị viên hệ thống' },
        { id: 2, name: 'USER', description: 'Người dùng thông thường' },
      ];
      if (rolesData.length === 0) {
        setRoles(defaultRoles);
      } else {
        setRoles(rolesData);
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
      // Fallback mock roles
      setRoles([
        { id: 1, name: 'ADMIN', description: 'Quản trị viên hệ thống' },
        { id: 2, name: 'USER', description: 'Người dùng thông thường' },
        { id: 3, name: 'MANAGER', description: 'Quản lý cửa hàng' },
        { id: 4, name: 'STORE_OWNER', description: 'Chủ cửa hàng' },
      ]);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setRoleError('Vui lòng nhập tên role');
      return;
    }
    setSubmitting(true);
    setRoleError(null);
    try {
      const result = await adminRoleApi.create({ 
        name: newRoleName.toUpperCase().replace(/\s+/g, '_'),
        description: newRoleDescription 
      });
      console.log('Role created:', result);
      setNewRoleName('');
      setNewRoleDescription('');
      await loadRoles(); // Wait for roles to reload
      alert(`Đã tạo role "${result.data.name}" thành công!`);
    } catch (err: any) {
      console.error('Create role error:', err);
      const errorMsg = err.message || 'Không thể tạo role mới. Có thể role đã tồn tại.';
      setRoleError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (roleName === 'ADMIN' || roleName === 'USER') {
      alert('Không thể xóa role hệ thống');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa role "${getRoleDisplayName(roleName)}"?`)) return;
    try {
      await adminRoleApi.delete(roleId);
      await loadRoles();
      alert(`Đã xóa role "${roleName}" thành công!`);
    } catch (err: any) {
      console.error('Delete role error:', err);
      alert(err.message || 'Không thể xóa role. Có thể role đang được sử dụng.');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUserApi.getAll(page, pageSize, 'id', 'desc');
      const usersData = response.data.content || [];
      setUsers(usersData);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Không thể tải danh sách user');
      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    // Generate unique username suggestion
    const timestamp = Date.now().toString().slice(-6);
    setFormData({ 
      fullName: '', 
      email: '', 
      username: `user${timestamp}`, 
      phone: '', 
      password: '', 
      roleId: 2 
    });
    setError(null);
    setShowModal(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      phone: user.phone || '',
      password: '',
      roleId: user.roles[0]?.id || 2,
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await adminUserApi.delete(id);
      await loadUsers();
      alert('Xóa user thành công!');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.message || 'Không thể xóa user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      if (editingUser) {
        await adminUserApi.update(editingUser.id, {
          fullName: formData.fullName,
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
        });
      } else {
        // Create new user
        console.log('Creating user:', formData);
        await adminUserApi.create({
          fullName: formData.fullName,
          email: formData.email,
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
        });
      }
      setShowModal(false);
      await loadUsers();
      alert(editingUser ? 'Cập nhật user thành công!' : 'Tạo user mới thành công!');
    } catch (err: any) {
      console.error('Failed to save user:', err);
      let errorMsg = err.message || 'Không thể lưu user.';
      if (errorMsg.includes('Username already exists')) {
        errorMsg = `Username "${formData.username}" đã tồn tại. Vui lòng chọn username khác.`;
      } else if (errorMsg.includes('Email already exists')) {
        errorMsg = `Email "${formData.email}" đã được sử dụng. Vui lòng dùng email khác.`;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            Quản lý Users
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tổng cộng {totalElements} users
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRoleModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-[#3a3330]/60 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">badge</span>
            Quản lý Role
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-glow"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Thêm User
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-[#3a3330]/60 p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
          />
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
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SĐT
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3a3330]/60">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                          {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.fullName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {user.username || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              role.name === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                            }`}
                          >
                            {getRoleDisplayName(role.name)}
                          </span>
                        )) || <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="size-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
              <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                {editingUser ? 'Chỉnh sửa User' : 'Thêm User mới'}
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
                  Họ tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ tên đầy đủ"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Tên đăng nhập"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vai trò
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {getRoleDisplayName(role.name)} ({role.name})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lưu ý: Backend tự động gán role USER. Để gán role khác, cần cập nhật trong DB.
                </p>
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
                  {submitting ? 'Đang xử lý...' : editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#3a3330]/60">
              <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                Quản lý Vai trò (Role)
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Create New Role */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-surface-dark rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tạo Role mới</h4>
                {roleError && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm mb-3">
                    {roleError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Tên role (VD: MANAGER, STORE_OWNER)"
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Mô tả (VD: Quản lý cửa hàng)"
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleCreateRole}
                  disabled={submitting || !newRoleName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  {submitting ? 'Đang tạo...' : 'Tạo Role'}
                </button>
              </div>

              {/* Existing Roles */}
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Danh sách Role hiện có</h4>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-dark rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-lg flex items-center justify-center ${
                        role.name === 'ADMIN' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                        role.name === 'USER' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                        role.name === 'MANAGER' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                        role.name === 'STORE_OWNER' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                        'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400'
                      }`}>
                        <span className="material-symbols-outlined">badge</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getRoleDisplayName(role.name)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {role.name} {role.description && `- ${role.description}`}
                        </p>
                      </div>
                    </div>
                    {role.name !== 'ADMIN' && role.name !== 'USER' && (
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        className="size-9 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    )}
                    {(role.name === 'ADMIN' || role.name === 'USER') && (
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        Hệ thống
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Create Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#3a3330]/60">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tạo nhanh vai trò phổ biến:</p>
                <div className="flex flex-wrap gap-2">
                  {!roles.find(r => r.name === 'MANAGER') && (
                    <button
                      onClick={() => {
                        setNewRoleName('MANAGER');
                        setNewRoleDescription('Quản lý cửa hàng');
                      }}
                      className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                    >
                      + Quản lý (MANAGER)
                    </button>
                  )}
                  {!roles.find(r => r.name === 'STORE_OWNER') && (
                    <button
                      onClick={() => {
                        setNewRoleName('STORE_OWNER');
                        setNewRoleDescription('Chủ cửa hàng');
                      }}
                      className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                    >
                      + Chủ cửa hàng (STORE_OWNER)
                    </button>
                  )}
                  {!roles.find(r => r.name === 'STAFF') && (
                    <button
                      onClick={() => {
                        setNewRoleName('STAFF');
                        setNewRoleDescription('Nhân viên');
                      }}
                      className="px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-colors"
                    >
                      + Nhân viên (STAFF)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-[#3a3330]/60 bg-gray-50 dark:bg-surface-dark">
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3a3330]/60 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
