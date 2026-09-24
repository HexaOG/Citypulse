import React from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Wind, Activity, Zap } from 'lucide-react';

export const AirQuality = () => {
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
                <Wind className="text-cyan-500" /> AIR QUALITY
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-cyan-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-l-transparent animate-[spin_4s_linear_infinite]" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-cyan-500">42</span>
                    <span className="text-[10px] tracking-widest text-cyan-500/80">GOOD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">PM2.5</span>
                  <span className="font-mono text-sm">12 µg/m³</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">PM10</span>
                  <span className="font-mono text-sm">24 µg/m³</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">Ozone</span>
                  <span className="font-mono text-sm">0.03 ppm</span>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className="glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 border-l-cyan-500">
              <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-500">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-cyan-500 mb-1">HEALTH ADVISORY</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  AQI elevated near industrial district; safe for general public, sensitive groups caution advised. Wind patterns suggest dispersion by 18:00.
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
