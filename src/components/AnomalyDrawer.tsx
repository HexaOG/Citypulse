import React from 'react';
import { usePulseStore } from '../store/useStore';
import { AlertTriangle, Link } from 'lucide-react';

export const AnomalyDrawer = () => {
  const anomalies = usePulseStore(state => state.anomalies);
  
  if (anomalies.length === 0) return null;

  return (
    <div className="absolute top-32 right-6 w-96 glass-panel flex flex-col z-10 max-h-[70vh]">
      <div className="flex justify-between items-center p-5 border-b border-white/10">
        <div className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={20} className="text-accent-yellow" />
          Active Anomalies
        </div>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Z &gt; 2.5</span>
      </div>
      
      <div className="p-5 overflow-y-auto flex flex-col gap-4">
        {anomalies.map((anom, idx) => (
          <div key={idx} className="bg-panel rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent-red">
                <Link size={16} /> {anom.title}
              </div>
              <div className="text-xs bg-white/10 px-2 py-1 rounded-full">{anom.confidence}% Conf</div>
            </div>
            
            <div className="text-sm text-gray-400 mb-3">
              {anom.description}
            </div>
            
            <div className="bg-background rounded-lg p-3 flex flex-col gap-2">
              <div className="text-xs font-semibold text-gray-400">Supporting Signals</div>
              {anom.supportingEvents.slice(0,3).map((ev: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="uppercase text-white">{ev.sourceFeed}</span> - {ev.category}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
