import React, { useState } from 'react';

interface CopyTextButtonProps {
  text: string;
  className?: string;
  copiedLabel?: string;
  idleLabel?: string;
}

export const CopyTextButton: React.FC<CopyTextButtonProps> = ({
  text,
  className = '',
  copiedLabel = 'Đã copy',
  idleLabel = 'Copy',
}) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copyText}
      className={`inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-gray-300 dark:hover:border-primary/40 dark:hover:text-primary ${className}`}
      title={copied ? copiedLabel : idleLabel}
      aria-label={copied ? copiedLabel : idleLabel}
    >
      <span className="material-symbols-outlined text-sm leading-none">
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? copiedLabel : idleLabel}
    </button>
  );
};
