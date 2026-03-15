import React, { useState, useEffect } from 'react';
import { blogApi, blogTopicApi, BlogPostResponse, BlogTopic } from '../services/blogApi';
import { Screen } from '../types';

interface BlogProps {
  onNavigate: (screen: Screen) => void;
  onBlogPostClick?: (id: number) => void;
}

const Blog: React.FC<BlogProps> = ({ onNavigate, onBlogPostClick }) => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [featuredPost, setFeaturedPost] = useState<BlogPostResponse | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await blogTopicApi.getAll();
        setTopics(res.data || []);
      } catch (err) {
        console.error('Failed to fetch topics:', err);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { page, size: 9 };
        if (selectedTopicId) params.topicId = selectedTopicId;
        const res = await blogApi.getAll(params);
        const data = res.data;
        if (data) {
          setPosts(data.data || []);
          setTotalPages(data.totalPages || 0);
          if (page === 0 && !selectedTopicId && data.data?.length > 0) {
            setFeaturedPost(data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [page, selectedTopicId]);

  const handleTopicFilter = (topicId: number | null) => {
    setSelectedTopicId(topicId);
    setPage(0);
  };

  const handlePostClick = (postId: number) => {
    onBlogPostClick?.(postId);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateStr; }
  };

  const getExcerpt = (content: string, maxLen = 120) => {
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };

  const topicColors = ['bg-primary/90 text-white', 'bg-accent/90 text-black', 'bg-green-600/90 text-white', 'bg-blue-600/90 text-white', 'bg-purple-600/90 text-white'];

  return (
    <div className="flex-1 w-full bg-background-light dark:bg-background-dark">
      {/* Back Button */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <button 
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Quay lại</span>
        </button>
      </div>
      
      {/* Featured Post Header */}
      {featuredPost && (
        <section className="relative w-full py-16 lg:py-24 bg-gradient-to-br from-peach/30 via-blush/20 to-peach/30 dark:bg-transparent border-b border-primary/10 dark:border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 flex flex-col gap-6 z-10 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-primary dark:text-accent text-xs font-bold uppercase tracking-wider shadow-sm">
                    {featuredPost.topicName || 'Featured'}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span> {formatDate(featuredPost.createdAt)}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-serif font-medium leading-[1.15] text-gray-900 dark:text-white tracking-tight">
                  <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent">{featuredPost.title}</span>
                </h1>
                <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed font-light line-clamp-3">
                  {getExcerpt(featuredPost.content, 200)}
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <button 
                    onClick={() => handlePostClick(featuredPost.id)}
                    className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(217,4,41,0.5)] flex items-center gap-2"
                  >
                    Đọc Bài Viết
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative group cursor-pointer" onClick={() => handlePostClick(featuredPost.id)}>
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-[2rem] -z-10 transition-opacity duration-500 group-hover:opacity-30"></div>
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-primary/20 dark:border-white/10 shadow-2xl bg-gradient-to-br from-red-100 to-yellow-50 dark:from-primary/20 dark:to-accent/10 flex items-center justify-center">
                  {featuredPost.image ? (
                    <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <span className="material-symbols-outlined text-[120px] text-primary/30 dark:text-accent/30">article</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Post Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-primary/10 dark:border-white/10 pb-6">
          <div>
            <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">Bài Viết <span className="italic text-gray-500 dark:text-gray-400">Mới Nhất</span></h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Cập nhật tin tức, xu hướng và mẹo chọn quà Tết.</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => handleTopicFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-md transition-all ${
                selectedTopicId === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-background-dark'
                  : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              Tất cả
            </button>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicFilter(topic.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedTopicId === topic.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-background-dark font-bold shadow-md'
                    : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 block mb-4">article</span>
            <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <article key={post.id} className="group flex flex-col h-full bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-2xl transition-all duration-300 p-3 -mx-3 border border-transparent hover:border-gray-200 dark:hover:border-white/5 cursor-pointer" onClick={() => handlePostClick(post.id)}>
                  <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-5 border border-gray-200 dark:border-white/5 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-surface-dark dark:to-surface-darker flex items-center justify-center">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="material-symbols-outlined text-[60px] text-gray-300 dark:text-gray-600 group-hover:scale-110 transition-transform duration-500">article</span>
                    )}
                    {post.topicName && (
                      <span className={`absolute top-4 left-4 z-20 px-3 py-1 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg ${topicColors[idx % topicColors.length]}`}>
                        {post.topicName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 font-medium">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {formatDate(post.createdAt)}</span>
                      {post.topicName && (
                        <>
                          <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-700"></span>
                          <span>{post.topicName}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-text-secondary text-sm font-light leading-relaxed line-clamp-2 mb-4">
                      {getExcerpt(post.content)}
                    </p>
                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors group/btn">
                        Đọc thêm
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/btn:translate-x-1">arrow_right_alt</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                      page === i
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Blog;
