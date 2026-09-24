import React from 'react';
import { usePulseStore } from '../store/useStore';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';

export const PulseMeter = () => {
  const chiScore = usePulseStore(state => state.chiScore);
  
  let statusClass = 'text-accent-green border-accent-green';
  let label = 'Normal';
  let TrendIcon = TrendingUp;

  if (chiScore < 50) {
    statusClass = 'text-accent-red border-accent-red';
    label = 'Critical Alert';
    TrendIcon = TrendingDown;
  } else if (chiScore < 80) {
    statusClass = 'text-accent-yellow border-accent-yellow';
    label = 'Caution';
    TrendIcon = TrendingDown;
  }

  return (
    <div className="glass-panel p-6 flex flex-col items-center w-64">
      <div className={`relative flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 ${statusClass} mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
        <span className="text-5xl font-bold">{chiScore}</span>
        <span className="text-sm uppercase tracking-wider text-gray-400 mt-1">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <TrendIcon size={16} />
        <span className="text-sm">Real-time Index</span>
      </div>
    </div>
  );
};
