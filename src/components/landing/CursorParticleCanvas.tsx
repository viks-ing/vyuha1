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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

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

    // Vibrant Electric Blue (#0066FF), Cyan (#0ea5e9), and Sky Blue (#38bdf8) Palette
    const colors = [
      'rgba(0, 102, 255, ',
      'rgba(14, 165, 233, ',
      'rgba(56, 189, 248, ',
      'rgba(2, 132, 199, ',
      'rgba(37, 99, 235, ',
    ];

    const resizeCanvas = () => {
      updateSize();
      width = canvas.width;
      height = canvas.height;
    };

    window.addEventListener('resize', resizeCanvas);

    // Populate pre-existing particle network
    const totalParticles = Math.min(85, Math.floor((width * height) / 8000));
    for (let i = 0; i < totalParticles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2.8 + 2.2;
      const alpha = Math.random() * 0.35 + 0.65; // High base opacity (0.65 to 1.0)

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        baseSize: size,
        size,
        baseAlpha: alpha,
        alpha,
        color: colors[Math.floor(Math.random() * colors.length)],
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const interactionRadius = 175;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Autonomous floating motion
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off container boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive behavior when cursor is nearby
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius) {
            const force = (1 - dist / interactionRadius);
            
            // Soft repel / magnet attraction blend
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 3.0;
            p.y -= Math.sin(angle) * force * 3.0;

            // Brighten & scale up on hover proximity
            p.size = p.baseSize * (1 + force * 1.0);
            p.alpha = Math.min(1, p.baseAlpha + force * 0.35);

            // Draw glowing laser line to cursor
            const lineAlpha = force * 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(0, 102, 255, ${lineAlpha})`;
            ctx.lineWidth = 1.2 + force * 1.2;
            ctx.stroke();
          } else {
            // Smooth reset to base size & alpha
            p.size += (p.baseSize - p.size) * 0.1;
            p.alpha += (p.baseAlpha - p.alpha) * 0.1;
          }
        } else {
          p.size += (p.baseSize - p.size) * 0.1;
          p.alpha += (p.baseAlpha - p.alpha) * 0.1;
        }

        // Draw individual particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Draw rich soft glow ring around particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.35})`;
        ctx.fill();

        // Inter-particle network lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.42;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};
