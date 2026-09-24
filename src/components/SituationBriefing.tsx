import React from 'react';
import { usePulseStore } from '../store/useStore';

export const SituationBriefing = () => {
  const narrative = usePulseStore(state => state.narrative);
  
  return (
    <div className="glass-panel p-4 flex items-center gap-4 flex-grow ml-6">
      <div className="bg-accent-yellow/20 text-accent-yellow px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap">
        <div className="w-2 h-2 rounded-full bg-accent-yellow animate-pulse"></div>
        LIVE AI SYNTHESIS
      </div>
      <div className="text-lg">
        {narrative}
      </div>
    </div>
  );
};
