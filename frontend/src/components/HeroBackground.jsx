import React, { useEffect, useRef } from 'react';

export function HeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Particles setup
    const particleCount = Math.min(Math.floor(width * 0.08), 100);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        color: Math.random() > 0.35 ? 'rgba(255, 255, 255, ' : 'rgba(217, 246, 255, ',
        alpha: Math.random() * 0.7 + 0.1,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    let tick = 0;

    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // 1. Mouse Spotlight Ambient Glow
      const spotlightGlow = ctx.createRadialGradient(
        mouseX, mouseY, 10,
        mouseX, mouseY, Math.max(width * 0.4, 400)
      );
      spotlightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      spotlightGlow.addColorStop(0.3, 'rgba(174, 235, 255, 0.03)');
      spotlightGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = spotlightGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Aurora Waves (Gradient Mesh Lines)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const waveY = height * 0.3 + Math.sin(tick * 0.008 + i * 1.5) * 60;
        ctx.moveTo(0, waveY);

        for (let x = 0; x <= width; x += 40) {
          const y = waveY + Math.sin(x * 0.003 + tick * 0.01 + i) * 45;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const auroraGrad = ctx.createLinearGradient(0, waveY - 100, width, waveY + 200);
        auroraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        auroraGrad.addColorStop(0.5, i === 0 ? 'rgba(217, 246, 255, 0.035)' : 'rgba(255, 255, 255, 0.015)');
        auroraGrad.addColorStop(1, 'rgba(5, 5, 5, 0)');
        ctx.fillStyle = auroraGrad;
        ctx.fill();
      }
      ctx.restore();

      // 3. Floating Dust Particles & Micro-Stars
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(tick * p.pulseSpeed) * 0.009;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentAlpha = Math.max(0.05, Math.min(0.85, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        if (p.radius > 1.2) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Top Ambient White Volumetric Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-white/12 via-cyan-100/5 to-transparent blur-3xl rounded-full opacity-70 pointer-events-none" />
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#050505_95%)] pointer-events-none opacity-80" />
    </div>
  );
}

