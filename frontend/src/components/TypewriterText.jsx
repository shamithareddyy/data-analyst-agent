import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Typewriter text animation with blinking cursor.
 * @param {{ text: string, speed?: number, delay?: number, className?: string, cursorColor?: string }} props
 */
export default function TypewriterText({
    text,
    speed = 40,
    delay = 600,
    className = '',
    cursorColor = 'rgb(99,102,241)',
}) {
    const [displayed, setDisplayed] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayed('');

        const startTimeout = setTimeout(() => {
            const interval = setInterval(() => {
                indexRef.current++;
                setDisplayed(text.slice(0, indexRef.current));
                if (indexRef.current >= text.length) {
                    clearInterval(interval);
                    // Keep cursor blinking for a bit then hide
                    setTimeout(() => setShowCursor(false), 2500);
                }
            }, speed);
            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [text, speed, delay]);

    return (
        <span className={className}>
            {displayed}
            {showCursor && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(2)' }}
                    style={{ color: cursorColor, fontWeight: 300 }}
                >
                    |
                </motion.span>
            )}
        </span>
    );
}
