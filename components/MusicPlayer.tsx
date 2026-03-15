// src/components/MusicPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio('https://res.cloudinary.com/dxkvlbzzu/video/upload/v1770445890/tetSound_e3uwo6.webm');
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
    <>
      <div className="fixed bottom-6 left-6 z-[1001] flex items-center gap-2">
        <button
          onClick={toggleMusic}
          className={`relative size-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg border backdrop-blur-md overflow-visible ${
            isPlaying
              ? 'bg-gradient-to-tr from-[#D90429] via-[#ff0000] to-[#FFB703] text-white border-white/30 ring-2 ring-[#D90429]/20'
              : 'bg-gray-900/70 hover:bg-gray-800 text-white/60 hover:text-white border-white/10 hover:border-primary/40 hover:scale-110'
          }`}
          title={isPlaying ? 'Tắt nhạc Tết' : 'Bật nhạc Tết'}
        >
          {/* Pulse ring khi đang phát */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border border-white/40 animate-music-ping"></span>
          )}

          {/* Bounce nhẹ khi chưa phát để mời gọi */}
          {!isPlaying && (
            <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-music-invite"></span>
          )}

          <span className={`material-symbols-outlined text-xl drop-shadow-md transition-transform duration-300 ${isPlaying ? 'animate-music-spin' : ''}`}>
            {isPlaying ? 'music_note' : 'play_arrow'}
          </span>
        </button>

        {/* Mini Visualizer khi đang phát */}
        {isPlaying && (
          <div className="flex items-end gap-[2px] h-4">
            <div className="w-[3px] bg-primary/70 rounded-t-sm animate-music-bar1" style={{height: '50%'}}></div>
            <div className="w-[3px] bg-primary/70 rounded-t-sm animate-music-bar2" style={{height: '100%'}}></div>
            <div className="w-[3px] bg-primary/70 rounded-t-sm animate-music-bar3" style={{height: '35%'}}></div>
            <div className="w-[3px] bg-primary/70 rounded-t-sm animate-music-bar4" style={{height: '75%'}}></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes music-ping {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-music-ping {
          animation: music-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes music-invite {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0; }
        }
        .animate-music-invite {
          animation: music-invite 2.5s ease-in-out infinite;
        }
        @keyframes music-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-music-spin {
          animation: music-spin 3s linear infinite;
        }
        @keyframes music-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .animate-music-bar1 { animation: music-bar 0.6s ease-in-out infinite; }
        .animate-music-bar2 { animation: music-bar 0.8s ease-in-out infinite 0.1s; }
        .animate-music-bar3 { animation: music-bar 0.5s ease-in-out infinite 0.2s; }
        .animate-music-bar4 { animation: music-bar 0.9s ease-in-out infinite 0.05s; }
      `}</style>
    </>
  );
};

export default MusicPlayer;