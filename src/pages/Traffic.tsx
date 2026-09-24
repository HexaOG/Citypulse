import React, { useState } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Car, AlertCircle, Clock } from 'lucide-react';

export const Traffic = () => {
  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-24 right-6 flex items-start justify-between pointer-events-auto">
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className="glass-panel p-6 flex flex-col gap-4 w-72">
              <h2 className="text-xl font-bold tracking-wider mb-2 flex items-center gap-2">
                <Car className="text-amber-500" /> TRAFFIC STATUS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-amber-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-[spin_3s_linear_infinite]" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-amber-500">68%</span>
                    <span className="text-[10px] tracking-widest text-gray-400">CONGESTION</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Clock size={12}/> AVG DELAY</div>
                  <div className="text-lg font-mono font-bold text-rose-500">+14 mins</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><AlertCircle size={12}/> INCIDENTS</div>
                  <div className="text-lg font-mono font-bold text-amber-500">3 Active</div>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className="glass-panel p-4 flex-1 flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full text-amber-500">
                <Car size={24} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-amber-500 mb-1">LIVE AI SYNTHESIS</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  Main bypass congested due to localized waterlogging; traffic diverted via Ring Road. Consider alternative routes for the next 2 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <TimeTravelSlider />
      </div>
    </div>
  );
};
