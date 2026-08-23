import React from 'react';
import { RippleGrid } from './RippleGrid';

export const RippleGridDemo: React.FC = () => {
  const supplyChainNodes = [
    { row: 1, col: 2, label: 'Raw Material Supplier' },
    { row: 2, col: 6, label: 'Mundra Port Hub' },
    { row: 4, col: 4, label: 'Manufacturing Plant' },
    { row: 6, col: 8, label: 'Regional Warehouse' },
    { row: 8, col: 5, label: 'Enterprise Customer' },
  ];

  return (
    <div className="p-8 bg-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-mono font-bold text-sky-400 uppercase tracking-wider">
          Interactive Supply Chain Telemetry Grid Demo
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Click any cell to simulate signal propagation across nodes
        </p>
      </div>

      <div className="overflow-auto max-w-full p-4 bg-slate-950/60 rounded-xl border border-slate-800">
        <RippleGrid
          size={10}
          cellSize={42}
          filledCells={supplyChainNodes}
          pulseColor="rgba(14, 165, 233, 0.85)"
          cellColor="rgba(30, 41, 59, 0.5)"
          borderColor="rgba(51, 65, 85, 0.6)"
        />
      </div>
    </div>
  );
};
