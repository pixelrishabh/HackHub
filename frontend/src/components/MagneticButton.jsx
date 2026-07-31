import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function MagneticButton({ children, className = '', primary = false, onClick, to, ...props }) {
  const ref = useRef(null);

  // Magnetic Pull Coordinates
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.28);
    y.set(distanceY * 0.28);

    // Glow highlight inside button
    const localX = ((e.clientX - rect.left) / rect.width) * 100;
    const localY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x: localX, y: localY });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseStyles = primary
    ? 'bg-white text-black font-extrabold shadow-2xl border border-white hover:shadow-[0_0_50px_rgba(255,255,255,0.7)]'
    : 'bg-white/5 text-white font-semibold border border-white/20 backdrop-blur-xl hover:bg-white/12 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]';

  return (
    <motion.div
      ref={ref}
      style={{ x: dx, y: dy }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative group rounded-2xl"
    >
      {/* Interactive Radial Spotlight Follow inside Button */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(120px circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.35), transparent 70%)`,
        }}
      />
      <button
        onClick={onClick}
        className={`relative z-20 overflow-hidden rounded-2xl px-9 py-4 text-base transition-all duration-300 flex items-center justify-center space-x-3 ${baseStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
