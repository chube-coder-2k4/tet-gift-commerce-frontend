import React, { useState, useEffect } from 'react';
import { Screen, User, Address } from '../types';
import { userApi, authApi, ApiError } from '../services/api';
import { addressApi } from '../services/addressApi';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'password'>('info');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    receiverName: '',
    phone: '',
    addressDetail: '',
    isDefault: false
  });

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      setIsLoadingAddresses(true);
      try {
        const response = await addressApi.getAll();
        setAddresses(response.data || []);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileError(null);
    setProfileSuccess(null);
    
    try {
      await userApi.updateProfile(user.id, {
        fullName: name,
        phone: phone || undefined,
      });

      const updatedUser: User = {
        ...user,
        name,
        phone,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
      setEditMode(false);
      setProfileSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Cập nhật thất bại. Vui lòng thử lại.');
      }
      setTimeout(() => setProfileError(null), 5000);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.receiverName || !newAddress.phone || !newAddress.addressDetail) {
      setProfileError('Vui lòng điền đầy đủ thông tin địa chỉ');
      setTimeout(() => setProfileError(null), 3000);
      return;
    }

    try {
      await addressApi.create({
        receiverName: newAddress.receiverName!,
        phone: newAddress.phone!,
        addressDetail: newAddress.addressDetail!,
        isDefault: addresses.length === 0 || newAddress.isDefault || false,
      });

      // Refresh danh sách địa chỉ
      const listResponse = await addressApi.getAll();
      setAddresses(listResponse.data || []);

      setIsAddingAddress(false);
      setNewAddress({ receiverName: '', phone: '', addressDetail: '', isDefault: false });
      setProfileSuccess('Thêm địa chỉ thành công!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Thêm địa chỉ thất bại. Vui lòng thử lại.');
      }
      setTimeout(() => setProfileError(null), 3000);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressApi.delete(id);
      setAddresses(addresses.filter(addr => addr.id !== id));
      setProfileSuccess('Xóa địa chỉ thành công!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Xóa địa chỉ thất bại.');
      }
      setTimeout(() => setProfileError(null), 3000);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      setProfileSuccess('Đã đặt địa chỉ mặc định!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Cập nhật thất bại.');
      }
      setTimeout(() => setProfileError(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    if (!newPassword || !oldPassword) {
      setProfileError('Vui lòng nhập đầy đủ mật khẩu cũ và mới.');
      setTimeout(() => setProfileError(null), 5000);
      return;
    }
    if (newPassword.length < 6) {
      setProfileError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setTimeout(() => setProfileError(null), 5000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileError('Mật khẩu xác nhận không khớp.');
      setTimeout(() => setProfileError(null), 5000);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setProfileSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Đổi mật khẩu thất bại. Vui lòng thử lại.');
      }
      setTimeout(() => setProfileError(null), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vui lòng đăng nhập</h2>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark min-h-screen py-8">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Quay lại</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-8 mb-6 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-6">
            <div className="size-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.phone && <p className="text-gray-600 dark:text-gray-400">{user.phone}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'address'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Địa chỉ nhận hàng
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'password'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Messages */}
        {profileError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{profileError}</p>
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-medium">{profileSuccess}</p>
          </div>
        )}

        {/* Content */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setName(user.name);
                      setEmail(user.email);
                      setPhone(user.phone || '');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-surface-dark hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-surface-darker disabled:cursor-not-allowed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-surface-darker disabled:cursor-not-allowed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-surface-darker disabled:cursor-not-allowed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="0901234567"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Địa chỉ nhận hàng</h2>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Thêm địa chỉ
              </button>
            </div>

            {/* Add/Edit Address Form */}
            {isAddingAddress && (
              <div className="mb-6 p-6 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thêm địa chỉ mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Tên người nhận"
                    value={newAddress.receiverName}
                    onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })}
                    className="px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ chi tiết (VD: 123 Đường ABC, Phường 1, Quận 1, TP.HCM)"
                    value={newAddress.addressDetail}
                    onChange={(e) => setNewAddress({ ...newAddress, addressDetail: e.target.value })}
                    className="md:col-span-2 px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <label className="md:col-span-2 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setIsAddingAddress(false);
                      setNewAddress({ receiverName: '', phone: '', addressDetail: '', isDefault: false });
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-surface-darker hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Lưu địa chỉ
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {isLoadingAddresses ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-4 animate-spin block">progress_activity</span>
                  <p>Đang tải địa chỉ...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4 opacity-30">location_off</span>
                  <p>Chưa có địa chỉ nào. Vui lòng thêm địa chỉ nhận hàng.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-xl border transition-all ${
                      addr.isDefault
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-dark'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{addr.receiverName}</h3>
                        {addr.isDefault && (
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded-full font-medium">Mặc định</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-primary hover:text-red-700 dark:hover:text-accent text-sm font-medium"
                          >
                            Đặt mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">{addr.phone}</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {addr.addressDetail}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-8 shadow-lg dark:shadow-2xl border border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Đổi mật khẩu</h2>

            <div className="max-w-md space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showOldPw ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPw(!showOldPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showOldPw ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showNewPw ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-amber-600 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showConfirmPw ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-600 mt-1">Mật khẩu xác nhận không khớp</p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="w-full py-3 bg-primary hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">lock_reset</span>
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
