import React from 'react';
import { BLOG_POSTS } from '../constants';
import { Screen } from '../types';

interface BlogProps {
  onNavigate: (screen: Screen) => void;
}

const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 w-full bg-background-light dark:bg-background-dark">
      {/* Featured Post Header */}
      <section className="relative w-full py-16 lg:py-24 border-b border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 flex flex-col gap-6 z-10 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                  Featured Post
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span> 15 Jan, 2024
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-serif font-medium leading-[1.15] text-gray-900 dark:text-white tracking-tight">
                Ý Nghĩa Của Những Món <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-400 to-accent">Quà Tết Cổ Truyền</span>
              </h1>
              <p className="text-gray-600 dark:text-text-secondary text-lg leading-relaxed font-light line-clamp-3">
                Tết Nguyên Đán không chỉ là dịp đoàn viên mà còn là thời điểm để trao gửi những món quà ý nghĩa, thể hiện lòng tri ân và lời chúc phúc cho một năm mới an khang thịnh vượng. Cùng khám phá ý nghĩa sâu sắc đằng sau những giỏ quà truyền thống.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <button 
                  onClick={() => onNavigate('blog-detail')}
                  className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-red-600 transition-all shadow-glow hover:shadow-[0_0_30px_rgba(217,4,41,0.5)] flex items-center gap-2"
                >
                  Đọc Bài Viết
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group cursor-pointer" onClick={() => onNavigate('blog-detail')}>
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-[2rem] -z-10 transition-opacity duration-500 group-hover:opacity-30"></div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
                <img alt="Featured Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwzG3a-jHOHWrvj5WTR2kaCdOHE8DjnNQ0e1iXJNVTa-eiE3EEuR64UQWqdsxJx21I-5n5FiYbKi-47cnGy1MkYdvF9XDWIBEw0CRZ8YCi3Jbw6lg2p3LkrNvAY2UWYKpHMH2cAzHSRgHouxnNlmaaGrqfBjFt3nBDb_ELG8xJFZbrjVUJXgjlOVXPjUiELEUDXGvBCRbrLezmshMuwqZwGqMxMi1EnwveutVN5qyJf4aY7eo2Hq9zv2QO3QKH8fbTD0ttbZ7nsiA" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-gray-200 dark:border-white/10 pb-6">
          <div>
            <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">Bài Viết <span className="italic text-gray-500 dark:text-gray-400">Mới Nhất</span></h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-light">Cập nhật tin tức, xu hướng và mẹo chọn quà Tết.</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-background-dark text-sm font-bold whitespace-nowrap shadow-md">Tất cả</button>
            {['Gift Tips', 'New Collections', 'Tet Traditions'].map(tag => (
              <button key={tag} className="px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-sm font-medium whitespace-nowrap">{tag}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="group flex flex-col h-full bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-2xl transition-all duration-300 p-3 -mx-3 border border-transparent hover:border-gray-200 dark:hover:border-white/5 cursor-pointer" onClick={() => onNavigate('blog-detail')}>
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-5 border border-gray-200 dark:border-white/5">
                <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors"></div>
                <img alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" src={post.image} />
                <span className={`absolute top-4 left-4 z-20 px-3 py-1 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg
                  ${post.tag === 'Gift Tips' ? 'bg-primary/90 text-white' : 
                    post.tag === 'New Collections' ? 'bg-accent/90 text-black' : 
                    'bg-green-600/90 text-white'}
                `}>
                  {post.tag}
                </span>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {post.date}</span>
                  <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-700"></span>
                  <span>{post.readTime} read</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-text-secondary text-sm font-light leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-2">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors group/btn">
                    Read More 
                    <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover/btn:translate-x-1">arrow_right_alt</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
