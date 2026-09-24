import React from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { AlertTriangle, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';

export const Complaints = () => {
  const incidents = [
    { type: 'Waterlogging', area: 'Sector 4', time: '10 min ago', status: 'Active' },
    { type: 'Power Outage', area: 'Sector 4', time: '25 min ago', status: 'Active' },
    { type: 'Pothole', area: 'Main Bypass', time: '1 hr ago', status: 'Investigating' }
  ];

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
                <AlertTriangle className="text-rose-500" /> 311 TICKETS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-rose-500/30">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-r-transparent animate-[spin_5s_linear_infinite_reverse]" />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-rose-500">89%</span>
                    <span className="text-[10px] tracking-widest text-gray-400">LOAD INDEX</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><TrendingUp size={12}/> OPEN</div>
                  <div className="text-lg font-mono font-bold text-rose-500">142</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><CheckCircle size={12}/> AVG TIME</div>
                  <div className="text-lg font-mono font-bold text-emerald-500">4.2h</div>
                </div>
              </div>

              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 mb-1">RECENT REPORTS</div>
                {incidents.map((incident, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
                    <div>
                      <div className="text-white">{incident.type}</div>
                      <div className="text-gray-500 text-[10px]">{incident.area} • {incident.time}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[9px] ${incident.status === 'Active' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className="glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 border-l-rose-500">
              <div className="p-3 bg-rose-500/20 rounded-full text-rose-500">
                <Lightbulb size={24} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-rose-500 mb-1">CROSS-FEED ANOMALY</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  Surge in power failure tickets clustered in Sector 4 following localized rainfall. High correlation with current storm cell. Dispatching emergency crews.
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
