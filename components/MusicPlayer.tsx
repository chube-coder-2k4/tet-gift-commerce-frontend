// src/components/MusicPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Khởi tạo Audio một lần duy nhất tại đây
    const audio = new Audio('/assets/sound/tetSound.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error('Lỗi phát nhạc:', err));
      setIsPlaying(true);
    }
  };

  return (
      <div className="fixed bottom-8 left-8 z-[1001] flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={toggleMusic}
          className={`relative group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-md overflow-visible ${
            isPlaying
              ? 'bg-gradient-to-tr from-[#D90429] via-[#ff0000] to-[#FFB703] text-white ring-4 ring-[#D90429]/20' // Đang phát: Màu đỏ vàng rực rỡ
              : 'bg-gray-900/80 hover:bg-gray-800 text-white/50 hover:text-white hover:scale-105 hover:border-primary/50' // Đang tắt: Màu tối
          }`}
          title={isPlaying ? 'Tắt nhạc Tết' : 'Bật nhạc Tết'}
        >
          {/* Hiệu ứng sóng âm lan tỏa (Chỉ hiện khi đang phát) */}
          {isPlaying && (
            <>
              <span className="absolute inset-0 rounded-full border border-white/40 animate-[ping_2s_linear_infinite] opacity-50"></span>
              <span className="absolute inset-0 rounded-full border border-yellow-400/30 animate-[ping_2s_linear_infinite_1s] opacity-30"></span>
            </>
          )}

          {/* Icon thay đổi theo trạng thái */}
          <span className={`material-symbols-outlined text-2xl drop-shadow-md transition-transform duration-300 ${isPlaying ? 'scale-110' : ''}`}>
            {isPlaying ? 'music_note' : 'play_arrow'} {/* Đổi icon thành Play khi đang tắt để mời gọi */}
          </span>

          {/* Tooltip hướng dẫn */}
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
            {isPlaying ? 'Tắt nhạc' : 'Bật nhạc Tết'}
          </div>
        </button>

        {/* Thanh Visualizer (Chỉ hiện khi đang phát) */}
        {isPlaying && (
          <div className="flex items-end gap-[3px] h-6 pb-1">
            <div className="w-1 bg-accent/80 rounded-t-sm animate-[pulse_0.6s_ease-in-out_infinite]" style={{height: '60%'}}></div>
            <div className="w-1 bg-accent/80 rounded-t-sm animate-[pulse_0.8s_ease-in-out_infinite]" style={{height: '100%'}}></div>
            <div className="w-1 bg-accent/80 rounded-t-sm animate-[pulse_0.5s_ease-in-out_infinite]" style={{height: '40%'}}></div>
            <div className="w-1 bg-accent/80 rounded-t-sm animate-[pulse_0.9s_ease-in-out_infinite]" style={{height: '80%'}}></div>
          </div>
        )}
      </div>
  );
};

export default MusicPlayer;