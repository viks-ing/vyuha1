import React, { useEffect, useRef } from 'react';

interface PersistentParticle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  label?: string;
}

interface CursorParticleCanvasProps {
  className?: string;
}

export const CursorParticleCanvas: React.FC<CursorParticleCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let isVisible = true;
    let frame = 0;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    updateSize();

    let width = canvas.width;
    let height = canvas.height;

    const particles: PersistentParticle[] = [];

    // Electric Blue (#0066FF), Cyan (#0ea5e9), Sky Blue (#38bdf8)
    const colors = [
      'rgba(0, 102, 255, ',
      'rgba(14, 165, 233, ',
      'rgba(56, 189, 248, ',
      'rgba(37, 99, 235, ',
    ];

    const nodeLabels = [
      'JNPT Port Telemetry',
      'Mundra Hub',
      'NH-48 Corridor',
      'Assembly Hub',
      'Regional Warehouse',
    ];

    const resizeCanvas = () => {
      updateSize();
      width = canvas.width;
      height = canvas.height;
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Lightweight & Hyper-Optimized Particle Count (18 crisp nodes for 60fps smoothness)
    const totalParticles = 18;
    for (let i = 0; i < totalParticles; i++) {
      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * (height - 100) + 50;
      const size = Math.random() * 2.2 + 2.4;
      const alpha = Math.random() * 0.3 + 0.65;

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseSize: size,
        size,
        baseAlpha: alpha,
        alpha,
        color: colors[i % colors.length],
        label: i < nodeLabels.length ? nodeLabels[i] : undefined,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      if (
        relativeX >= 0 &&
        relativeX <= rect.width &&
        relativeY >= 0 &&
        relativeY <= rect.height
      ) {
        mouseRef.current.x = relativeX;
        mouseRef.current.y = relativeY;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // IntersectionObserver to freeze canvas when scrolled out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            animId = requestAnimationFrame(render);
          } else if (!isVisible && animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      if (document.hidden && animId) {
        cancelAnimationFrame(animId);
        animId = null;
      } else if (!document.hidden && isVisible && !animId) {
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible || document.hidden) {
        animId = null;
        return;
      }

      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. ANIMATED WAVE GRAPH (Fast Sine Wave)
      ctx.beginPath();
      const waveY = height * 0.75;
      const waveStep = 16; // Throttled step for fast render

      ctx.moveTo(0, waveY);
      for (let x = 0; x <= width; x += waveStep) {
        const sineVal = Math.sin(x * 0.008 + frame * 0.02) * 18;
        ctx.lineTo(x, waveY + sineVal);
      }
      ctx.strokeStyle = 'rgba(0, 102, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. PARTICLES & CONSTELLATION (Fast Squared Distance Checks)
      const interactionRadiusSq = 160 * 160;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 10 || p.x > width - 10) p.vx *= -1;
        if (p.y < 10 || p.y > height - 10) p.vy *= -1;

        let isHovered = false;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < interactionRadiusSq) {
            isHovered = true;
            const dist = Math.sqrt(distSq);
            const force = 1 - dist / 160;

            p.x -= (dx / (dist + 0.1)) * force * 2.5;
            p.y -= (dy / (dist + 0.1)) * force * 2.5;

            p.size = p.baseSize * (1 + force * 0.8);
            p.alpha = Math.min(1, p.baseAlpha + force * 0.3);

            // Laser line to cursor
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(0, 102, 255, ${force * 0.75})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            if (force > 0.5 && p.label) {
              ctx.font = '500 11px system-ui, sans-serif';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.strokeStyle = 'rgba(0, 102, 255, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(p.x + 10, p.y - 18, 130, 20, 5);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#0066FF';
              ctx.fillText(p.label, p.x + 16, p.y - 4);
            }
          } else {
            p.size += (p.baseSize - p.size) * 0.1;
            p.alpha += (p.baseAlpha - p.alpha) * 0.1;
          }
        } else {
          p.size += (p.baseSize - p.size) * 0.1;
          p.alpha += (p.baseAlpha - p.alpha) * 0.1;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Inter-particle network lines (Fast squared distance check < 120^2 = 14400)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 14400) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 transform-gpu will-change-transform ${className}`}
    />
  );
};
