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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
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
      'rgba(2, 132, 199, ',
      'rgba(37, 99, 235, ',
    ];

    const nodeLabels = [
      'Tier-1 Supplier',
      'JNPT Port Telemetry',
      'Mundra Hub',
      'NH-48 Corridor',
      'Assembly Plant',
      'Regional Warehouse',
      'Enterprise Distribution',
    ];

    const resizeCanvas = () => {
      updateSize();
      width = canvas.width;
      height = canvas.height;
    };

    window.addEventListener('resize', resizeCanvas);

    // Reduced Particle Count (Cleaner, non-cluttered layout: 24-28 prominent nodes)
    const totalParticles = 26;
    for (let i = 0; i < totalParticles; i++) {
      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * (height - 100) + 50;
      const size = Math.random() * 2.5 + 2.5;
      const alpha = Math.random() * 0.3 + 0.65;

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseSize: size,
        size,
        baseAlpha: alpha,
        alpha,
        color: colors[Math.floor(Math.random() * colors.length)],
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. ANIMATED WAVE GRAPH (Risk Telemetry Curve)
      // ==========================================
      ctx.beginPath();
      const waveY = height * 0.72;
      const waveStep = 8;

      ctx.moveTo(0, waveY);
      for (let x = 0; x <= width; x += waveStep) {
        const sineVal =
          Math.sin(x * 0.008 + frame * 0.02) * 22 +
          Math.sin(x * 0.015 - frame * 0.03) * 10;
        ctx.lineTo(x, waveY + sineVal);
      }

      // Gradient stroke for wave chart
      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, 'rgba(0, 102, 255, 0.05)');
      waveGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.45)');
      waveGrad.addColorStop(0.7, 'rgba(0, 102, 255, 0.45)');
      waveGrad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing data points along wave graph
      for (let x = 80; x < width; x += 220) {
        const sineVal =
          Math.sin(x * 0.008 + frame * 0.02) * 22 +
          Math.sin(x * 0.015 - frame * 0.03) * 10;
        const ptY = waveY + sineVal;

        ctx.beginPath();
        ctx.arc(x, ptY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 102, 255, 0.9)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, ptY, 8 + Math.sin(frame * 0.1) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ==========================================
      // 2. ANIMATED BAR GRAPH (Telemetry Signal Bars)
      // ==========================================
      const barXStart = width - 180;
      const barYBase = height * 0.35;
      const barWidth = 6;
      const barGap = 10;
      const numBars = 7;

      for (let b = 0; b < numBars; b++) {
        const barH = 15 + Math.sin(frame * 0.04 + b * 0.6) * 12 + Math.cos(frame * 0.02 + b) * 8;
        const bX = barXStart + b * (barWidth + barGap);
        const bY = barYBase - barH;

        const barGrad = ctx.createLinearGradient(0, barYBase, 0, bY);
        barGrad.addColorStop(0, 'rgba(0, 102, 255, 0.15)');
        barGrad.addColorStop(1, 'rgba(14, 165, 233, 0.7)');

        ctx.fillStyle = barGrad;
        ctx.fillRect(bX, bY, barWidth, barH);
      }

      // ==========================================
      // 3. REDUCED PERSISTENT PARTICLES & CONSTELLATION
      // ==========================================
      const interactionRadius = 180;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Autonomous floating motion
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off container boundaries
        if (p.x < 10 || p.x > width - 10) p.vx *= -1;
        if (p.y < 10 || p.y > height - 10) p.vy *= -1;

        let isHovered = false;

        // Interactive behavior when cursor is nearby
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius) {
            isHovered = true;
            const force = 1 - dist / interactionRadius;

            // Magnetic attraction / displacement
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 2.8;
            p.y -= Math.sin(angle) * force * 2.8;

            p.size = p.baseSize * (1 + force * 1.1);
            p.alpha = Math.min(1, p.baseAlpha + force * 0.35);

            // Glowing connection line to cursor
            const lineAlpha = force * 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(0, 102, 255, ${lineAlpha})`;
            ctx.lineWidth = 1.2 + force * 1.2;
            ctx.stroke();

            // Hover Telemetry Data Callout Box if labeled or active
            if (force > 0.45 && p.label) {
              ctx.font = '10px monospace';
              const textWidth = ctx.measureText(p.label).width;

              ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
              ctx.strokeStyle = 'rgba(0, 102, 255, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(p.x + 10, p.y - 20, textWidth + 14, 22, 6);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#0066FF';
              ctx.fillText(p.label, p.x + 17, p.y - 6);
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

        // Draw soft glow ring around particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.35})`;
        ctx.fill();

        // Radar target pulse ring around selected supply chain nodes
        if (p.label || isHovered) {
          const radarRadius = (frame * 0.8 + i * 15) % 35;
          const radarAlpha = (1 - radarRadius / 35) * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radarRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 102, 255, ${radarAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Inter-particle network lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const lineAlpha = (1 - dist / 135) * 0.35;
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
