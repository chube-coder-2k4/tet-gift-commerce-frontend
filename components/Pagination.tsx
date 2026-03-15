import React from 'react';

export interface PaginationProps {
  /** Current page (0-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Display variant: 'numbered' shows page buttons, 'simple' shows prev/next only */
  variant?: 'numbered' | 'simple';
  /** Additional class for the container */
  className?: string;
  /** Max visible page buttons (for numbered variant with many pages). Default = 5 */
  maxVisible?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  variant = 'numbered',
  className = '',
  maxVisible = 5,
}) => {
  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    if (p >= 0 && p < totalPages) onPageChange(p);
  };

  // Compute visible page numbers with ellipsis logic
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, page - half);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    // Adjust start if end hit the boundary
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    // Always show first page
    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push('ellipsis');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages - 1);
    }

    return pages;
  };

  if (variant === 'simple') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Trang {page + 1} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            ← Trước
          </button>
          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Sau →
          </button>
        </div>
      </div>
    );
  }

  // Numbered variant
  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 0}
        className="size-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      {pageNumbers.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-gray-400 dark:text-gray-500 select-none">…</span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item)}
            className={`size-10 rounded-lg text-sm font-bold transition-all ${
              page === item
                ? 'bg-primary text-white shadow-md'
                : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {item + 1}
          </button>
        )
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages - 1}
        className="size-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  );
};

export default Pagination;
