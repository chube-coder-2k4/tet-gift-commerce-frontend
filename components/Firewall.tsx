import React, { useEffect, useRef } from 'react';

export const Firewall: React.FC = () => {
    const fireworksRef = useRef<HTMLDivElement>(null);
    const fireworksInstance = useRef<any>(null);

    useEffect(() => {
    let isMounted = true; // Cờ kiểm tra component còn active không

    const initFireworks = async () => {
      if (!fireworksRef.current) return;

      try {
        const { Fireworks } = await import('https://cdn.jsdelivr.net/npm/fireworks-js@2.x/dist/index.es.js');

        // Quan trọng: Kiểm tra nếu component đã unmount trong lúc đang tải thư viện
        if (!isMounted) return;

        // Quan trọng: Xóa nội dung cũ trong ref để tránh trùng lặp Canvas (do Strict Mode)
        if (fireworksRef.current) {
          fireworksRef.current.innerHTML = '';
        }

        // Tạo instance mới
        const fw = new Fireworks(fireworksRef.current, {
          autoresize: true,
          opacity: 0.4,
          acceleration: 1.05,
          friction: 0.97,
          gravity: 2,
          particles: 120,
          traceLength: 3,
          traceSpeed: 10,
          explosion: 6,
          intensity: 150,
          flickering: 40,
          lineStyle: 'round',
          hue: { min: 0, max: 360 },
          delay: { min: 50, max: 150 },
          rocketsPoint: { min: 20, max: 80 },
          lineWidth: {
            explosion: { min: 1, max: 3 },
            trace: { min: 1, max: 2 }
          },
          brightness: { min: 50, max: 80 },
          decay: { min: 0.015, max: 0.03 },
          mouse: { click: false, move: false, max: 0 }
        });

        fireworksInstance.current = fw;
        fw.start();

        // Auto stop after 10 seconds
        setTimeout(() => {
          if (isMounted) {
            fw.waitStop(true); // waitStop mượt hơn stop() tức thì
            // Hoặc dùng fw.stop() nếu muốn tắt ngay lập tức
          }
        }, 10000);

      } catch (error) {
        console.error('Failed to load fireworks:', error);
      }
    };

    initFireworks();

    // Cleanup function
    return () => {
      isMounted = false; // Đánh dấu là đã unmount
      if (fireworksInstance.current) {
        fireworksInstance.current.stop();
        fireworksInstance.current = null;
      }
      // Dọn dẹp DOM canvas nếu cần thiết
      if (fireworksRef.current) {
        fireworksRef.current.innerHTML = '';
      }
    };
  }, []);
  return (
    <div
        ref={fireworksRef}
        className="fixed inset-0 pointer-events-none z-[1000]"
      />
  )
}