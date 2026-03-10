import { useEffect, useRef } from 'react';

export default function CursorGlow() {
    const glowRef = useRef(null);
    const pos = useRef({ x: -200, y: -200 });
    const target = useRef({ x: -200, y: -200 });
    const raf = useRef(null);

    useEffect(() => {
        const update = () => {
            pos.current.x += (target.current.x - pos.current.x) * 0.12;
            pos.current.y += (target.current.y - pos.current.y) * 0.12;
            if (glowRef.current) {
                glowRef.current.style.transform = `translate(${pos.current.x - 200}px, ${pos.current.y - 200}px)`;
            }
            raf.current = requestAnimationFrame(update);
        };

        const handleMouse = (e) => {
            target.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouse);
        raf.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('mousemove', handleMouse);
            cancelAnimationFrame(raf.current);
        };
    }, []);

    return (
        <div
            ref={glowRef}
            className="fixed top-0 left-0 pointer-events-none"
            style={{
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
                zIndex: 9999,
                willChange: 'transform',
                mixBlendMode: 'screen',
            }}
        />
    );
}
