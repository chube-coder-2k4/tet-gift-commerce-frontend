
import React, { useState, useEffect, useCallback } from 'react';
import { adminInventoryApi, adminProductApi, PageResponse, ProductResponse } from '../../services/adminApi';
import Pagination from '../../components/Pagination';

interface InventoryBatchResponse {
    id: number;
    batchCode: string;
    productName: string;
    productId: number;
    importQuantity: number;
    currentQuantity: number;
    importPrice: number;
    manufactureDate: string;
    expiryDate: string;
}

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const InventoryManager: React.FC = () => {
    const [batches, setBatches] = useState<InventoryBatchResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // State cho tìm kiếm
    const [searchId, setSearchId] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);

    // State cho Modal Form
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [batchForm, setBatchForm] = useState({
        batchCode: '',
        importQuantity: 0,
        importPrice: 0,
        manufactureDate: '',
        expDate: ''
    });

    // 1. Logic Fetch dữ liệu (Tích hợp Tìm kiếm)
    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            if (searchId.trim()) {
                // Nếu có ID tìm kiếm -> Gọi API getBatchesByProduct
                const res = await adminInventoryApi.getBatchesByProduct(Number(searchId));
                // API này trả về mảng phẳng InventoryBatchResponse[]
                const data = res.data || [];
                setBatches(data);
                setTotalPages(0); // Không phân trang khi tìm theo ID cụ thể
                setTotalItems(data.length);
                setIsSearching(true);
            } else {
                // Ngược lại -> Gọi API getAllBatches (có phân trang)
                const res = await adminInventoryApi.getAllBatches({
                    page,
                    size: 10,
                    sortBy: 'expiryDate',
                    sortDir: 'asc'
                });
                const responseData = res.data as any;
                const finalData = responseData.data || responseData;
                const total = responseData.totalItems ?? responseData.totalElements ?? 0;

                setBatches(Array.isArray(finalData) ? finalData : (finalData.data || []));
                setTotalPages(responseData.totalPages || 0);
                setTotalItems(total);
                setIsSearching(false);
            }
        } catch (err: any) {
            console.error("Lỗi fetch:", err);
            setBatches([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchId]);

    const fetchProducts = async () => {
        try {
            const res = await adminProductApi.getAll({ size: 100 });
            const data = res.data as PageResponse<ProductResponse>;
            setProducts(data.data || []);
        } catch (err) {
            console.error("Lỗi fetch products", err);
        }
    };

    useEffect(() => { fetchBatches(); }, [fetchBatches]);
    useEffect(() => { fetchProducts(); }, []);

    const resetForm = () => {
        setSelectedProductId(0);
        setBatchForm({ batchCode: '', importQuantity: 0, importPrice: 0, manufactureDate: '', expDate: '' });
        setShowForm(false);
    };

    const handleClearSearch = () => {
        setSearchId('');
        setPage(0);
    };

    const handleImportSubmit = async () => {
        const product = products.find(p => p.id === selectedProductId);
        if (!product || !batchForm.batchCode) {
            setMsg({ type: 'error', text: 'Vui lòng điền đủ thông tin bắt buộc' });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: product.name,
                description: product.description,
                price: product.price,
                stock: batchForm.importQuantity,
                categoryId: product.categoryId,
                manufactureDate: batchForm.manufactureDate || undefined,
                expDate: batchForm.expDate || undefined,
                importQuantity: batchForm.importQuantity,
                batchCode: batchForm.batchCode,
                importPrice: batchForm.importPrice,
                images: []
            };

            await adminProductApi.create(payload as any);
            setMsg({ type: 'success', text: 'Nhập lô hàng mới thành công!' });
            resetForm();
            fetchBatches();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.message || 'Lỗi nhập kho' });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý kho hàng (Batches)</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isSearching ? `Kết quả tìm kiếm cho ID: ${searchId}` : `Tổng số: ${totalItems} lô hàng`}
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Search Input */}
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary">search</span>
                        <input
                            type="number"
                            placeholder="Tìm theo mã sản phẩm..."
                            className="pl-10 pr-10 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-card-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        {searchId && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">add_box</span> Nhập kho mới
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
                        {msg.text}
                    </div>
                </div>
            )}

            {/* Modal Nhập kho (Giữ nguyên logic form cũ) */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nhập lô hàng mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn sản phẩm nhập kho *</label>
                                <select
                                    className="w-full px-4 py-2.5 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(+e.target.value)}
                                >
                                    <option value={0}>-- Chọn sản phẩm --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {`${p.name} | Mã hàng: SP${String(p.id).padStart(4, '0')} | Tồn kho: ${p.stock}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã lô *</label>
                                    <input
                                        placeholder="VD: LO-XUAN-01"
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                        value={batchForm.batchCode}
                                        onChange={e => setBatchForm({...batchForm, batchCode: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập *</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                        value={batchForm.importPrice}
                                        onChange={e => setBatchForm({...batchForm, importPrice: +e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập *</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                        value={batchForm.importQuantity}
                                        onChange={e => setBatchForm({...batchForm, importQuantity: +e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                        value={batchForm.manufactureDate}
                                        onChange={e => setBatchForm({...batchForm, manufactureDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn *</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border rounded-xl dark:bg-surface-dark outline-none focus:border-primary"
                                    value={batchForm.expDate}
                                    onChange={e => setBatchForm({...batchForm, expDate: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={resetForm} className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 transition-colors font-medium">Hủy</button>
                                <button
                                    onClick={handleImportSubmit}
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                                >
                                    {saving ? 'Đang lưu...' : 'Xác nhận nhập'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng dữ liệu */}
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-surface-darker text-left">
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase w-[15%]">Mã Lô</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase w-[30%]">Sản phẩm</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-center w-[20%]">Tồn kho / Nhập</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-right w-[15%]">Giá nhập</th>
                            <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-center w-[20%]">Hạn sử dụng</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></td></tr>
                        ) : batches.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                        <p>{isSearching ? "Không tìm thấy lô hàng nào cho sản phẩm này" : "Chưa có lô hàng nào được ghi nhận"}</p>
                                        {isSearching && <button onClick={handleClearSearch} className="text-primary text-sm font-bold underline">Xem tất cả</button>}
                                    </div>
                                </td>
                            </tr>
                        ) : batches.map(batch => {
                            const stockPercent = (batch.currentQuantity / batch.importQuantity) * 100;
                            return (
                                <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{batch.batchCode}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">{batch.productName}</span>
                                            <span className="text-[10px] text-gray-500 mt-1">Mã hàng: <span className="font-medium text-primary">SP{String(batch.productId).padStart(4, '0')}</span></span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full ${stockPercent > 50 ? 'bg-green-500' : stockPercent > 10 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${stockPercent}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    {batch.currentQuantity} / {batch.importQuantity}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {formatCurrency(batch.importPrice)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            NSX: {new Date(batch.manufactureDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Ẩn phân trang khi đang tìm kiếm theo ID (vì API search trả về toàn bộ list) */}
                {!isSearching && totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        variant="simple"
                        className="px-5 py-3 border-t border-gray-200 dark:border-white/5"
                    />
                )}
            </div>
        </div>
    );
};

export default InventoryManager;