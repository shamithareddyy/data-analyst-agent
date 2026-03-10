import { useEffect, useRef, useState } from 'react';

/**
 * Smooth count-up animation for numbers.
 * @param {{ value: number|string, duration?: number, className?: string, prefix?: string, suffix?: string }} props
 */
export default function AnimatedCounter({
    value,
    duration = 1800,
    className = '',
    prefix = '',
    suffix = '',
}) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);

    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    const isValid = typeof numericValue === 'number' && isFinite(numericValue);

    useEffect(() => {
        if (!isValid) return;

        const target = numericValue;
        startRef.current = performance.now();
        const startVal = 0;

        const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const animate = (now) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = startVal + (target - startVal) * eased;

            setDisplay(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [numericValue, duration, isValid]);

    if (!isValid) return <span className={className}>{prefix}{value}{suffix}</span>;

    const formatted = Number.isInteger(numericValue)
        ? Math.round(display).toLocaleString()
        : display.toFixed(1);

    return (
        <span className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
