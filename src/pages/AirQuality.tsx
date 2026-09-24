import { useMemo } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Wind, Activity } from 'lucide-react';
import { usePulseStore } from '../store/useStore';

export const AirQuality = () => {
  const events = usePulseStore(state => state.events);
  const latestAQI = useMemo(() => events.slice().reverse().find(e => e.sourceFeed === 'aqi'), [events]);
  
  const aqiVal = latestAQI?.rawMetrics?.us_aqi ? Math.round(latestAQI.rawMetrics.us_aqi) : 0;
  const status = aqiVal < 50 ? 'GOOD' : (aqiVal < 100 ? 'MODERATE' : 'POOR');
  
  const isPoor = aqiVal >= 100;
  const isModerate = aqiVal >= 50 && aqiVal < 100;
  
  const textColor = isPoor ? 'text-rose-500' : (isModerate ? 'text-amber-500' : 'text-cyan-500');
  const textColorMuted = isPoor ? 'text-rose-500/80' : (isModerate ? 'text-amber-500/80' : 'text-cyan-500/80');
  const borderColor = isPoor ? 'border-rose-500' : (isModerate ? 'border-amber-500' : 'border-cyan-500');
  const borderOpacity = isPoor ? 'border-rose-500/30' : (isModerate ? 'border-amber-500/30' : 'border-cyan-500/30');
  const borderLeft = isPoor ? 'border-l-rose-500' : (isModerate ? 'border-l-amber-500' : 'border-l-cyan-500');
  const bgOpacity = isPoor ? 'bg-rose-500/20' : (isModerate ? 'bg-amber-500/20' : 'bg-cyan-500/20');

  return (
    <div className="relative w-full h-full">
      <CivicMap />
      
      {/* Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Header />
        
        <div className="absolute top-24 left-24 right-6 flex items-start justify-between pointer-events-none">
          <div className="flex gap-6 items-start w-full">
            {/* Key Metrics Card */}
            <div className={`glass-panel p-6 flex flex-col gap-4 w-72 pointer-events-auto`}>
              <h2 className={`text-xl font-bold tracking-wider mb-2 flex items-center gap-2 ${textColor}`}>
                <Wind className={`${textColor}`} /> AIR QUALITY
              </h2>
              
              <div className="flex flex-col items-center justify-center mb-4">
                <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${borderOpacity}`}>
                  <div className={`absolute inset-0 rounded-full border-4 ${borderColor} border-l-transparent animate-[spin_4s_linear_infinite]`} />
                  <div className="flex flex-col items-center">
                    <span className={`text-3xl font-bold ${textColor}`}>{aqiVal}</span>
                    <span className={`text-[10px] tracking-widest ${textColorMuted}`}>{status}</span>
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
            <div className={`glass-panel p-4 flex-1 flex items-center gap-4 border-l-4 ${borderLeft} pointer-events-auto`}>
              <div className={`p-3 ${bgOpacity} rounded-full ${textColor}`}>
                <Activity size={24} />
              </div>
              <div>
                <div className={`text-xs font-bold tracking-widest ${textColor} mb-1`}>HEALTH ADVISORY</div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {aqiVal < 100 
                    ? "Air quality is currently acceptable. No major health advisories in effect for the city." 
                    : "AQI elevated. Safe for general public, but sensitive groups caution advised. Wind patterns suggest dispersion by 18:00."}
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
