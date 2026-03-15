import React, { useState, useEffect, useCallback } from 'react';
import { adminBlogApi, adminBlogTopicApi, BlogPostResponse, BlogPostRequest, BlogTopicResponse, BlogTopicRequest, PageResponse } from '../../services/adminApi';
import { useConfirmDialog } from '../../components/ConfirmDialog';

const BlogManager: React.FC = () => {
  // Tab: 'posts' or 'topics'
  const [tab, setTab] = useState<'posts' | 'topics'>('posts');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý Blog</h2>
        <div className="flex bg-gray-100 dark:bg-surface-darker rounded-xl p-1">
          <button onClick={() => setTab('posts')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'posts' ? 'bg-white dark:bg-card-dark shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Bài viết</button>
          <button onClick={() => setTab('topics')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'topics' ? 'bg-white dark:bg-card-dark shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Chủ đề</button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          <span className="material-symbols-outlined text-lg">{msg.type === 'success' ? 'check_circle' : 'error'}</span>{msg.text}
        </div>
      )}

      {tab === 'topics' ? <TopicSection setMsg={setMsg} /> : <PostSection setMsg={setMsg} />}
    </div>
  );
};

/* ─────────────────── Topics ─────────────────── */
const TopicSection: React.FC<{ setMsg: (m: { type: 'success' | 'error'; text: string } | null) => void }> = ({ setMsg }) => {
  const [topics, setTopics] = useState<BlogTopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogTopicResponse | null>(null);
  const [form, setForm] = useState<BlogTopicRequest>({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBlogTopicApi.getAll();
      setTopics(res.data as BlogTopicResponse[]);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally {
      setLoading(false);
    }
  }, [setMsg]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const resetForm = () => { setForm({ name: '' }); setEditing(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Tên chủ đề không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminBlogTopicApi.update(editing.id, form);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminBlogTopicApi.create(form);
        setMsg({ type: 'success', text: 'Tạo chủ đề thành công!' });
      }
      resetForm(); fetchTopics();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally { setSaving(false); }
    setTimeout(() => setMsg(null), 3000);
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa chủ đề',
      message: 'Bạn có chắc chắn muốn xóa chủ đề này? Các bài viết thuộc chủ đề có thể bị ảnh hưởng.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminBlogTopicApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' }); fetchTopics();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm chủ đề
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Sửa chủ đề' : 'Thêm chủ đề'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên chủ đề *</label>
                <input value={form.name} onChange={e => setForm({ name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-red-700 disabled:opacity-50">{saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><span className="material-symbols-outlined animate-spin text-3xl text-gray-400">progress_activity</span></div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Chưa có chủ đề nào</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(t => (
            <div key={t.id} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 p-5 hover:shadow-lg transition-all flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(t); setForm({ name: t.name }); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-lg">edit</span></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"><span className="material-symbols-outlined text-lg">delete</span></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────── Posts ─────────────────── */
const PostSection: React.FC<{ setMsg: (m: { type: 'success' | 'error'; text: string } | null) => void }> = ({ setMsg }) => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [topics, setTopics] = useState<BlogTopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPostResponse | null>(null);
  const [form, setForm] = useState<BlogPostRequest>({ title: '', content: '', topicId: 0 });
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBlogApi.getAll({ page, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      const data = res.data as PageResponse<BlogPostResponse>;
      setPosts(data.data || []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally {
      setLoading(false);
    }
  }, [page, setMsg]);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await adminBlogTopicApi.getAll();
      setTopics(res.data as BlogTopicResponse[]);
    } catch {}
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const resetForm = () => { setForm({ title: '', content: '', topicId: topics[0]?.id || 0 }); setEditing(null); setShowForm(false); };

  const openCreate = () => { resetForm(); setForm(f => ({ ...f, topicId: topics[0]?.id || 0 })); setShowForm(true); };

  const openEdit = (p: BlogPostResponse) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content, topicId: p.topicId || 0 });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setMsg({ type: 'error', text: 'Tiêu đề không được trống' }); setTimeout(() => setMsg(null), 3000); return; }
    if (!form.content.trim()) { setMsg({ type: 'error', text: 'Nội dung không được trống' }); setTimeout(() => setMsg(null), 3000); return; }

    setSaving(true);
    try {
      if (editing) {
        await adminBlogApi.update(editing.id, form);
        setMsg({ type: 'success', text: 'Cập nhật thành công!' });
      } else {
        await adminBlogApi.create(form);
        setMsg({ type: 'success', text: 'Tạo bài viết thành công!' });
      }
      resetForm(); fetchPosts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Lỗi' });
    } finally { setSaving(false); }
    setTimeout(() => setMsg(null), 3000);
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminBlogApi.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa!' }); fetchPosts();
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Xóa thất bại' });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const getTopicName = (id: number) => topics.find(t => t.id === id)?.name || 'N/A';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems} bài viết</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span>Thêm bài viết
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chủ đề</label>
                <select value={form.topicId} onChange={e => setForm({ ...form, topicId: +e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value={0}>-- Chọn chủ đề --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} className="w-full px-4 py-2.5 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono text-sm" />
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
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tiêu đề</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Chủ đề</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tác giả</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có bài viết</td></tr>
              ) : posts.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{page * 10 + idx + 1}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white max-w-xs truncate">{p.title}</td>
                  <td className="px-5 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{getTopicName(p.topicId)}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{p.authorName || 'Tác giả'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-white/5">
            <span className="text-sm text-gray-500">Trang {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5">← Trước</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
