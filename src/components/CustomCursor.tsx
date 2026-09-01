import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices / small screens
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) return;

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, input, textarea, select, [role="button"], [data-cursor="hover"]');
      setHovering(!!interactive);
    };

    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed z-[9999] rounded-full mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          left: position.x,
          top: position.y,
          width: hovering ? 40 : 16,
          height: hovering ? 40 : 16,
          transform: 'translate(-50%, -50%)',
          background: 'rgba(52, 120, 246, 0.3)',
          transition: 'width 0.2s, height 0.2s, background 0.2s',
        }}
      />
      <div
        className="pointer-events-none fixed z-[9999] w-1.5 h-1.5 rounded-full bg-brand-500"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
