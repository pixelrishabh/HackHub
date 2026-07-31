import React, { useEffect, useState, useRef } from 'react';

export function AnimatedCounter({ value, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  // Safely convert value to string to prevent .replace errors on numbers or nulls
  const strVal = value !== null && value !== undefined ? String(value) : '0';
  const numericValue = parseFloat(strVal.replace(/[^0-9.]/g, '')) || 0;
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric || numericValue === 0) {
      setCount(numericValue);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;

          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // EaseOutQuad
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            setCount(Math.floor(easeProgress * numericValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(numericValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [numericValue, isNumeric, duration, hasAnimated]);

  if (!isNumeric) {
    return <span>{strVal}</span>;
  }

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
