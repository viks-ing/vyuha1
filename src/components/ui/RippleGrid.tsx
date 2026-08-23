import React, { useEffect, useRef, useCallback } from 'react';
import '../../styles/ripple-grid.css';

export interface GridCellNode {
  row: number;
  col: number;
  label?: string;
}

export interface RippleGridProps {
  size?: number;
  rows?: number;
  cols?: number;
  filledCells?: GridCellNode[];
  cellSize?: number;
  cellColor?: string;
  filledCellColor?: string;
  pulseColor?: string;
  borderColor?: string;
  borderWidth?: number;
  pulseScale?: number;
  pulseDuration?: number;
  rippleDelay?: number;
  interactive?: boolean;
  className?: string;
  onCellClick?: (row: number, col: number, label?: string) => void;
}

export const RippleGrid: React.FC<RippleGridProps> = ({
  size = 12,
  rows,
  cols,
  filledCells = [],
  cellSize = 38,
  cellColor = 'rgba(241, 245, 249, 0.4)',
  filledCellColor = 'rgba(14, 165, 233, 0.15)',
  pulseColor = 'rgba(14, 165, 233, 0.8)',
  borderColor = 'rgba(226, 232, 240, 0.8)',
  borderWidth = 1,
  pulseScale = 1.25,
  pulseDuration = 600,
  rippleDelay = 45,
  interactive = true,
  className = '',
  onCellClick,
}) => {
  const gridRows = rows || size;
  const gridCols = cols || size;

  const gridRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Clean up all active animation timers on unmount
  useEffect(() => {
    const currentSet = timeoutsRef.current;
    return () => {
      currentSet.forEach((t) => clearTimeout(t));
      currentSet.clear();
    };
  }, []);

  const triggerRipple = useCallback(
    (targetRow: number, targetCol: number) => {
      if (!gridRef.current) return;

      const cellElements = gridRef.current.querySelectorAll<HTMLDivElement>('[data-cell]');

      cellElements.forEach((cellEl) => {
        const r = parseInt(cellEl.getAttribute('data-row') || '0', 10);
        const c = parseInt(cellEl.getAttribute('data-col') || '0', 10);

        // Calculate Manhattan distance (|r1 - r2| + |c1 - c2|)
        const distance = Math.abs(targetRow - r) + Math.abs(targetCol - c);
        const delay = distance * rippleDelay;

        const timer = setTimeout(() => {
          cellEl.style.setProperty('--pulse-scale', pulseScale.toString());
          cellEl.style.setProperty('--pulse-color', pulseColor);
          cellEl.style.animationDuration = `${pulseDuration}ms`;

          cellEl.classList.remove('ripple-cell-animating');
          // Force reflow to re-trigger CSS animation
          void cellEl.offsetWidth;
          cellEl.classList.add('ripple-cell-animating');

          const cleanupTimer = setTimeout(() => {
            cellEl.classList.remove('ripple-cell-animating');
            cellEl.style.removeProperty('--pulse-scale');
            cellEl.style.removeProperty('--pulse-color');
            cellEl.style.animationDuration = '';
            timeoutsRef.current.delete(cleanupTimer);
          }, pulseDuration);

          timeoutsRef.current.add(cleanupTimer);
          timeoutsRef.current.delete(timer);
        }, delay);

        timeoutsRef.current.add(timer);
      });
    },
    [pulseDuration, pulseScale, pulseColor, rippleDelay]
  );

  const handleCellClick = (r: number, c: number, label?: string) => {
    if (!interactive) return;
    triggerRipple(r, c);
    if (onCellClick) {
      onCellClick(r, c, label);
    }
  };

  const isFilled = (r: number, c: number): GridCellNode | undefined => {
    return filledCells.find((fc) => fc.row === r && fc.col === c);
  };

  return (
    <div
      ref={gridRef}
      className={`inline-grid gap-0 select-none ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
      }}
      role={interactive ? 'grid' : 'presentation'}
      aria-hidden={!interactive}
    >
      {Array.from({ length: gridRows }).map((_, r) =>
        Array.from({ length: gridCols }).map((_, c) => {
          const filledNode = isFilled(r, c);
          const isNode = Boolean(filledNode);

          return (
            <div
              key={`${r}-${c}`}
              data-cell="true"
              data-row={r}
              data-col={c}
              onClick={() => handleCellClick(r, c, filledNode?.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(r, c, filledNode?.label);
                }
              }}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'gridcell' : undefined}
              aria-label={
                interactive
                  ? filledNode?.label
                    ? `Supply chain node: ${filledNode.label}`
                    : `Grid cell row ${r + 1}, column ${c + 1}`
                  : undefined
              }
              title={filledNode?.label ? `Supply Chain Node: ${filledNode.label}` : undefined}
              className={`transition-colors duration-200 relative flex items-center justify-center ${
                interactive ? 'cursor-pointer hover:border-sky-400/80 hover:bg-sky-50/50' : 'pointer-events-none'
              } ${isNode ? 'ripple-cell-node' : ''}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: isNode ? filledCellColor : cellColor,
                borderStyle: 'solid',
                borderColor: isNode ? 'rgba(56, 189, 248, 0.6)' : borderColor,
                borderWidth: `${borderWidth}px`,
              }}
            >
              {filledNode?.label && (
                <span className="absolute -bottom-5 text-[9px] font-mono font-bold text-sky-700 bg-white/90 px-1 py-0.2 rounded border border-sky-200 shadow-2xs whitespace-nowrap pointer-events-none z-10 hidden sm:inline-block">
                  {filledNode.label}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
