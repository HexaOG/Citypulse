import { useMemo } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Car, AlertCircle, Clock } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const Traffic = () => {
  const events = usePulseStore(state => state.events);
  const latestTraffic = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'transit'), [events]);
  
  const delay = Math.round(latestTraffic?.rawMetrics?.delay_minutes ?? 0);
  const congestion = Math.min(100, delay * 8);

  const isCritical = delay > 25;
  const isWarning = delay > 10;
  
  const textColor = isCritical ? 'text-rose-500' : (isWarning ? 'text-amber-500' : 'text-emerald-500');
  const borderColor = isCritical ? 'border-rose-500' : (isWarning ? 'border-amber-500' : 'border-emerald-500');
  const borderOpacity = isCritical ? 'border-rose-500/30' : (isWarning ? 'border-amber-500/30' : 'border-emerald-500/30');
  const borderLeft = isCritical ? 'border-l-rose-500' : (isWarning ? 'border-l-amber-500' : 'border-l-emerald-500');
  const bgOpacity = isCritical ? 'bg-rose-500/20' : (isWarning ? 'bg-amber-500/20' : 'bg-emerald-500/20');

  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-24 right-6 flex items-start justify-between pointer-events-none">
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className="glass-panel p-6 flex flex-col gap-4 w-72 pointer-events-auto">
              <h2 className={`text-xl font-bold tracking-wider mb-2 flex items-center gap-2 ${textColor}`}>
                <Car className={`${textColor}`} /> TRAFFIC STATUS
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${borderOpacity}`}>
                  <div className={`absolute inset-0 rounded-full border-4 ${borderColor} border-t-transparent animate-[spin_3s_linear_infinite]`} />
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl font-bold ${textColor}`}>{congestion}%</span>
                    <span className="text-[10px] tracking-widest text-gray-400">CONGESTION</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Clock size={12}/> AVG DELAY</div>
                  <div className={`text-lg font-mono font-bold ${textColor}`}>+{delay} mins</div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><AlertCircle size={12}/> INCIDENTS</div>
                  <div className={`text-lg font-mono font-bold ${textColor}`}>{isCritical ? 3 : (isWarning ? 1 : 0)} Active</div>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner */}
            <div className={`glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 ${borderLeft} pointer-events-auto`}>
              <div className={`p-3 ${bgOpacity} rounded-full ${textColor}`}>
                <Car size={24} />
              </div>
              <div>
                <div className={`text-xs font-bold tracking-widest ${textColor} mb-1`}>LIVE AI SYNTHESIS</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {isCritical 
                    ? "Severe congestion detected. Main bypass clogged due to scattered incidents. Traffic diverted via Ring Road. Consider alternative routes for the next 2 hours."
                    : (isWarning ? "Moderate congestion building on major corridors. Adjust commute time by ~15 minutes." : "Traffic flowing nominally across all monitored sectors. No significant delays.")}
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
