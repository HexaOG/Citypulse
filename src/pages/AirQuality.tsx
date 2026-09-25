import { useMemo, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { TimeTravelSlider } from '../components/TimeTravelSlider';
import { Wind, Activity, History, RotateCcw } from 'lucide-react';
import { usePulseStore } from '../store/useStore';
import { getHistoricalAQI } from '../utils/historicalSimulation';

export const AirQuality = () => {
  const replayOffsetHours = usePulseStore(state => state.replayOffsetHours);
  const setReplayOffsetHours = usePulseStore(state => state.setReplayOffsetHours);
  const setIsReplaying = usePulseStore(state => state.setIsReplaying);

  const [realtimeAqi, setRealtimeAqi] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Fetch live atmospheric AQI telemetry via Open-Meteo
    fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=26.9124&longitude=75.7873&current=us_aqi')
      .then(r => r.json())
      .then(d => {
        setRealtimeAqi(d.current.us_aqi);
      })
      .catch(e => console.warn('Real-time AQI unavailable, falling back to simulation', e));
  }, []);

  const aqiData = useMemo(() => {
    return getHistoricalAQI(replayOffsetHours, realtimeAqi);
  }, [replayOffsetHours, realtimeAqi]);

  const { aqi, pm25, pm10, ozone, status, isPoor, isModerate, synthesis } = aqiData;

  const textColor = isPoor ? 'text-rose-500' : (isModerate ? 'text-amber-500' : 'text-cyan-500');
  const textColorMuted = isPoor ? 'text-rose-500/80' : (isModerate ? 'text-amber-500/80' : 'text-cyan-500/80');
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
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-white/5 dark:text-white/5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${((Math.min(aqi, 500)) / 500) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                      className={`${textColor} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className={`text-4xl font-black font-mono tracking-tight ${textColor}`}>{aqi}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${textColorMuted}`}>{status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">PM2.5</span>
                  <span className="font-mono text-sm font-bold text-white">{pm25} µg/m³</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">PM10</span>
                  <span className="font-mono text-sm font-bold text-white">{pm10} µg/m³</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400">Ozone (O₃)</span>
                  <span className="font-mono text-sm font-bold text-white">{ozone} ppm</span>
                </div>
              </div>
            </div>

            {/* AI Synthesis Banner with Integrated Replay Header */}
            <div className={`glass-panel p-4 flex-1 flex flex-col gap-2.5 border-l-4 ${borderLeft} pointer-events-auto shadow-lg`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${bgOpacity} ${textColor}`}>
                    {replayOffsetHours < 0 ? <History size={18} /> : <Activity size={18} />}
                  </div>
                  <div className={`text-xs font-bold tracking-widest ${textColor}`}>
                    {replayOffsetHours < 0 ? 'HISTORICAL AIR QUALITY REPLAY' : 'ENVIRONMENTAL HEALTH ADVISORY'}
                  </div>
                </div>

                {replayOffsetHours < 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span>
                        SIMULATED REPLAY: <strong className="font-mono text-amber-300">T - {Math.abs(replayOffsetHours)} hrs</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setReplayOffsetHours(0);
                        setIsReplaying(false);
                      }}
                      title="Return to real-time live feed"
                      className="px-3 py-1 text-xs font-bold bg-amber-500/25 hover:bg-amber-400 text-amber-300 hover:text-black rounded-full border border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <RotateCcw size={12} />
                      <span>Return to Live ⚡</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-300 leading-relaxed pl-1">
                {synthesis}
              </div>
            </div>
          </div>
        </div>
        
        <TimeTravelSlider />
      </div>
    </div>
  );
};
