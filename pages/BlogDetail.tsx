import React, { useState, useEffect } from 'react';
import { blogApi, BlogPostResponse } from '../services/blogApi';
import { Screen } from '../types';

interface BlogDetailProps {
  onNavigate: (screen: Screen) => void;
  blogPostId?: number;
  onBlogPostClick?: (id: number) => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ onNavigate, blogPostId, onBlogPostClick }) => {
  const [post, setPost] = useState<BlogPostResponse | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!blogPostId) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await blogApi.getById(blogPostId);
        setPost(res.data);
        // Fetch related posts (same topic or recent)
        try {
          const relRes = await blogApi.getAll({ page: 0, size: 4 });
          setRelatedPosts((relRes.data?.data || []).filter(p => p.id !== blogPostId).slice(0, 3));
        } catch {}
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [blogPostId]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 w-full bg-background-light dark:bg-background-dark py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4">article</span>
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy bài viết</p>
        <button onClick={() => onNavigate('blog')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
          Quay lại blog
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-background-light dark:bg-background-dark relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('blog')}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Quay lại blog</span>
        </button>
        
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
          <a onClick={() => onNavigate('home')} className="hover:text-primary transition-colors cursor-pointer">Trang chủ</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <a onClick={() => onNavigate('blog')} className="hover:text-primary transition-colors cursor-pointer">Tin tức</a>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{post.title}</span>
        </nav>

        <header className="max-w-4xl mx-auto text-center mb-12">
          {post.topicName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              {post.topicName}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.topicName && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                <span>{post.topicName}</span>
              </>
            )}
          </div>
        </header>

        {post.image && (
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
            <img src={post.image} alt={post.title} className="w-full aspect-[2/1] object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <article className="lg:col-span-8">
            <div 
              className="prose-custom text-gray-700 dark:text-gray-300 text-lg leading-8 space-y-6 font-light max-w-none
                [&_h1]:text-3xl [&_h1]:font-serif [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h1]:mt-10 [&_h1]:mb-4
                [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-4
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-6 [&_h3]:mb-3
                [&_p]:mb-4 [&_p]:leading-relaxed
                [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:list-disc
                [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:list-decimal
                [&_img]:rounded-xl [&_img]:border [&_img]:border-gray-200 [&_img]:dark:border-white/10 [&_img]:my-6 [&_img]:w-full
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400
                [&_a]:text-primary [&_a]:underline [&_a]:hover:text-red-600
                [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:dark:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm mr-2">Chủ đề:</span>
                {post.topicName && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">#{post.topicName}</span>
                )}
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4 space-y-8">
            {relatedPosts.length > 0 && (
              <div className="glass-panel p-6 rounded-xl border border-gray-200 dark:border-white/5">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 border-l-2 border-primary pl-3">Bài Viết Liên Quan</h3>
                <div className="flex flex-col gap-5">
                  {relatedPosts.map(related => (
                    <a key={related.id} className="group flex gap-4 items-start cursor-pointer" onClick={() => onBlogPostClick?.(related.id)}>
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-surface-dark dark:to-surface-darker flex items-center justify-center border border-gray-200 dark:border-white/5">
                        {related.image ? (
                          <img src={related.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:scale-110 transition-transform">article</span>
                        )}
                      </div>
                      <div className="flex-1">
                        {related.topicName && (
                          <span className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1 block">{related.topicName}</span>
                        )}
                        <h4 className="text-gray-900 dark:text-white text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{related.title}</h4>
                        <span className="text-xs text-gray-500 mt-2 block">{new Date(related.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10 flex items-center justify-center border border-gray-200 dark:border-white/5" onClick={() => onNavigate('shop')}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <span className="material-symbols-outlined text-[80px] text-primary/30">redeem</span>
              <div className="absolute bottom-0 left-0 w-full p-6 text-center">
                <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Ưu Đãi Đặc Biệt</p>
                <h3 className="text-2xl font-serif text-white mb-4">Khám Phá<br/>Quà Tết</h3>
                <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-glow hover:bg-red-600 transition-colors">Mua Ngay</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
