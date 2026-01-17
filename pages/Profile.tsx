import React, { useState, useEffect } from 'react';
import { Screen, User, Address } from '../types';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'address'>('info');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      name,
      email,
      phone,
      addresses
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    onUpdateUser(updatedUser);
    setEditMode(false);
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.district) {
      alert('Vui lòng điền đầy đủ thông tin địa chỉ');
      return;
    }

    const address: Address = {
      id: Date.now(),
      name: newAddress.name!,
      phone: newAddress.phone!,
      address: newAddress.address!,
      city: newAddress.city!,
      district: newAddress.district!,
      isDefault: addresses.length === 0 || newAddress.isDefault || false
    };

    let updatedAddresses = [...addresses, address];
    
    // Nếu địa chỉ mới là default, bỏ default của các địa chỉ khác
    if (address.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === address.id ? addr : { ...addr, isDefault: false }
      );
    }

    setAddresses(updatedAddresses);
    
    if (user) {
      const updatedUser = { ...user, addresses: updatedAddresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
    }

    setIsAddingAddress(false);
    setNewAddress({
      name: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      isDefault: false
    });
  };

  const handleDeleteAddress = (id: number) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
    
    if (user) {
      const updatedUser = { ...user, addresses: updatedAddresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
    }
  };

  const handleSetDefaultAddress = (id: number) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    setAddresses(updatedAddresses);
    
    if (user) {
      const updatedUser = { ...user, addresses: updatedAddresses };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'address'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            Địa chỉ nhận hàng
          </button>
        </div>

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
                    placeholder="Họ và tên"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
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
                    placeholder="Địa chỉ"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    className="md:col-span-2 px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Quận/Huyện"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tỉnh/Thành phố"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
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
                      setNewAddress({ name: '', phone: '', address: '', city: '', district: '', isDefault: false });
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
              {addresses.length === 0 ? (
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">{addr.name}</h3>
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
                      {addr.address}, {addr.district}, {addr.city}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
